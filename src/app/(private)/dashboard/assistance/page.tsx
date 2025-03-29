'use client'

import { useTranslations } from '@/i18n/useTypedTranslations'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/routing'
import { captureEvent } from '@/providers/PostHogProvider'
import { Mail } from 'lucide-react'
import { useLocale } from 'next-intl'

export default function AssistancePage() {
  const t = useTranslations()
  const locale = useLocale()

  // FAQ data sourced from docs/faq
  const faqItems = [
    {
      question:
        locale === 'en'
          ? "How do I modify my restaurant's information?"
          : 'Comment modifier les informations de mon restaurant ?',
      answer:
        locale === 'en'
          ? 'To modify your information, go to the "Modify my site" section of your restaurant portal.'
          : 'Pour modifier vos informations, allez dans la section "Modifier mon site" de votre portail restaurateur.',
    },
    {
      question:
        locale === 'en'
          ? 'Can I integrate my existing reservation system?'
          : 'Puis-je intégrer mon système de réservation existant ?',
      answer:
        locale === 'en'
          ? 'Yes, you can connect your existing online reservation system (such as ZenChef, SevenRooms, Opentable, etc.). All you need to do is indicate your reservations link (e.g. www.sevenrooms/book/restaurant1237Y3303) in your restaurant information.'
          : "Oui, vous pouvez connecter votre système de réservation en ligne (comme ZenChef, SevenRooms, Opentable, etc.). Il vous suffit d'indiquer votre lien de réservations (exemple: www.sevenrooms/book/restaurant1237Y3303) dans les informations de votre restaurant.",
    },
    {
      question:
        locale === 'en'
          ? 'What photos should I add to my site?'
          : 'Quelles photos ajouter à mon site ?',
      answer:
        locale === 'en'
          ? "We recommend adding professional, high-quality photos of your restaurant. Examples of ideal photos: your storefront, your dining room, one of your flagship dishes. If you don't have professional photos, we can provide you with royalty-free photos to illustrate your restaurant's website."
          : "Nous vous conseillons d'ajouter des photos professionnelles et qualitatives de votre restaurant. Exemples de photos idéales: votre devanture, votre salle, un de vos plats phares. Si vous n'avez pas de photos professionnelles, nous pouvons vous fournir des photos libres de droit pour illustrer le site web de votre restaurant.",
    },
    {
      question:
        locale === 'en'
          ? 'Can I add a contact form or other widget to my site?'
          : 'Puis-je ajouter un formulaire de contact ou un autre widget à mon site ?',
      answer:
        locale === 'en'
          ? 'At present, Menio does not offer the possibility of adding a personalized contact form or other widgets via the dashboard. However, if you have a specific need, please contact our support team to discuss a solution.'
          : "Pour l'instant, Menio ne propose pas la possibilité d'ajouter un formulaire de contact personnalisé ou d'autres widgets via le dashboard. Cependant, si vous avez un besoin spécifique, contactez notre support pour discuter d'une solution.",
    },
    {
      question:
        locale === 'en'
          ? 'Is my site secure?'
          : 'Est-ce que mon site est sécurisé ?',
      answer:
        locale === 'en'
          ? 'Yes, Menio uses advanced security protocols to ensure that your data and those of your customers are protected. All information is encrypted and we comply with RGPD standards for personal data management.'
          : 'Oui, Menio utilise des protocoles de sécurité avancés pour garantir que vos données et celles de vos clients sont protégées. Toutes les informations sont cryptées et nous respectons les normes RGPD pour la gestion des données personnelles.',
    },
    {
      question:
        locale === 'en'
          ? "I'm experiencing a technical problem with my site. What should I do?"
          : 'Je rencontre un problème technique sur mon site, que faire ?',
      answer:
        locale === 'en'
          ? "If you have a problem, don't hesitate to contact us. We'll get back to you within 24 hours with a solution!"
          : "En cas de problème, n'hésitez pas à nous contacter. Nous reviendrons vers vous dans les 24h avec une solution !",
    },
    {
      question:
        locale === 'en'
          ? 'Can I cancel my subscription?'
          : 'Puis-je annuler mon abonnement ?',
      answer:
        locale === 'en'
          ? 'Yes, you can cancel your subscription at any time. Go to the "Support" section of your restaurant portal, then click on "Manage my subscription". You can then manage your plan or cancel your subscription in just a few clicks.'
          : 'Oui, vous pouvez annuler votre abonnement à tout moment et sans conditions. Rendez-vous dans la section "Assistance" de votre portail restaurateur, puis cliquez sur "Gérer mon abonnement". Vous pourrez alors gérer votre plan ou annuler votre abonnement en quelques clics.',
    },
  ]

  const handleContactClick = () => {
    captureEvent('contact_support_clicked')
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <h1 className="mb-8 text-3xl font-bold">{t('assistance.faq')}</h1>

      <div className="mb-10 space-y-4">
        {faqItems.map((item, index) => (
          <Card key={index} className="p-4">
            <h3 className="mb-2 text-lg font-medium">{item.question}</h3>
            <p className="text-muted-foreground">{item.answer}</p>
          </Card>
        ))}
      </div>

      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
        <h2 className="mb-4 text-xl font-semibold">
          {t('assistance.contactUs')}
        </h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          {t('common.supportText')}
        </p>
        <Button onClick={handleContactClick} asChild>
          <Link href="mailto:thomas@menio.app">
            <Mail className="mr-2 h-4 w-4" />
            {t('common.supportEmail')}
          </Link>
        </Button>
      </div>
    </div>
  )
}
