'use client'

import { useForm } from 'react-hook-form'
import { useTranslations } from '@/i18n/useTypedTranslations'
import { useRouter } from '@/i18n/routing'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormButtons } from '@/components/ui/form-buttons'
import { api } from '@/utils/trpc'
import { useState, useRef } from 'react'
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api'
import { GOOGLE_MAPS_API_ID, GOOGLE_MAPS_LIBRARIES } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'
import { generateSlug } from '@/utils/slug'

// Extended form values with detailed address fields
type FormValues = {
  name: string
  description: string
  address: string
  // Address details fields
  addressFormatted?: string
  street?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  latitude?: number
  longitude?: number
}

export default function RestaurantInfoForm() {
  const t = useTranslations()
  const router = useRouter()
  const { data: restaurantWithDetails } =
    api.restaurants.findRestaurantWithOpeningHours.useQuery()

  // Add state for slug availability validation
  const [isCheckingSlug, setIsCheckingSlug] = useState(false)
  const [slugValidation, setSlugValidation] = useState<{
    available: boolean
    slug: string
    checked: boolean
  }>({
    available: true,
    slug: '',
    checked: false,
  })
  const nameDebounceTimer = useRef<NodeJS.Timeout | null>(null)

  // Load Google Maps JS API using the useJsApiLoader hook
  const { isLoaded, loadError } = useJsApiLoader({
    id: GOOGLE_MAPS_API_ID,
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: GOOGLE_MAPS_LIBRARIES,
  })

  // State for Google Maps Place Autocomplete
  const [addressAutocomplete, setAddressAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null)

  const mutation = api.restaurants.upsertRestaurantInfo.useMutation({
    onSuccess: () => {
      // Track successful form submission
      void import('@/providers/PostHogEvents').then((module) => {
        module.trackOnboardingStepComplete('restaurant-info', true)
      })
      router.push('/onboarding/menu-pictures')
    },
    onError: (error) => {
      // Track failed form submission
      void import('@/providers/PostHogEvents').then((module) => {
        module.trackOnboardingStepComplete('restaurant-info', false)
      })
      console.error(error)
    },
  })

  // Slug availability check query
  const slugAvailabilityQuery = api.restaurants.checkSlugAvailability.useQuery(
    { name: slugValidation.slug },
    {
      enabled: slugValidation.slug !== '' && !slugValidation.checked,
      refetchOnWindowFocus: false,
    },
  )

  // Handle success of slug availability query
  if (slugAvailabilityQuery.data && !slugValidation.checked) {
    const { available, slug } = slugAvailabilityQuery.data
    // Track slug availability check
    void import('@/providers/PostHogEvents').then((module) => {
      module.trackSlugCheck(slug, available)
    })

    setSlugValidation({
      available,
      slug,
      checked: true,
    })
    setIsCheckingSlug(false)
  }

  // Handle error of slug availability query
  if (slugAvailabilityQuery.error && isCheckingSlug) {
    setIsCheckingSlug(false)
  }

  const form = useForm<FormValues>({
    defaultValues: {
      name: restaurantWithDetails?.name || '',
      description: restaurantWithDetails?.description || '',
      address: restaurantWithDetails?.address || '',
      addressFormatted:
        restaurantWithDetails?.addressInfo?.addressFormatted || '',
      street: restaurantWithDetails?.addressInfo?.street || '',
      city: restaurantWithDetails?.addressInfo?.city || '',
      state: restaurantWithDetails?.addressInfo?.state || '',
      zip: restaurantWithDetails?.addressInfo?.zip || '',
      country: restaurantWithDetails?.addressInfo?.country || '',
      latitude: restaurantWithDetails?.addressInfo?.latitude || undefined,
      longitude: restaurantWithDetails?.addressInfo?.longitude || undefined,
    },
  })

  // Handle place selection for address
  const onAddressPlaceChanged = () => {
    if (addressAutocomplete) {
      const place = addressAutocomplete.getPlace()

      if (place?.formatted_address) {
        // Update form with place details
        const formattedAddress = place.formatted_address
        form.setValue('address', formattedAddress)
        form.setValue('addressFormatted', formattedAddress)

        // Track address selection
        const hasCoordinates = !!place.geometry?.location
        void import('@/providers/PostHogEvents').then((module) => {
          module.trackAddressSelect(formattedAddress, hasCoordinates)
        })

        // Extract address components
        let street = '',
          city = '',
          state = '',
          zip = '',
          country = ''

        place.address_components?.forEach((component) => {
          const types = component.types

          if (types.includes('street_number')) {
            street = component.long_name + ' ' + street
          }

          if (types.includes('route')) {
            street += component.long_name
          }

          if (types.includes('locality')) {
            city = component.long_name
          }

          if (types.includes('administrative_area_level_1')) {
            state = component.long_name
          }

          if (types.includes('postal_code')) {
            zip = component.long_name
          }

          if (types.includes('country')) {
            country = component.long_name
          }
        })

        // Extract latitude and longitude
        if (place.geometry?.location) {
          const lat = place.geometry.location.lat()
          const lng = place.geometry.location.lng()
          form.setValue('latitude', lat)
          form.setValue('longitude', lng)
        }

        // Set the form values
        form.setValue('street', street)
        form.setValue('city', city)
        form.setValue('state', state)
        form.setValue('zip', zip)
        form.setValue('country', country)
      }
    }
  }

  // Set the address autocomplete instance when it loads
  const onAddressAutocompleteLoad = (
    autocompleteInstance: google.maps.places.Autocomplete,
  ) => {
    setAddressAutocomplete(autocompleteInstance)
  }

  // Handle name blur to check slug availability
  const handleNameBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const name = event.target.value.trim()
    if (name && name !== restaurantWithDetails?.name) {
      // Clear any previous debounce
      if (nameDebounceTimer.current) {
        clearTimeout(nameDebounceTimer.current)
      }

      setIsCheckingSlug(true)

      // Set a slight delay to avoid too many requests
      nameDebounceTimer.current = setTimeout(() => {
        const slug = generateSlug(name)

        setSlugValidation({
          ...slugValidation,
          slug,
          checked: false,
        })
      }, 300)
    } else if (name === restaurantWithDetails?.name) {
      // If the name hasn't changed, no need to check
      setSlugValidation({
        available: true,
        slug: '',
        checked: true,
      })
    }
  }

  function onSubmit(data: FormValues) {
    mutation.mutate({
      name: data.name,
      description: data.description,
      address: data.address,
      // Include address details
      addressFormatted: data.addressFormatted,
      street: data.street,
      city: data.city,
      state: data.state,
      zip: data.zip,
      country: data.country,
      latitude: data.latitude,
      longitude: data.longitude,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          rules={{
            required: true,
            maxLength: 100,
            validate: {
              available: () => {
                // Skip validation if we're keeping the existing name
                if (form.getValues('name') === restaurantWithDetails?.name) {
                  return true
                }
                return slugValidation.available
              },
            },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('onboarding.restaurantInfo.name')}
                <span className="text-destructive ml-1">
                  {t('common.required_asterisk')}
                </span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    required
                    minLength={1}
                    maxLength={100}
                    placeholder="Brasserie de Paris"
                    onBlur={(e) => {
                      field.onBlur()
                      handleNameBlur(e)
                    }}
                  />
                  {isCheckingSlug && (
                    <div className="text-muted-foreground mt-1 flex items-center text-sm">
                      <span className="mr-2">{t('common.checking')}</span>
                    </div>
                  )}
                  {!isCheckingSlug &&
                    slugValidation.checked &&
                    !slugValidation.available &&
                    field.value !== restaurantWithDetails?.name && (
                      <div className="text-destructive mt-1 flex items-center text-sm">
                        <AlertCircle className="mr-1 h-4 w-4" />
                        <span>{t('common.slugTaken')}</span>
                      </div>
                    )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          rules={{ required: true, maxLength: 400 }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('onboarding.restaurantInfo.description')}
                <span className="text-destructive ml-1">
                  {t('common.required_asterisk')}
                </span>
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={4}
                  required
                  minLength={1}
                  maxLength={200}
                  className="resize-none"
                  placeholder="Restaurant traditionnel français. Cuisine goûteuse, généreuse et gourmande."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Google Places Autocomplete for Address */}
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="address"
            rules={{ required: 'Address is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('onboarding.restaurantInfo.address')}
                  <span className="text-destructive ml-1">
                    {t('common.required_asterisk')}
                  </span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    {isLoaded ? (
                      <Autocomplete
                        onLoad={onAddressAutocompleteLoad}
                        onPlaceChanged={onAddressPlaceChanged}
                        options={{
                          types: ['address'],
                          componentRestrictions: {
                            country: ['fr'],
                          },
                          fields: [
                            'address_components',
                            'formatted_address',
                            'geometry',
                            'place_id',
                          ],
                        }}
                      >
                        <Input
                          {...field}
                          placeholder="123 Rue de la Paix, Paris, France"
                          required
                          minLength={1}
                        />
                      </Autocomplete>
                    ) : (
                      <Input
                        {...field}
                        placeholder="123 Rue de la Paix, Paris, France"
                        required
                        minLength={1}
                        disabled={true}
                      />
                    )}
                  </div>
                </FormControl>
                <FormMessage />
                {loadError && (
                  <p className="text-destructive mt-1 text-sm">
                    {t('common.errorLoading')}{' '}
                    {loadError.message || loadError.toString()}
                  </p>
                )}
              </FormItem>
            )}
          />

          {/* Hidden form fields to store detailed address components */}
          <div className="hidden">
            <FormField
              control={form.control}
              name="addressFormatted"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="street"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="zip"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="latitude"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="any"
                      value={field.value || ''}
                      onChange={(e) => {
                        const value = e.target.value
                          ? parseFloat(e.target.value)
                          : undefined
                        field.onChange(value)
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="longitude"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="any"
                      value={field.value || ''}
                      onChange={(e) => {
                        const value = e.target.value
                          ? parseFloat(e.target.value)
                          : undefined
                        field.onChange(value)
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormButtons
          isPending={mutation.isPending || mutation.isSuccess}
          previousHref="/onboarding/personal-info"
        />
      </form>
    </Form>
  )
}
