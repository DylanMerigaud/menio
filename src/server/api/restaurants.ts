import { z } from 'zod'
import {
  protectedProcedure,
  publicProcedure,
  createTRPCRouter,
} from '@/server/api/trpc'
import { TRPCError } from '@trpc/server'
import { type SocialNetworkType, type PrismaClient } from '@prisma/client'
import { generateSlug } from '@/utils/slug'

const RestaurantInfoSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(400),
  // Note: 'address' is still kept as a string for backwards compatibility
  address: z.string().min(1),
})

const AddressSchema = z.object({
  addressFormatted: z.string().optional().nullable(),
  street: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zip: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
})

const ContactInfoSchema = z.object({
  phone: z.string().min(1).optional().nullable(),
  email: z.string().email().optional().nullable(),
  website: z.string().url().optional().nullable(),
  reservationUrl: z.string().url().optional().nullable(),
})

const UploadSchema = z.object({
  url: z.string().url(),
  key: z.string(),
  name: z.string(),
  size: z.number(),
  type: z.string(),
})

const MenuUploadSchema = z.object({
  file: UploadSchema,
  title: z.string().default('Menu'),
})

const ImageUploadSchema = z.object({
  files: z.array(UploadSchema),
})

const TimeSlotSchema = z.object({
  open: z.string(),
  close: z.string(),
})

const OpeningHoursSchema = z.object({
  day: z.number().min(0).max(6), // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  isOpen: z.boolean(),
  openTimes: z.array(TimeSlotSchema),
})

// Helper function to fetch restaurant with related data
async function getRestaurantWithRelatedData(
  db: PrismaClient,
  filter: { ownerId?: string; id?: string; slug?: string },
) {
  // Get restaurant with all related data
  const restaurant = await db.restaurant.findFirst({
    where: filter,
    include: {
      openingHours: true,
      addressInfo: true,
      socialLinks: true,
    },
  })

  return restaurant
}

export const restaurantsRouter = createTRPCRouter({
  checkSlugAvailability: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ ctx, input }) => {
      // Generate a slug from the restaurant name
      const slug = generateSlug(input.name)

      // Check if a restaurant with this slug already exists
      const existingRestaurant = await ctx.db.restaurant.findFirst({
        where: {
          slug,
        },
        select: {
          id: true,
        },
      })

      return {
        available: !existingRestaurant,
        slug,
      }
    }),
  publishRestaurant: protectedProcedure
    .input(z.object({ restaurantId: z.string(), published: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      // Find the owner based on Clerk user ID
      const owner = await ctx.db.owner.findFirst({
        where: {
          userId: ctx.session.userId,
        },
        select: { id: true },
      })

      if (!owner) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Owner not found',
        })
      }

      // Get restaurant and make sure it belongs to this owner
      const restaurant = await ctx.db.restaurant.findFirst({
        where: {
          id: input.restaurantId,
          ownerId: owner.id,
        },
      })

      if (!restaurant) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Restaurant not found or does not belong to you',
        })
      }

      // If trying to publish, check subscription status
      if (input.published) {
        // Get the restaurant with subscription fields
        const restaurantWithSub = await ctx.db.restaurant.findUnique({
          where: { id: restaurant.id },
          select: {
            subscriptionStatus: true,
            trialEnd: true,
          },
        })

        // Use only Stripe's trial end date
        const trialEndDate = restaurantWithSub?.trialEnd || null

        const now = new Date()
        const isInFreeTrial = trialEndDate ? now < trialEndDate : false

        // Check if the restaurant has an active subscription
        const hasActiveSubscription =
          restaurantWithSub?.subscriptionStatus === 'ACTIVE' ||
          restaurantWithSub?.subscriptionStatus === 'TRIALING' ||
          restaurantWithSub?.subscriptionStatus === 'PAST_DUE' // Give grace period for past_due

        // Only allow publishing if in free trial or has active subscription
        if (!isInFreeTrial && !hasActiveSubscription) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Cannot publish restaurant without an active subscription',
          })
        }
      }

      // Update the restaurant published status
      const updatedRestaurant = await ctx.db.restaurant.update({
        where: {
          id: input.restaurantId,
        },
        data: {
          published: input.published,
        },
      })

      return updatedRestaurant
    }),
  deleteMenu: protectedProcedure
    .input(z.object({ menuId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Find the owner based on Clerk user ID
      const owner = await ctx.db.owner.findFirst({
        where: {
          userId: ctx.session.userId,
        },
        select: { id: true },
      })

      if (!owner) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Owner not found',
        })
      }

      // Get restaurant by owner ID
      const restaurant = await ctx.db.restaurant.findFirst({
        where: {
          ownerId: owner.id,
        },
        select: {
          id: true,
          menu: {
            select: {
              id: true,
              uploadId: true,
            },
          },
        },
      })

      if (!restaurant) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Restaurant not found',
        })
      }

      if (!restaurant.menu || restaurant.menu.id !== input.menuId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Menu not found',
        })
      }

      // Get the uploadId to delete it later
      const uploadId = restaurant.menu.uploadId

      // Delete menu reference
      await ctx.db.restaurantMenu.delete({
        where: {
          id: input.menuId,
        },
      })

      // Delete the upload
      await ctx.db.upload.delete({
        where: {
          id: uploadId,
        },
      })

      return { success: true }
    }),

  deleteImage: protectedProcedure
    .input(z.object({ imageId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Find the owner based on Clerk user ID
      const owner = await ctx.db.owner.findFirst({
        where: {
          userId: ctx.session.userId,
        },
        select: { id: true },
      })

      if (!owner) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Owner not found',
        })
      }

      // Get restaurant by owner ID
      const restaurant = await ctx.db.restaurant.findFirst({
        where: {
          ownerId: owner.id,
        },
        select: { id: true },
      })

      if (!restaurant) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Restaurant not found',
        })
      }

      // Find the image and make sure it belongs to this restaurant
      const image = await ctx.db.restaurantImage.findFirst({
        where: {
          id: input.imageId,
          restaurantId: restaurant.id,
        },
        select: {
          id: true,
          uploadId: true,
        },
      })

      if (!image) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Image not found',
        })
      }

      // Get the uploadId to delete it later
      const uploadId = image.uploadId

      // Delete image reference
      await ctx.db.restaurantImage.delete({
        where: {
          id: input.imageId,
        },
      })

      // Delete the upload
      await ctx.db.upload.delete({
        where: {
          id: uploadId,
        },
      })

      return { success: true }
    }),
  getRestaurantBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const restaurant = await ctx.db.restaurant.findUnique({
        where: {
          slug: input.slug,
        },
        include: {
          openingHours: true,
          addressInfo: true,
          images: {
            include: {
              upload: true,
            },
            orderBy: {
              displayOrder: 'asc',
            },
          },
          menu: {
            include: {
              upload: true,
            },
          },
          socialLinks: true,
        },
      })

      if (!restaurant || !restaurant.published) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Restaurant not found or not published',
        })
      }

      return restaurant
    }),
  getRestaurantWithOwner: protectedProcedure.query(async ({ ctx }) => {
    // Get the owner ID by user ID
    const owner = await ctx.db.owner.findFirst({
      where: {
        userId: ctx.session.userId,
      },
      select: {
        id: true,
        firstName: true,
      },
    })

    if (!owner) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Owner not found',
      })
    }

    // Get restaurant by owner ID
    const restaurant = await ctx.db.restaurant.findFirst({
      where: {
        ownerId: owner.id,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        published: true,
      },
    })

    if (!restaurant) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Restaurant not found',
      })
    }

    // Return restaurant with owner data
    return {
      ...restaurant,
      owner,
    }
  }),

  getRestaurantWithOpeningHours: protectedProcedure.query(async ({ ctx }) => {
    // Get the owner ID by user ID
    const owner = await ctx.db.owner.findFirst({
      where: {
        userId: ctx.session.userId,
      },
      select: {
        id: true,
      },
    })

    if (!owner) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Owner not found',
      })
    }

    const restaurant = await getRestaurantWithRelatedData(ctx.db, {
      ownerId: owner.id,
    })

    if (!restaurant) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Restaurant not found',
      })
    }

    return restaurant
  }),

  findRestaurantWithOpeningHours: protectedProcedure.query(async ({ ctx }) => {
    // Get the owner ID by user ID
    const owner = await ctx.db.owner.findFirst({
      where: {
        userId: ctx.session.userId,
      },
      select: {
        id: true,
      },
    })

    if (!owner) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Owner not found',
      })
    }

    return getRestaurantWithRelatedData(ctx.db, { ownerId: owner.id })
  }),

  getRestaurantMedias: protectedProcedure.query(async ({ ctx }) => {
    // Get the owner ID by user ID
    const owner = await ctx.db.owner.findFirst({
      where: {
        userId: ctx.session.userId,
      },
      select: {
        id: true,
      },
    })

    if (!owner) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Owner not found',
      })
    }

    // Get restaurant ID
    const restaurant = await ctx.db.restaurant.findFirst({
      where: {
        ownerId: owner.id,
      },
      select: {
        id: true,
      },
    })

    if (!restaurant) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Restaurant not found',
      })
    }

    // Get menu
    const menu = await ctx.db.restaurantMenu.findUnique({
      where: {
        restaurantId: restaurant.id,
      },
      include: {
        upload: true,
      },
    })

    // Get images
    const images = await ctx.db.restaurantImage.findMany({
      where: {
        restaurantId: restaurant.id,
      },
      include: {
        upload: true,
      },
      orderBy: {
        displayOrder: 'asc',
      },
    })

    return {
      menu,
      images,
    }
  }),

  getRestaurant: protectedProcedure.query(async ({ ctx }) => {
    // Find the owner based on the Clerk user ID
    const owner = await ctx.db.owner.findFirst({
      where: {
        userId: ctx.session.userId,
      },
      select: { id: true },
    })

    if (!owner) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Owner not found',
      })
    }

    // Find the restaurant using the owner ID
    const restaurant = await ctx.db.restaurant.findFirst({
      where: {
        ownerId: owner.id,
      },
    })

    if (!restaurant) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Restaurant not found',
      })
    }

    return restaurant
  }),

  upsertRestaurantInfo: protectedProcedure
    .input(RestaurantInfoSchema.merge(AddressSchema.partial()))
    .mutation(async ({ ctx, input }) => {
      // Find the owner based on Clerk user ID
      const owner = await ctx.db.owner.findFirst({
        where: {
          userId: ctx.session.userId,
        },
        select: { id: true },
      })

      if (!owner) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Owner not found',
        })
      }

      // Extract address fields from input
      const {
        addressFormatted,
        street,
        city,
        state,
        zip,
        country,
        latitude,
        longitude,
        ...restaurantData
      } = input

      // Check if the restaurant already exists
      const existingRestaurant = await ctx.db.restaurant.findFirst({
        where: {
          ownerId: owner.id,
        },
        include: {
          addressInfo: true,
        },
      })

      // Generate slug from restaurant name
      const slug = generateSlug(input.name)

      // Check if the slug is already taken by another restaurant
      if (input.name !== existingRestaurant?.name) {
        const duplicateSlug = await ctx.db.restaurant.findFirst({
          where: {
            slug,
            id: { not: existingRestaurant?.id }, // Exclude current restaurant
          },
          select: { id: true },
        })

        // If the slug is already taken, throw an error
        if (duplicateSlug) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'This restaurant name is already taken',
          })
        }
      }

      if (existingRestaurant) {
        // Update the existing restaurant
        const updatedRestaurant = await ctx.db.restaurant.update({
          where: {
            id: existingRestaurant.id,
          },
          data: {
            ...restaurantData,
            slug, // Update the slug as well
          },
        })

        // Update or create address info based on if there's address data to save
        if (addressFormatted || street || city || state || zip || country) {
          const addressData = {
            addressFormatted,
            street,
            city,
            state,
            zip,
            country,
          }

          if (existingRestaurant.addressInfo) {
            // Update existing address info
            await ctx.db.address.update({
              where: {
                restaurantId: existingRestaurant.id,
              },
              data: addressData,
            })
          } else {
            // Create new address info
            await ctx.db.address.create({
              data: {
                restaurantId: existingRestaurant.id,
                ...addressData,
              },
            })
          }
        }

        return updatedRestaurant
      } else {
        // Create a new restaurant
        // Slug is already generated above
        const restaurant = await ctx.db.restaurant.create({
          data: {
            name: input.name,
            description: input.description,
            address: input.address,
            slug,
            ownerId: owner.id,
          },
        })

        // Create address info if provided
        if (
          addressFormatted ||
          street ||
          city ||
          state ||
          zip ||
          country ||
          latitude ||
          longitude
        ) {
          await ctx.db.address.create({
            data: {
              restaurantId: restaurant.id,
              addressFormatted,
              street,
              city,
              state,
              zip,
              country,
              latitude,
              longitude,
            },
          })
        }

        return restaurant
      }
    }),

  upsertContactInfo: protectedProcedure
    .input(
      ContactInfoSchema.extend({
        facebook: z.string().optional().nullable(),
        instagram: z.string().optional().nullable(),
        x: z.string().optional().nullable(),
        tiktok: z.string().optional().nullable(),
        youtube: z.string().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Find the owner based on Clerk user ID
      const owner = await ctx.db.owner.findFirst({
        where: {
          userId: ctx.session.userId,
        },
        select: { id: true },
      })

      if (!owner) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Owner not found',
        })
      }

      // Get the restaurant ID based on owner ID
      const restaurant = await ctx.db.restaurant.findFirst({
        where: {
          ownerId: owner.id,
        },
        include: {
          socialLinks: true,
        },
      })

      if (!restaurant) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Restaurant not found',
        })
      }

      // Extract social media links from input
      const { facebook, instagram, x, tiktok, youtube, ...contactFields } =
        input

      // Update the restaurant with contact fields
      await ctx.db.restaurant.update({
        where: {
          id: restaurant.id,
        },
        data: contactFields,
      })

      // Update or create social links
      // First, delete existing links and recreate them
      await ctx.db.restaurantSocialLink.deleteMany({
        where: {
          restaurantId: restaurant.id,
        },
      })

      // Create array of social links to add
      const socialLinks: {
        restaurantId: string
        networkType: SocialNetworkType
        username: string
      }[] = []

      if (facebook) {
        socialLinks.push({
          restaurantId: restaurant.id,
          networkType: 'FACEBOOK',
          username: facebook,
        })
      }

      if (instagram) {
        socialLinks.push({
          restaurantId: restaurant.id,
          networkType: 'INSTAGRAM',
          username: instagram,
        })
      }

      if (x) {
        socialLinks.push({
          restaurantId: restaurant.id,
          networkType: 'X',
          username: x,
        })
      }

      if (tiktok) {
        socialLinks.push({
          restaurantId: restaurant.id,
          networkType: 'TIKTOK',
          username: tiktok,
        })
      }

      if (youtube) {
        socialLinks.push({
          restaurantId: restaurant.id,
          networkType: 'YOUTUBE',
          username: youtube,
        })
      }

      // Create all social links in batch if any exist
      if (socialLinks.length > 0) {
        await ctx.db.restaurantSocialLink.createMany({
          data: socialLinks,
        })
      }

      return { success: true }
    }),

  saveMenu: protectedProcedure
    .input(MenuUploadSchema)
    .mutation(async ({ ctx, input }) => {
      // Find the owner based on Clerk user ID
      const owner = await ctx.db.owner.findFirst({
        where: {
          userId: ctx.session.userId,
        },
        select: { id: true },
      })

      if (!owner) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Owner not found',
        })
      }

      // Get restaurant by owner ID
      const restaurant = await ctx.db.restaurant.findFirst({
        where: {
          ownerId: owner.id,
        },
        select: { id: true },
      })

      if (!restaurant) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Restaurant not found',
        })
      }

      // First create the upload record
      const upload = await ctx.db.upload.create({
        data: {
          url: input.file.url,
          key: input.file.key,
          name: input.file.name,
          size: input.file.size,
          type: input.file.type,
          userId: ctx.session.userId,
        },
      })

      // Check if a menu already exists for this restaurant
      const existingMenu = await ctx.db.restaurantMenu.findUnique({
        where: {
          restaurantId: restaurant.id,
        },
      })

      if (existingMenu) {
        // Update existing menu
        await ctx.db.restaurantMenu.update({
          where: {
            id: existingMenu.id,
          },
          data: {
            title: input.title,
            uploadId: upload.id,
          },
        })
      } else {
        // Create new menu
        await ctx.db.restaurantMenu.create({
          data: {
            title: input.title,
            restaurantId: restaurant.id,
            uploadId: upload.id,
          },
        })
      }

      return { success: true }
    }),

  saveImages: protectedProcedure
    .input(ImageUploadSchema)
    .mutation(async ({ ctx, input }) => {
      // Find the owner based on Clerk user ID
      const owner = await ctx.db.owner.findFirst({
        where: {
          userId: ctx.session.userId,
        },
        select: { id: true },
      })

      if (!owner) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Owner not found',
        })
      }

      // Get restaurant by owner ID
      const restaurant = await ctx.db.restaurant.findFirst({
        where: {
          ownerId: owner.id,
        },
        select: { id: true },
      })

      if (!restaurant) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Restaurant not found',
        })
      }

      // Create upload records and link to restaurant images
      const createdImages = await Promise.all(
        input.files.map(async (file, index) => {
          // Create the upload record
          const upload = await ctx.db.upload.create({
            data: {
              url: file.url,
              key: file.key,
              name: file.name,
              size: file.size,
              type: file.type,
              userId: ctx.session.userId,
            },
          })

          // Create the restaurant image record
          const image = await ctx.db.restaurantImage.create({
            data: {
              restaurantId: restaurant.id,
              uploadId: upload.id,
              displayOrder: index,
            },
          })

          return image
        }),
      )

      return { success: true, count: createdImages.length }
    }),

  upsertOpeningHours: protectedProcedure
    .input(z.array(OpeningHoursSchema))
    .mutation(async ({ ctx, input }) => {
      // Find the owner based on Clerk user ID
      const owner = await ctx.db.owner.findFirst({
        where: {
          userId: ctx.session.userId,
        },
        select: { id: true },
      })

      if (!owner) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Owner not found',
        })
      }

      // Get restaurant by owner ID
      const restaurant = await ctx.db.restaurant.findFirst({
        where: {
          ownerId: owner.id,
        },
        select: { id: true },
      })

      if (!restaurant) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Restaurant not found',
        })
      }

      // First delete all existing opening hours for this restaurant
      await ctx.db.openingHours.deleteMany({
        where: {
          restaurantId: restaurant.id,
        },
      })

      // Then insert the new opening hours
      const openingHoursCreated = await Promise.all(
        input.flatMap((day) => {
          // Skip closed days
          if (!day.isOpen || day.openTimes.length === 0) {
            return []
          }

          // For each time slot, create an opening hour entry
          return day.openTimes.map(async (timeSlot) => {
            // Parse the time strings to create UTC DateTime objects
            const [openHours, openMinutes] = timeSlot.open
              .split(':')
              .map(Number)
            const [closeHours, closeMinutes] = timeSlot.close
              .split(':')
              .map(Number)

            const openTime = new Date()
            openTime.setUTCHours(openHours, openMinutes, 0, 0)

            const closeTime = new Date()
            closeTime.setUTCHours(closeHours, closeMinutes, 0, 0)

            return ctx.db.openingHours.create({
              data: {
                restaurantId: restaurant.id,
                dayOfWeek: day.day,
                openTime,
                closeTime,
              },
            })
          })
        }),
      )

      return { success: true, count: openingHoursCreated.length }
    }),
})
