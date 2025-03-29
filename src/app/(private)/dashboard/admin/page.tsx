/* eslint-disable react/jsx-no-literals */
'use client'

import { api } from '@/trpc/react'
import { useEffect } from 'react'
import { useTranslations } from '@/i18n/useTypedTranslations'
import { format } from 'date-fns'
import { redirect } from '@/i18n/routing'

export default function AdminPage() {
  const {
    data: ownersData,
    isLoading,
    error,
  } = api.admin.getAllOwnersWithRestaurants.useQuery()

  // Handle authorization redirect
  useEffect(() => {
    if (error && 'data' in error && error.data?.code === 'FORBIDDEN') {
      redirect({ href: '/dashboard', locale: 'en' })
    }
  }, [error])

  // Helper function to format dates with fallback
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return '-'
    return format(new Date(date), 'MM/dd/yyyy')
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-6 text-2xl font-bold">Admin Dashboard</h1>

      {isLoading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">Error: {error.message}</div>
      ) : (
        <div className="space-y-8">
          <h2 className="text-xl font-semibold">Owners and Restaurants</h2>

          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="p-3 text-left">Owner Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Restaurant Name</th>
                  <th className="p-3 text-left">Phone</th>
                  <th className="p-3 text-left">Created At</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Subscription Start</th>
                  <th className="p-3 text-left">Trial End</th>
                  <th className="p-3 text-left">Address</th>
                </tr>
              </thead>
              <tbody>
                {ownersData?.map((owner) =>
                  owner.restaurants.map((restaurant) => {
                    // Get subscription start date from Stripe data if available
                    const subscriptionStart = restaurant.subscriptionDetails
                      ?.stripeSubscription
                      ? restaurant.subscriptionDetails.stripeSubscription
                          .startDate ||
                        restaurant.subscriptionDetails.stripeSubscription
                          .created
                      : null

                    return (
                      <tr
                        key={`${owner.id}-${restaurant.id}`}
                        className="border-b"
                      >
                        <td className="p-3">
                          {owner.firstName} {owner.lastName}
                        </td>
                        <td className="p-3">{owner.email || '-'}</td>
                        <td className="p-3">{restaurant.name}</td>
                        <td className="p-3">{restaurant.phone || '-'}</td>
                        <td className="p-3">
                          {formatDate(restaurant.createdAt)}
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              restaurant.subscriptionDetails
                                ?.hasActiveSubscription
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                            }`}
                          >
                            {restaurant.subscriptionStatus || 'None'}
                          </span>
                        </td>
                        <td className="p-3">{formatDate(subscriptionStart)}</td>
                        <td className="p-3">
                          {formatDate(restaurant.trialEnd)}
                        </td>
                        <td className="p-3">
                          {restaurant.addressInfo?.addressFormatted ||
                            restaurant.address ||
                            '-'}
                        </td>
                      </tr>
                    )
                  }),
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
