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
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { FormButtons } from '@/components/ui/form-buttons'
import { api } from '@/utils/trpc'

type FormValues = {
  firstName: string
  lastName: string
  companyName?: string
  email?: string
}

export default function PersonalInfoForm() {
  const t = useTranslations()
  const router = useRouter()

  const { data: owner } = api.owners.findOwner.useQuery()

  // Use the tRPC API directly with the new pattern
  const mutation = api.owners.upsertOwner.useMutation({
    onSuccess: () => {
      router.push('/onboarding/restaurant-info')
    },
    onError: (error) => {
      console.error(error)
    },
  })

  // const { data: owner } = api.owners.findOwner.useQuery()

  const form = useForm<FormValues>({
    defaultValues: {
      firstName: owner?.firstName || '',
      lastName: owner?.lastName || '',
      companyName: owner?.companyName || '',
      email: owner?.email || '',
    },
  })

  function onSubmit(data: FormValues) {
    // Ensure we're sending valid data to match the Zod schema
    const formData = {
      firstName:
        data.firstName.charAt(0).toUpperCase() + data.firstName.slice(1),
      lastName: data.lastName.charAt(0).toUpperCase() + data.lastName.slice(1),
      companyName: data.companyName || undefined,
      email: data.email || undefined,
    }

    mutation.mutate(formData)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            rules={{ required: true, maxLength: 100 }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('onboarding.personalInfo.firstName')}
                  <span className="text-destructive ml-1">
                    {t('common.required_asterisk')}
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    required
                    minLength={1}
                    maxLength={100}
                    placeholder="Antoine"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            rules={{ required: true, maxLength: 100 }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('onboarding.personalInfo.lastName')}
                  <span className="text-destructive ml-1">
                    {t('common.required_asterisk')}
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    required
                    minLength={1}
                    maxLength={100}
                    placeholder="Dupont"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="companyName"
          rules={{ required: false, maxLength: 100 }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('onboarding.personalInfo.companyName')}
                <span className="text-muted-foreground ml-2 text-sm">
                  {t('common.left_parenthesis')}
                  {t('common.optional')}
                  {t('common.right_parenthesis')}
                </span>
              </FormLabel>
              <FormControl>
                <Input {...field} maxLength={100} placeholder="Exemple SAS" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          rules={{
            required: false,
            pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('onboarding.personalInfo.email')}
                <span className="text-muted-foreground ml-2 text-sm">
                  {t('common.left_parenthesis')}
                  {t('common.optional')}
                  {t('common.right_parenthesis')}
                </span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="antoine.dupont@gmail.com"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormButtons
          isPending={mutation.isPending || mutation.isSuccess}
          isFirstStep={true}
        />
      </form>
    </Form>
  )
}
