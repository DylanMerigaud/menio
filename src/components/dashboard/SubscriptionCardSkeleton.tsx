'use client'

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function SubscriptionCardSkeleton() {
  return (
    <Card className="gap-2 overflow-hidden border-0 bg-gray-200 dark:bg-gray-800">
      <CardHeader>
        <div className="flex justify-center">
          <Skeleton className="h-8 w-48" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <Skeleton className="mx-auto h-4 w-3/4" />
        <Skeleton className="mx-auto h-4 w-2/3" />

        <div className="flex justify-center pt-6 pb-2">
          <Skeleton className="h-12 w-44" />
        </div>
      </CardContent>
      <CardFooter className="mt-auto text-center">
        <Skeleton className="mx-auto h-4 w-56" />
      </CardFooter>
    </Card>
  )
}
