import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

export function DashboardSkeleton() {
  return (
    <>
      <div className="mb-8 flex flex-col space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-80" />
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="overflow-hidden border-none shadow-md">
          <div className="from-primary to-primary/80 bg-gradient-to-r p-5">
            <Skeleton className="h-7 w-40 bg-white/20" />
            <Skeleton className="mt-2 h-5 w-32 bg-white/20" />
          </div>
          <div className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-5 w-24" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          </div>
          <div className="bg-muted/30 border-t p-5">
            <Skeleton className="mb-3 h-5 w-32" />
            <Skeleton className="h-9 w-full" />
          </div>
        </Card>

        <Card className="overflow-hidden border-none shadow-md">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-5">
            <Skeleton className="h-7 w-40 bg-white/20" />
            <Skeleton className="mt-2 h-5 w-48 bg-white/20" />
          </div>
          <div className="flex flex-col gap-4 p-5">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        </Card>

        <Card className="overflow-hidden border-none shadow-md md:col-span-2 lg:col-span-1">
          <div className="bg-gradient-to-r from-violet-500 to-violet-600 p-5">
            <Skeleton className="h-7 w-40 bg-white/20" />
            <Skeleton className="mt-2 h-5 w-48 bg-white/20" />
          </div>
          <div className="p-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-8" />
                </div>
                <div className="bg-muted/50 h-2 w-full rounded-full">
                  <div className="bg-primary h-full w-0 rounded-full"></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-8" />
                </div>
                <div className="bg-muted/50 h-2 w-full rounded-full">
                  <div className="bg-primary h-full w-0 rounded-full"></div>
                </div>
              </div>

              <Skeleton className="mt-4 h-9 w-full" />
            </div>
          </div>
        </Card>
      </div>
    </>
  )
}
