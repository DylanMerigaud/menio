'use client'

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function SiteStatusCardSkeleton() {
  return (
    <Card className="gap-2 border-0 bg-gray-50 dark:bg-gray-900">
      <CardHeader className="flex flex-col items-center pt-2 pb-2">
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="mt-1 h-4 w-40" />
      </CardHeader>
      <CardContent className="pt-4 text-center">
        <Skeleton className="mx-auto h-10 w-40" />
      </CardContent>
      <CardFooter className="justify-center pt-6 text-sm">
        <Skeleton className="h-4 w-48" />
      </CardFooter>
    </Card>
  )
}
