'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function ActionButtonsSkeleton() {
  // Create an array of 4 elements
  const buttons = [0, 1, 2, 3]

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {buttons.map((index) => (
        <Skeleton key={index} className="h-24 w-full rounded-md" />
      ))}
    </div>
  )
}
