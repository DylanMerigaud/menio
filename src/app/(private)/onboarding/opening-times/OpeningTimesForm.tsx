'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  useForm,
  useFieldArray,
  Controller,
  type Control,
  type FieldErrors,
} from 'react-hook-form'
import { useTranslations } from '@/i18n/useTypedTranslations'
import { useRouter } from '@/i18n/routing'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { FormButtons } from '@/components/ui/form-buttons'
import { Plus, Trash } from 'lucide-react'
import { api } from '@/trpc/react'
import { Separator } from '@/components/ui/separator'
import React from 'react'

// Define our types manually
type TimeSlot = {
  id: string
  open: string
  close: string
}

type DaySettings = {
  isOpen: boolean
  timeSlots: TimeSlot[]
}

type FormValues = {
  days: {
    key: keyof WeekdayData
    numericDay: number
    label: string
    isOpen: boolean
    timeSlots: TimeSlot[]
  }[]
}

type WeekdayData = {
  monday: DaySettings
  tuesday: DaySettings
  wednesday: DaySettings
  thursday: DaySettings
  friday: DaySettings
  saturday: DaySettings
  sunday: DaySettings
}

// Helper function to generate UUIDs
const generateId = () => {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15)
}

// Helper function to create time slots with unique IDs
const createTimeSlot = (open: string, close: string): TimeSlot => ({
  id: generateId(),
  open,
  close,
})

// Helper functions to create specific time slots
const createDefaultLunchTimeSlot = (): TimeSlot =>
  createTimeSlot('12:00', '14:30')
const createDefaultDinnerTimeSlot = (): TimeSlot =>
  createTimeSlot('19:00', '22:00')
const createDefaultSaturdayDinnerTimeSlot = (): TimeSlot =>
  createTimeSlot('19:00', '23:00')

// Function to create default time slots for initial form population
const createDefaultTimeSlots = (): TimeSlot[] => {
  return [createDefaultLunchTimeSlot(), createDefaultDinnerTimeSlot()]
}

// Function to create Saturday default time slots
const createSaturdayTimeSlots = (): TimeSlot[] => {
  return [createDefaultLunchTimeSlot(), createDefaultSaturdayDinnerTimeSlot()]
}

// Form validation patterns
const TIME_PATTERN = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
const TIME_INPUT_PATTERN = '^([01]?[0-9]|2[0-3]):[0-5][0-9]$'

// Maximum number of time slots per day
const MAX_TIME_SLOTS = 3

// Helper function to convert time string to minutes
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// Helper function to check if two time slots overlap
const doTimeSlotsOverlap = (slot1: TimeSlot, slot2: TimeSlot): boolean => {
  const slot1Start = timeToMinutes(slot1.open)
  const slot1End = timeToMinutes(slot1.close)
  const slot2Start = timeToMinutes(slot2.open)
  const slot2End = timeToMinutes(slot2.close)

  return (
    (slot1Start <= slot2End && slot1End >= slot2Start) ||
    (slot2Start <= slot1End && slot2End >= slot1Start)
  )
}

// Check if any time slots overlap
const hasOverlappingTimeSlots = (slots: TimeSlot[]): boolean => {
  if (slots.length <= 1) return false

  // Sort by open time
  const sortedSlots = [...slots].sort(
    (a, b) => timeToMinutes(a.open) - timeToMinutes(b.open),
  )

  // Check each slot against the next one for overlaps
  for (let i = 0; i < sortedSlots.length - 1; i++) {
    if (doTimeSlotsOverlap(sortedSlots[i], sortedSlots[i + 1])) {
      return true
    }
  }

  return false
}

// DayCard subcomponent to handle a single day's time slots
function DayCard({
  dayIndex,
  control,
  handleAddTimeSlot,
  handleRemoveTimeSlot,
  handleTimeSlotsBlur,
  handleToggleOpen,
  errors,
}: {
  dayIndex: number
  control: Control<FormValues>
  handleAddTimeSlot: (dayIndex: number) => void
  handleRemoveTimeSlot: (dayIndex: number, timeSlotIndex: number) => void
  handleTimeSlotsBlur: (dayIndex: number) => void
  handleToggleOpen: (dayIndex: number, isOpen: boolean) => void
  errors: FieldErrors<FormValues>
}) {
  const t = useTranslations()
  // Get nested field array for time slots within this day
  const { fields } = useFieldArray({
    control,
    name: `days.${dayIndex}.timeSlots` as const,
  })

  return (
    <div>
      <div className="flex justify-between gap-4">
        <div className="flex flex-col gap-4">
          <h3 className="text-2xl font-medium">
            <Controller
              control={control}
              name={`days.${dayIndex}.label`}
              render={({ field }) => <span>{field.value}</span>}
            />
          </h3>
          <div className="flex items-center gap-3">
            <Controller
              control={control}
              name={`days.${dayIndex}.isOpen`}
              render={({ field }) => (
                <>
                  <Button
                    type="button"
                    variant={field.value ? 'default' : 'outline'}
                    onClick={() => handleToggleOpen(dayIndex, true)}
                    className="flex-1 sm:flex-none"
                  >
                    {t('onboarding.openingTimes.open')}
                  </Button>
                  <Button
                    type="button"
                    variant={!field.value ? 'default' : 'outline'}
                    onClick={() => handleToggleOpen(dayIndex, false)}
                    className="flex-1 sm:flex-none"
                  >
                    {t('onboarding.openingTimes.closed')}
                  </Button>
                </>
              )}
            />
          </div>
        </div>

        <Controller
          control={control}
          name={`days.${dayIndex}.isOpen`}
          render={({ field }) => (
            <>
              {field.value && (
                <div className="space-y-6">
                  {fields.map((timeSlot, timeSlotIndex) => (
                    <div key={timeSlot.id} className="flex gap-6 sm:flex-row">
                      <FormField
                        control={control}
                        name={`days.${dayIndex}.timeSlots.${timeSlotIndex}.open`}
                        rules={{
                          required: true,
                          pattern: TIME_PATTERN,
                        }}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                {...field}
                                type="time"
                                required
                                pattern={TIME_INPUT_PATTERN}
                                onBlur={() => handleTimeSlotsBlur(dayIndex)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name={`days.${dayIndex}.timeSlots.${timeSlotIndex}.close`}
                        rules={{
                          required: true,
                          pattern: TIME_PATTERN,
                          validate: (value, formValues) => {
                            const openTime =
                              formValues.days[dayIndex].timeSlots[timeSlotIndex]
                                .open
                            if (openTime && value <= openTime) {
                              return 'Close time must be after open time'
                            }
                            return true
                          },
                        }}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                {...field}
                                type="time"
                                required
                                pattern={TIME_INPUT_PATTERN}
                                onBlur={() => handleTimeSlotsBlur(dayIndex)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end sm:items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() =>
                            handleRemoveTimeSlot(dayIndex, timeSlotIndex)
                          }
                          className="h-9 w-9"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Only show add time slot button if we have fewer than MAX_TIME_SLOTS */}
                  {fields.length < MAX_TIME_SLOTS && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => handleAddTimeSlot(dayIndex)}
                      className="w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {t('onboarding.openingTimes.addTimeSlot')}
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        />
      </div>
      {/* Display overlap error if there is one */}
      {errors?.days?.[dayIndex]?.timeSlots?.message && (
        <div className="text-destructive mt-2 text-sm font-medium">
          {errors.days[dayIndex].timeSlots.message}
        </div>
      )}
    </div>
  )
}

export default function OpeningTimesForm() {
  const t = useTranslations()
  const router = useRouter()
  const { data: restaurant } =
    api.restaurants.getRestaurantWithOpeningHours.useQuery()

  // Helper function to format time regardless of timezone
  const formatTime = useCallback((date: Date): string => {
    const hours = date.getUTCHours().toString().padStart(2, '0')
    const minutes = date.getUTCMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }, [])

  // Create day structure with numeric day mapping
  const initialDays = useMemo(
    () => [
      {
        key: 'monday' as keyof WeekdayData,
        numericDay: 1,
        label: t('onboarding.openingTimes.monday'),
        isOpen: true,
        timeSlots: createDefaultTimeSlots(),
      },
      {
        key: 'tuesday' as keyof WeekdayData,
        numericDay: 2,
        label: t('onboarding.openingTimes.tuesday'),
        isOpen: true,
        timeSlots: createDefaultTimeSlots(),
      },
      {
        key: 'wednesday' as keyof WeekdayData,
        numericDay: 3,
        label: t('onboarding.openingTimes.wednesday'),
        isOpen: true,
        timeSlots: createDefaultTimeSlots(),
      },
      {
        key: 'thursday' as keyof WeekdayData,
        numericDay: 4,
        label: t('onboarding.openingTimes.thursday'),
        isOpen: true,
        timeSlots: createDefaultTimeSlots(),
      },
      {
        key: 'friday' as keyof WeekdayData,
        numericDay: 5,
        label: t('onboarding.openingTimes.friday'),
        isOpen: true,
        timeSlots: createDefaultTimeSlots(),
      },
      {
        key: 'saturday' as keyof WeekdayData,
        numericDay: 6,
        label: t('onboarding.openingTimes.saturday'),
        isOpen: true,
        timeSlots: createSaturdayTimeSlots(),
      },
      {
        key: 'sunday' as keyof WeekdayData,
        numericDay: 0,
        label: t('onboarding.openingTimes.sunday'),
        isOpen: false,
        timeSlots: [],
      },
    ],
    [t],
  )

  // Initialize form values from restaurant data
  const initialValues = useMemo(() => {
    if (restaurant?.openingHours) {
      // Group opening hours by day of week
      const hoursByDay: Record<number, { openTime: Date; closeTime: Date }[]> =
        {}

      restaurant.openingHours.forEach((hour) => {
        if (!hoursByDay[hour.dayOfWeek]) {
          hoursByDay[hour.dayOfWeek] = []
        }
        hoursByDay[hour.dayOfWeek].push({
          openTime: new Date(hour.openTime),
          closeTime: new Date(hour.closeTime),
        })
      })

      // Create a copy of initial days to modify
      const days = initialDays.map((day) => ({ ...day }))

      // If no hours are set, return default days
      if (days.every((day) => !hoursByDay[day.numericDay])) {
        return { days: initialDays }
      }

      // Update days with restaurant data
      days.forEach((day) => {
        const dayHours = hoursByDay[day.numericDay]
        if (dayHours && dayHours.length > 0) {
          const mappedTimeSlots = dayHours
            .toSorted((a, b) => a.openTime.getTime() - b.openTime.getTime())
            .map<TimeSlot>((hour) => ({
              id: generateId(),
              open: formatTime(hour.openTime),
              close: formatTime(hour.closeTime),
            }))

          day.isOpen = true
          day.timeSlots = mappedTimeSlots
        } else {
          day.isOpen = false
          day.timeSlots = []
        }
      })

      return { days }
    }

    return { days: initialDays }
  }, [restaurant, initialDays, formatTime])

  // Initialize the form
  const form = useForm<FormValues>({
    defaultValues: initialValues,
  })

  // Initialize field array for days
  const { fields: dayFields } = useFieldArray({
    control: form.control,
    name: 'days',
  })

  // Handler to add a time slot to a specific day
  const handleAddTimeSlot = (dayIndex: number) => {
    const currentDay = form.getValues().days[dayIndex]
    const currentTimeSlots = currentDay.timeSlots

    // Only allow adding if we have fewer than MAX_TIME_SLOTS
    if (currentTimeSlots.length < MAX_TIME_SLOTS) {
      // Try to create a smart suggestion for a new time slot
      // First, create template default time slots to check against
      const lunchSlot = createDefaultLunchTimeSlot()
      const dinnerSlot = createDefaultDinnerTimeSlot()

      // Create a new time slot based on existing slots
      let newTimeSlot: TimeSlot

      // Check if lunch slot would overlap with any existing slots
      const lunchOverlaps = currentTimeSlots.some((slot) =>
        doTimeSlotsOverlap(slot, lunchSlot),
      )

      // Check if dinner slot would overlap with any existing slots
      const dinnerOverlaps = currentTimeSlots.some((slot) =>
        doTimeSlotsOverlap(slot, dinnerSlot),
      )

      // Decide which time slot to add based on overlaps
      if (!lunchOverlaps) {
        // If lunch slot is free, use that
        newTimeSlot = createDefaultLunchTimeSlot()
      } else if (!dinnerOverlaps) {
        // If dinner slot is free, use that
        newTimeSlot = createDefaultDinnerTimeSlot()
      } else {
        // Both default slots overlap, use a generic 00:00 time slot
        newTimeSlot = createTimeSlot('00:00', '00:00')
      }

      // Create a new array with all existing slots plus the new one
      const newSlots = [...currentTimeSlots, newTimeSlot]

      // Update the form with the sorted slots
      form.setValue(`days.${dayIndex}.timeSlots`, newSlots)

      // Check for overlapping time slots
      if (hasOverlappingTimeSlots(newSlots)) {
        form.setError(`days.${dayIndex}.timeSlots`, {
          type: 'overlap',
          message: t('onboarding.openingTimes.errors.overlappingTimeSlots'),
        })
      }
    }
  }

  // Handler to remove a time slot from a specific day
  const handleRemoveTimeSlot = (dayIndex: number, timeSlotIndex: number) => {
    const currentDay = form.getValues().days[dayIndex]
    const currentTimeSlots = currentDay.timeSlots

    if (currentTimeSlots.length > 1) {
      // If multiple slots exist, just remove the selected one
      const newSlots = currentTimeSlots.filter((_, i) => i !== timeSlotIndex)
      form.setValue(`days.${dayIndex}.timeSlots`, newSlots)

      // Check if we still have overlapping slots
      if (hasOverlappingTimeSlots(newSlots)) {
        form.setError(`days.${dayIndex}.timeSlots`, {
          type: 'overlap',
          message: t('onboarding.openingTimes.errors.overlappingTimeSlots'),
        })
      } else {
        // Clear errors if no more overlaps
        form.clearErrors(`days.${dayIndex}.timeSlots`)
      }
    } else {
      // If this is the last slot, set the day to closed
      form.setValue(`days.${dayIndex}.isOpen`, false)
      // Clear any errors
      form.setValue(`days.${dayIndex}.timeSlots`, [])
      form.clearErrors(`days.${dayIndex}.timeSlots`)
    }
  }

  // Handler for time input blur event
  const handleTimeSlotsBlur = (dayIndex: number) => {
    const currentDay = form.getValues().days[dayIndex]
    const currentTimeSlots = currentDay.timeSlots

    // Check for overlapping time slots
    if (hasOverlappingTimeSlots(currentTimeSlots)) {
      // Set error for the day
      form.setError(`days.${dayIndex}.timeSlots`, {
        type: 'overlap',
        message: t('onboarding.openingTimes.errors.overlappingTimeSlots'),
      })
    } else {
      // Clear error if no overlaps
      form.clearErrors(`days.${dayIndex}.timeSlots`)
    }
  }

  // Handler for toggling day open/closed
  const handleToggleOpen = (dayIndex: number, isOpen: boolean) => {
    const currentDay = form.getValues().days[dayIndex]

    // Update the isOpen state
    form.setValue(`days.${dayIndex}.isOpen`, isOpen)

    // Clear any errors when toggling to closed
    if (!isOpen) {
      form.clearErrors(`days.${dayIndex}.timeSlots`)
    }

    // Add default time slots if opening a day with no slots
    if (
      isOpen &&
      (!currentDay.timeSlots || currentDay.timeSlots.length === 0)
    ) {
      // Use different defaults based on the day
      const isSaturday = currentDay.numericDay === 6
      const defaultSlots = isSaturday
        ? createSaturdayTimeSlots()
        : createDefaultTimeSlots()

      form.setValue(`days.${dayIndex}.timeSlots`, defaultSlots)
    }
  }

  // Define API mutation
  const mutation = api.restaurants.upsertOpeningHours.useMutation({
    onSuccess: () => {
      // Navigate to next step on success
      router.push('/onboarding/contact-info')
    },
    onError: (error) => {
      console.error(error)
    },
  })

  // Form submission handler
  async function onSubmit(data: FormValues) {
    try {
      // Check for overlapping time slots in all days before submitting
      let hasErrors = false

      data.days.forEach((day, index) => {
        if (day.isOpen && day.timeSlots.length > 0) {
          if (hasOverlappingTimeSlots(day.timeSlots)) {
            form.setError(`days.${index}.timeSlots`, {
              type: 'overlap',
              message: t('onboarding.openingTimes.errors.overlappingTimeSlots'),
            })
            hasErrors = true
          }
        }
      })

      if (hasErrors) {
        return
      }

      // Transform form data to match database schema
      // Strip the id from each time slot as the API doesn't expect it
      // Only include time slots for days that are open
      const openingHours = data.days.map((day) => {
        const dayNum = day.numericDay
        const isOpen = day.isOpen

        // If the day is closed, send empty time slots regardless of what's in the form
        const openTimes = isOpen
          ? (day.timeSlots || []).map(({ open, close }) => ({
              open,
              close,
            }))
          : []

        return {
          day: dayNum,
          isOpen,
          openTimes,
        }
      })

      // Submit the opening hours
      mutation.mutate(openingHours)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Responsive layout - 1 column on mobile, 2 columns on larger screens */}
        <div className="grid grid-cols-1 gap-10">
          {dayFields.map((day, index) => (
            <React.Fragment key={day.id}>
              <DayCard
                key={day.id}
                dayIndex={index}
                control={form.control}
                handleAddTimeSlot={handleAddTimeSlot}
                handleRemoveTimeSlot={handleRemoveTimeSlot}
                handleTimeSlotsBlur={handleTimeSlotsBlur}
                handleToggleOpen={handleToggleOpen}
                errors={form.formState.errors}
              />
              {index < dayFields.length - 1 && <Separator />}
            </React.Fragment>
          ))}
        </div>

        <FormButtons
          isPending={mutation.isPending || mutation.isSuccess}
          previousHref="/onboarding/menu-pictures"
        />
      </form>
    </Form>
  )
}
