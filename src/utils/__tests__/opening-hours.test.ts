/**
 * @jest-environment node
 */
import { getCurrentOpenStatus, type OpeningDay } from '../opening-hours'

describe('getCurrentOpenStatus', () => {
  // Mock translation function
  const mockTranslateDay = (day: string): string => `translated_${day}`

  // Sample opening hours configuration
  const openingHours: OpeningDay[] = [
    {
      day: 'monday',
      isOpen: true,
      slots: [
        { start: '10:00', end: '14:00' },
        { start: '18:00', end: '22:00' },
      ],
    },
    {
      day: 'tuesday',
      isOpen: true,
      slots: [{ start: '10:00', end: '22:00' }],
    },
    {
      day: 'wednesday',
      isOpen: false,
      slots: [],
    },
    {
      day: 'thursday',
      isOpen: true,
      slots: [{ start: '10:00', end: '22:00' }],
    },
    {
      day: 'friday',
      isOpen: true,
      slots: [{ start: '10:00', end: '23:00' }],
    },
    {
      day: 'saturday',
      isOpen: true,
      slots: [{ start: '10:00', end: '23:00' }],
    },
    {
      day: 'sunday',
      isOpen: true,
      slots: [{ start: '11:00', end: '16:00' }],
    },
  ]

  // Helper to create a date object for a specific day and time
  const createDateWithTime = (
    dayOfWeek: number,
    hours: number,
    minutes = 0,
  ) => {
    // Create a date starting from a Sunday
    const date = new Date('2024-04-14T12:00:00') // This is a Sunday
    // JavaScript uses 0-6 for days (0 = Sunday)
    // But we need specific dates for each test
    date.setDate(date.getDate() + dayOfWeek) // Add days to get to the desired day of week
    date.setHours(hours, minutes, 0, 0) // Set the time
    console.log(
      `Created date: ${date.toISOString()}, day: ${date.getDay()}, dayName: ${['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()]}`,
    )
    return date
  }

  test('should correctly identify when restaurant is open', () => {
    // Monday at 12:00 (restaurant should be open)
    const mondayNoon = createDateWithTime(1, 12, 0)
    const status = getCurrentOpenStatus(openingHours, undefined, mondayNoon)

    expect(status).toEqual({
      isOpen: true,
      closesSoon: false,
      closingTime: '14:00',
      nextOpenTime: null,
    })
  })

  test('should correctly identify when restaurant is closing soon', () => {
    // Monday at 13:40 (restaurant closes at 14:00, so this is closing soon)
    const mondayBeforeClose = createDateWithTime(1, 13, 40)
    const status = getCurrentOpenStatus(
      openingHours,
      undefined,
      mondayBeforeClose,
    )

    expect(status).toEqual({
      isOpen: true,
      closesSoon: true,
      closingTime: '14:00',
      nextOpenTime: null,
    })
  })

  test('should correctly identify when restaurant is closed but opens later same day', () => {
    // Monday at 15:00 (between lunch and dinner service)
    const mondayAfternoon = createDateWithTime(1, 15, 0)
    const status = getCurrentOpenStatus(
      openingHours,
      undefined,
      mondayAfternoon,
    )

    expect(status).toEqual({
      isOpen: false,
      closesSoon: false,
      nextOpenTime: '18:00',
      nextOpenDay: 'monday',
    })
  })

  test('should correctly identify when restaurant is closed for the day', () => {
    // Wednesday at 12:00 (restaurant is closed on Wednesdays)
    const wednesdayNoon = createDateWithTime(3, 12, 0)
    const status = getCurrentOpenStatus(openingHours, undefined, wednesdayNoon)

    // The implementation now finds the next open day (Thursday)
    expect(status).toEqual({
      isOpen: false,
      closesSoon: false,
      nextOpenTime: '10:00',
      nextOpenDay: 'thursday',
    })
  })

  test('should correctly identify next open day when restaurant is closed', () => {
    // Create openingHours with Wednesday closed and Thursday open
    const testOpeningHours = [...openingHours]
    // Make sure Wednesday is closed
    testOpeningHours[2] = { day: 'wednesday', isOpen: false, slots: [] }
    // Make sure Thursday is open with a specific slot
    testOpeningHours[3] = {
      day: 'thursday',
      isOpen: true,
      slots: [{ start: '10:00', end: '22:00' }],
    }

    // Wednesday at 16:00 (closed, next open will be Thursday)
    const wednesdayAfternoon = createDateWithTime(3, 16, 0)

    const status = getCurrentOpenStatus(
      testOpeningHours,
      mockTranslateDay,
      wednesdayAfternoon,
    )
    console.log('Test openingHours:', JSON.stringify(testOpeningHours, null, 2))
    console.log('Status returned:', status)

    expect(status).toEqual({
      isOpen: false,
      closesSoon: false,
      nextOpenTime: '10:00',
      nextOpenDay: 'translated_thursday',
    })
  })

  test('should handle the case when restaurant is closed for multiple days', () => {
    // Create a test schedule with Wednesday closed, Thursday closed, Friday closed, Saturday open
    const testMultiClosedDays = [...openingHours]
    // Wednesday closed
    testMultiClosedDays[2] = { day: 'wednesday', isOpen: false, slots: [] }
    // Thursday closed
    testMultiClosedDays[3] = { day: 'thursday', isOpen: false, slots: [] }
    // Friday closed
    testMultiClosedDays[4] = { day: 'friday', isOpen: false, slots: [] }
    // Saturday open
    testMultiClosedDays[5] = {
      day: 'saturday',
      isOpen: true,
      slots: [{ start: '10:00', end: '23:00' }],
    }

    // Wednesday at 16:00 (closed, next open will be Saturday)
    const wednesdayAfternoon = createDateWithTime(3, 16, 0)
    const status = getCurrentOpenStatus(
      testMultiClosedDays,
      mockTranslateDay,
      wednesdayAfternoon,
    )

    console.log(
      'Multi-day test schedule:',
      JSON.stringify(testMultiClosedDays, null, 2),
    )
    console.log('Multi-day test status:', status)

    expect(status).toEqual({
      isOpen: false,
      closesSoon: false,
      nextOpenTime: '10:00',
      nextOpenDay: 'translated_saturday',
    })
  })

  test('should handle correctly when the restaurant has multiple slots and is open', () => {
    // Monday at 19:00 (during dinner service)
    const mondayDinner = createDateWithTime(1, 19, 0)
    const status = getCurrentOpenStatus(openingHours, undefined, mondayDinner)

    expect(status).toEqual({
      isOpen: true,
      closesSoon: false,
      closingTime: '22:00',
      nextOpenTime: null,
    })
  })

  test('should find the next scheduled opening time after hours', () => {
    // Monday at 23:00 (after closing, next open will be Tuesday)
    const mondayNight = createDateWithTime(1, 23, 0)
    const status = getCurrentOpenStatus(
      openingHours,
      mockTranslateDay,
      mondayNight,
    )

    expect(status).toEqual({
      isOpen: false,
      closesSoon: false,
      nextOpenTime: '10:00',
      nextOpenDay: 'translated_tuesday',
    })
  })

  test('should correctly handle when day translation is not provided', () => {
    // Monday at 23:00 (after closing, next open will be Tuesday)
    const mondayNight = createDateWithTime(1, 23, 0)
    const status = getCurrentOpenStatus(openingHours, undefined, mondayNight)

    expect(status).toEqual({
      isOpen: false,
      closesSoon: false,
      nextOpenTime: '10:00',
      nextOpenDay: 'tuesday',
    })
  })
})
