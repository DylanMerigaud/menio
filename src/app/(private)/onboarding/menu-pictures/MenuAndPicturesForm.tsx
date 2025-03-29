'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from '@/i18n/useTypedTranslations'
import { useRouter } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { FormButtons } from '@/components/ui/form-buttons'
import { api } from '@/trpc/react'
import UploadDropzone from '@/components/ui/upload-dropzone'
import { type ClientUploadedFileData } from 'uploadthing/types'
import Image from 'next/image'
import { Download, Loader2, Trash } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import async from './page'

export const MAX_FILES = 20

export default function MenuAndPicturesForm() {
  const t = useTranslations()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data: mediaData, refetch } =
    api.restaurants.getRestaurantMedias.useQuery()

  const form = useForm()
  // Define tRPC mutations
  const saveMenuMutation = api.restaurants.saveMenu.useMutation({
    onSuccess: () => refetch(),
  })
  const saveImagesMutation = api.restaurants.saveImages.useMutation({
    onSuccess: () => refetch(),
  })
  const deleteMenuMutation = api.restaurants.deleteMenu.useMutation({
    onSuccess: () => refetch(),
  })
  const deleteImageMutation = api.restaurants.deleteImage.useMutation({
    onSuccess: () => refetch(),
  })

  // Handle menu upload
  const handleMenuUploadComplete = (res: ClientUploadedFileData<unknown>[]) => {
    if (res && res.length > 0) {
      const file = res[0]

      saveMenuMutation.mutate(
        {
          file: {
            url: file.url,
            key: file.key,
            name: file.name,
            size: file.size,
            type: file.type || 'application/pdf',
          },
          title: 'Restaurant Menu',
        },
        {
          onSuccess: () => {
            console.log('Menu uploaded successfully')
          },
          onError: (error) => {
            console.error('Error uploading menu:', error)
          },
        },
      )
    }
  }

  // Handle image uploads
  const handleImagesUploadComplete = (
    res: Array<{
      name: string
      size: number
      key: string
      url: string
      type?: string
    }>,
  ) => {
    if (res && res.length > 0) {
      const files = res.map((file) => ({
        url: file.url,
        key: file.key,
        name: file.name,
        size: file.size,
        type: file.type || 'image/jpeg',
      }))

      saveImagesMutation.mutate(
        {
          files,
        },
        {
          onSuccess: (data) => {
            console.log(`${data.count} images uploaded successfully`)
          },
          onError: (error) => {
            console.error('Image upload error:', error)
          },
        },
      )
    }
  }

  // Handle next step
  const handleNext = () => {
    console.log('handleNext')
    setIsSubmitting(true)
    // Navigate to next step
    router.push('/onboarding/opening-times')
  }

  // Handler functions for deletions
  const handleDeleteMenu = (menuId: string) => {
    if (confirm(t('onboarding.menuAndPictures.confirmDeleteMenu'))) {
      deleteMenuMutation.mutate(
        { menuId },
        {
          onSuccess: () => {
            console.log('Menu deleted successfully')
          },
          onError: (error) => {
            console.error('Error deleting menu:', error)
          },
        },
      )
    }
  }

  const handleDeleteImage = (imageId: string) => {
    if (confirm(t('onboarding.menuAndPictures.confirmDeleteImage'))) {
      deleteImageMutation.mutate(
        { imageId },
        {
          onSuccess: () => {
            console.log('Image deleted successfully')
          },
          onError: (error) => {
            console.error('Error deleting image:', error)
          },
        },
      )
    }
  }

  // Lazy loading for PDFs and images
  const [visiblePDF, setVisiblePDF] = useState(false)
  const [visibleImages, setVisibleImages] = useState<string[]>([])

  // Intersection Observer for images
  useEffect(() => {
    const imgObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute('data-image-id')
          if (entry.isIntersecting && id && !visibleImages.includes(id)) {
            setVisibleImages((prev) => [...prev, id])
          }
        })
      },
      { rootMargin: '100px', threshold: 0.1 },
    )

    // Observe PDF
    const pdfEl = document.querySelector('.pdf-container')
    if (pdfEl) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setVisiblePDF(true)
            observer.disconnect()
          }
        },
        { rootMargin: '100px', threshold: 0.1 },
      )
      observer.observe(pdfEl)
    }

    // Observe images
    const imageElements = document.querySelectorAll('.image-observer')
    imageElements.forEach((el) => {
      imgObserver.observe(el)
    })

    return () => {
      imgObserver.disconnect()
    }
  }, [mediaData, visibleImages])

  // Rendering functions for existing uploads
  const renderExistingMenu = () => {
    if (!mediaData?.menu) return null

    const { id, upload } = mediaData.menu
    const isPdf = upload.type.includes('pdf')

    return (
      <div className="flex flex-col gap-6">
        <div className="overflow-hidden rounded border">
          {isPdf ? (
            <div className="pdf-container bg-muted/50 relative flex h-72 items-center justify-center">
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    window.open(upload.url, '_blank')
                  }}
                >
                  <Download />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleDeleteMenu(id)}
                >
                  <Trash />
                </Button>
              </div>

              {/* Placeholder while PDF is loading */}
              {!visiblePDF ? (
                <div className="flex h-full w-full items-center justify-center">
                  <div className="text-muted flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span>
                      {t('common.loadingPdf', { default: 'Loading PDF...' })}
                    </span>
                  </div>
                </div>
              ) : (
                <iframe
                  src={`${upload.url}#toolbar=0&navpanes=0`}
                  className="h-full w-full"
                  title={upload.name}
                  loading="lazy"
                />
              )}
            </div>
          ) : (
            <div className="pdf-container bg-muted/50 relative h-[200px]">
              <Image
                src={upload.url}
                alt={upload.name || 'Menu'}
                className="object-contain"
                fill
                loading="lazy"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
              />
            </div>
          )}
          <div className="p-3">
            <p className="truncate text-sm">{upload.name}</p>
          </div>
        </div>
      </div>
    )
  }

  const renderExistingImages = () => {
    if (!mediaData?.images || mediaData.images.length === 0) return null

    return (
      <div className="mb-4 p-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {mediaData.images.map((image) => (
            <div
              key={image.id}
              data-image-id={image.id}
              className="image-observer group relative overflow-hidden rounded border"
            >
              {/* Image container with fixed aspect ratio */}
              <div className="relative aspect-square">
                {visibleImages.includes(image.id) ? (
                  <Image
                    src={image.upload.url}
                    alt={image.alt || 'Restaurant image'}
                    className="object-cover"
                    fill
                    loading="lazy"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                    decoding="async"
                  />
                ) : (
                  <div className="bg-muted/30 flex h-full w-full items-center justify-center">
                    <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
                  </div>
                )}

                {/* Delete button */}
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      window.open(image.upload.url, '_blank')
                    }}
                  >
                    <Download />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleDeleteImage(image.id)}
                    disabled={
                      deleteImageMutation.isPending &&
                      deleteImageMutation.variables?.imageId === image.id
                    }
                  >
                    {deleteImageMutation.isPending &&
                    deleteImageMutation.variables?.imageId === image.id ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Trash />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={form.handleSubmit(handleNext)} className="space-y-8">
      <div className="flex flex-col gap-12">
        <div className="flex flex-col gap-4">
          {renderExistingMenu()}

          <div className="grid gap-2">
            <Label>
              {t('common.uploadRestaurantMenu')}
              <span className="text-muted-foreground ml-2 text-sm">
                {t('common.left_parenthesis')}
                {t('common.optional')}
                {t('common.right_parenthesis')}
              </span>
            </Label>

            <UploadDropzone
              endpoint="restaurantMenu"
              className="ut-button:bg-primary"
              onClientUploadComplete={(res) =>
                handleMenuUploadComplete(
                  res as ClientUploadedFileData<unknown>[],
                )
              }
              onUploadError={(error) =>
                console.error('Error uploading menu:', error)
              }
              showPreview={true}
              multiple={false}
              previewType="list"
            />
          </div>
        </div>

        <Separator />

        <div>
          <div className="flex flex-col gap-4">
            {renderExistingImages()}

            {mediaData?.images?.length !== MAX_FILES && (
              <div className="grid gap-2">
                <Label>
                  {t('common.uploadRestaurantPhotos')}
                  <span className="text-muted-foreground ml-2 text-sm">
                    {t('common.left_parenthesis')}
                    {t('common.optional')}
                    {t('common.right_parenthesis')}
                  </span>
                </Label>
                <UploadDropzone
                  endpoint="restaurantPictures"
                  onClientUploadComplete={(res) =>
                    handleImagesUploadComplete(res)
                  }
                  onUploadError={(error) =>
                    console.error('Error uploading images:', error)
                  }
                  className="ut-button:bg-primary"
                  maxFiles={MAX_FILES - (mediaData?.images?.length || 0)}
                  showPreview={true}
                  multiple={true}
                  previewType="grid"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <FormButtons
        isPending={isSubmitting}
        previousHref="/onboarding/restaurant-info"
      />
    </form>
  )
}
