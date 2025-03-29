export interface TimeSlot {
  start: string
  end: string
}

export interface OpeningDay {
  day: string
  isOpen: boolean
  slots: TimeSlot[]
}

export interface OpeningHoursResult {
  isOpen: boolean
  closesSoon: boolean
  closingTime?: string
  nextOpenTime?: string
  nextOpenDay?: string
}

/**
 * Determines if a restaurant is currently open based on opening hours
 * @param openingHours The restaurant's opening hours configuration
 * @param translateDay Optional function to translate day names
 * @param nowDate Optional Date object for testing (defaults to current time)
 * @returns Object with open status information
 */
export function getCurrentOpenStatus(
  openingHours: OpeningDay[],
  translateDay?: (day: string) => string,
  nowDate?: Date,
): OpeningHoursResult {
  const now = nowDate || new Date()

  // We need to use 0-6 for days of week (0 = Sunday, 1 = Monday, etc.)
  const dayOfWeekNum = now.getDay() // 0 = Sunday, 1 = Monday, etc.
  const currentHour = now.getHours()
  const currentMinutes = now.getMinutes()

  // Map the JavaScript day number to our day of week strings
  const dayMap = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ]

  // Define the day order for finding the next open day
  // This is the same order used in the original component
  const dayOrder = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ]

  const dayOfWeek = dayMap[dayOfWeekNum]

  // For logging in tests
  if (process.env.NODE_ENV === 'test') {
    console.log(
      `Processing date: ${now.toISOString()}, day: ${dayOfWeekNum}, mapped to: ${dayOfWeek}`,
    )
  }

  const todaySchedule = openingHours.find((day) => day.day === dayOfWeek)

  // If it's not open today, don't immediately return.
  // Instead, let the code continue to find the next open day.
  if (!todaySchedule?.isOpen) {
    // Instead of returning immediately, we'll look for the next open day
    const result = findNextOpenDay(
      openingHours,
      dayOfWeek,
      dayOrder,
      translateDay,
    )
    if (process.env.NODE_ENV === 'test') {
      console.log('Not open today, looking for next day. Result:', result)
    }
    return result
  }

  for (const slot of todaySchedule.slots) {
    const [startHour, startMinute] = slot.start.split(':').map(Number)
    const [endHour, endMinute] = slot.end.split(':').map(Number)

    const start = startHour * 60 + startMinute
    const end = endHour * 60 + endMinute
    const current = currentHour * 60 + currentMinutes

    if (current >= start && current < end) {
      // Open now, check if closing soon (within 30 minutes)
      const closesSoon = end - current <= 30
      return {
        isOpen: true,
        closesSoon,
        closingTime: slot.end,
        nextOpenTime: undefined,
      }
    }
  }

  // Not open now, find next opening time today if any
  const laterTodaySlots = todaySchedule?.slots
    .filter((slot) => {
      const [startHour, startMinute] = slot.start.split(':').map(Number)
      const start = startHour * 60 + startMinute
      const current = currentHour * 60 + currentMinutes
      return start > current
    })
    .sort((a, b) => {
      const [aHour, aMinute] = a.start.split(':').map(Number)
      const [bHour, bMinute] = b.start.split(':').map(Number)
      return aHour * 60 + aMinute - (bHour * 60 + bMinute)
    })

  if (laterTodaySlots && laterTodaySlots.length > 0) {
    const result: OpeningHoursResult = {
      isOpen: false,
      closesSoon: false,
      nextOpenTime: laterTodaySlots[0].start,
    }

    if (translateDay) {
      result.nextOpenDay = translateDay(dayOfWeek)
    } else {
      result.nextOpenDay = dayOfWeek
    }

    return result
  }

  // Look for the next opening time on future days
  const todayIndex = dayOrder.indexOf(dayOfWeek)

  // Check the next 7 days (starting from tomorrow)
  for (let i = 1; i <= 7; i++) {
    const nextDayIndex = (todayIndex + i) % 7
    const nextDay = dayOrder[nextDayIndex]
    const nextDaySchedule = openingHours.find((day) => day.day === nextDay)

    if (nextDaySchedule?.isOpen && nextDaySchedule.slots.length > 0) {
      // Sort slots to get the earliest one
      const sortedSlots = [...nextDaySchedule.slots].sort((a, b) => {
        const [aHour, aMinute] = a.start.split(':').map(Number)
        const [bHour, bMinute] = b.start.split(':').map(Number)
        return aHour * 60 + aMinute - (bHour * 60 + bMinute)
      })

      const result: OpeningHoursResult = {
        isOpen: false,
        closesSoon: false,
        nextOpenTime: sortedSlots[0].start,
      }

      if (translateDay) {
        result.nextOpenDay = translateDay(nextDay)
      } else {
        result.nextOpenDay = nextDay
      }

      return result
    }
  }

  // If we got here, there's no open time in the next 7 days
  return { isOpen: false, closesSoon: false, nextOpenTime: undefined }
}

/**
 * Helper function to find the next open day
 */
function findNextOpenDay(
  openingHours: OpeningDay[],
  dayOfWeek: string,
  dayOrder: string[],
  translateDay?: (day: string) => string,
): OpeningHoursResult {
  const todayIndex = dayOrder.indexOf(dayOfWeek)

  // Check the next 7 days (starting from tomorrow)
  for (let i = 1; i <= 7; i++) {
    const nextDayIndex = (todayIndex + i) % 7
    const nextDay = dayOrder[nextDayIndex]
    const nextDaySchedule = openingHours.find((day) => day.day === nextDay)

    if (nextDaySchedule?.isOpen && nextDaySchedule.slots.length > 0) {
      // Sort slots to get the earliest one
      const sortedSlots = [...nextDaySchedule.slots].sort((a, b) => {
        const [aHour, aMinute] = a.start.split(':').map(Number)
        const [bHour, bMinute] = b.start.split(':').map(Number)
        return aHour * 60 + aMinute - (bHour * 60 + bMinute)
      })

      // Build the result
      const result: OpeningHoursResult = {
        isOpen: false,
        closesSoon: false,
        nextOpenTime: sortedSlots[0].start,
      }

      // Add the translated day name if needed
      if (translateDay) {
        result.nextOpenDay = translateDay(nextDay)
      } else {
        result.nextOpenDay = nextDay
      }

      if (process.env.NODE_ENV === 'test') {
        console.log(
          `Found next open day: ${nextDay}, time: ${sortedSlots[0].start}`,
        )
      }

      return result
    }
  }

  // No open days found
  return { isOpen: false, closesSoon: false, nextOpenTime: undefined }
}
