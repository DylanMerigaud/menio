'use client'

import { Card } from '@/components/ui/card'
import { cn } from '@/utils/tailwind'
import { useLocale } from 'next-intl'
import Markdown from 'react-markdown'

export default function TermsPage() {
  const locale = useLocale()

  // English terms and conditions content
  const enContent = `
# Terms & Conditions

## General Terms and Conditions of Sale (GTCS)

**1. Subject**

These General Terms and Conditions of Sale (GTCS) govern the terms of use and sale of the **Menio** solution (hereinafter "Menio") offered by Menio. By subscribing to the **Menio** service, you unreservedly accept the terms of these General Terms and Conditions of Sale (GTCS).

**2. Subscription and Pricing**

- **Rate:** €30 per month, including website creation, hosting, maintenance, and personalized support.
- **Payment method:** The payment is made monthly by **credit card**.
- **Commitment:** No long-term commitment. You can cancel at any time.
- **Cancellation:** The subscription can be canceled at any time without condition. In case of cancellation before the end of the already paid subscription period, access is maintained until the end of that period. **No refund** will be issued.

**3. Delivery and Services**

- **Site generation:** The site is generated automatically in a few seconds after the restaurateur has filled out the required form.
- **Hosting and availability:** Menio guarantees the hosting and continuous availability of the service.
- **Customer support:** Support is provided via **email** with a response time of under **24 hours**.

**4. Client Obligations**

The client commits to:

- Provide accurate information in compliance with current legislation.
- Respect the laws and regulations in force, and do not provide illegal, false, or shocking content.
- Use the service in a respectful and legal manner.

**5. Responsibility**

- **Force majeure:** Menio cannot be held responsible in case of force majeure (technical failures, server outages, etc.).
- **Service issues:** Menio is not responsible for any problems or errors arising from the use of the service or any service interruptions.

**6. Intellectual Property**

- Menio holds the rights to the **generated content** on the platform, including the design and code generated for the restaurant's website.
- **Data Ownership**: The restaurateur remains the owner of their **personal data** and the **information on their site**.

**7. Personal Data and GDPR**

- Menio collects, stores, and uses users' personal data in compliance with the GDPR to provide services, ensure maintenance, and improve the user experience.
- The restaurateur has the rights of access, rectification, and deletion of their personal data, in accordance with the legislation in force.

**8. Modifications to the General Terms and Conditions**

Menio reserves the right to modify these General Terms and Conditions at any time. Users will be informed by email or via their dashboard of these changes. By continuing to use the service after the publication of the changes, the user tacitly accepts the new terms and conditions.

## Terms and Conditions of Use (TCU)

**1. Subject**

These General Terms of Use (GTU) govern the use of the **Menio** platform. By using the service, you accept these Terms of Use.

**2. Access to the platform**

- **Account creation:** Access to Menio is via a **Google account** or a **phone number**.
- **Accessibility:** The service is accessible on all devices (PC, mobile, tablet).

**3. Usage Restrictions**

The user agrees not to:

- Use the service in an abusive, illegal manner, or to engage in harmful activities.
- Attempting to hack, alter, or compromise the security of the service.

**4. User Account Management**

- **Unique account:** Each user has a unique account. There is no possibility of multi-user management at this stage.
- **Account Security:** The user is responsible for the security of their account and credentials.

**5. Service Modifications**

Menio reserves the right to modify, suspend, or discontinue all or part of its service at any time, without notice. Users will be informed of the changes by email.

**6. Intellectual Property**

- Menio holds all rights related to the content generated on its platform.
- The content created by the restaurateur (texts, images, menus) remains the property of the restaurateur, who retains the rights.

**7. Suspension and Termination**

Menio reserves the right to suspend or terminate access to the service for any violation of these Terms of Use, without notice or compensation.

**8. Support and Assistance**

Customer support is accessible via email at **<support@menio.app>**. Menio guarantees a response within **24 hours**.

**9. Personal Data and GDPR**

Personal data is collected and processed by Menio for the management of services. In accordance with the GDPR, the user has rights of access, rectification, and deletion of their personal data.

**10. Modifications to the Terms of Service**

Menio reserves the right to modify these Terms of Use at any time. Users will be informed of the changes by email.

**11. Applicable Law**

These General Terms and Conditions of Sale and Use are governed by French law. Any dispute relating to their interpretation and/or execution will be submitted to the competent courts in France.
`

  // French terms and conditions content
  const frContent = `
# Conditions Générales

## Conditions générales de ventes (CGV)

**1. Objet**

Les présentes Conditions Générales de Vente (CGV) régissent les conditions d'utilisation et de vente de la solution **Menio** (ci-après "Menio") proposée par Menio. En souscrivant à l'abonnement **Menio**, vous acceptez sans réserve les termes de ces CGV.

**2. Abonnement et Tarification**

- **Tarif :** 30€ par mois, comprenant la création du site web, l'hébergement, la maintenance et le support personnalisé.
- **Mode de paiement :** Le paiement est effectué mensuellement par **carte bancaire**.
- **Engagement :** Aucun engagement à long terme. Vous pouvez annuler à tout moment.
- **Annulation :** L'abonnement peut être annulé à tout moment sans condition. En cas d'annulation avant la fin de la période d'abonnement déjà payée, l'accès est maintenu jusqu'à la fin de cette période. **Aucun remboursement** ne sera effectué.

**3. Livraison et Services**

- **Génération du site :** Le site est généré automatiquement en quelques secondes après que le restaurateur ait rempli le formulaire requis.
- **Hébergement et disponibilité :** Menio garantit l'hébergement et la disponibilité continue du service.
- **Support client :** Le support est fourni par **email** avec un délai de réponse sous **24 heures**.

**4. Obligations du Client**

Le client s'engage à :

- Fournir des informations exactes et conformes à la législation en vigueur.
- Respecter les lois et règlements en vigueur, et ne pas renseigner de contenu illégal, mensonger ou choquant.
- Utiliser le service de manière respectueuse et légale.

**5. Responsabilité**

- **Force majeure :** Menio ne peut être tenu responsable en cas de force majeure (pannes techniques, pannes de serveur, etc.).
- **Problèmes avec le service :** Menio n'est pas responsable des problèmes ou erreurs découlant de l'utilisation du service ou de toute interruption de service.

**6. Propriété Intellectuelle**

- Menio détient les droits sur le **contenu généré** sur la plateforme, y compris le design et le code généré pour le site du restaurant.
- **Propriété des données** : Le restaurateur reste propriétaire de ses **données personnelles** et des **informations de son site**.

**7. Données Personnelles et RGPD**

- Menio collecte, stocke et utilise les données personnelles des utilisateurs dans le respect du RGPD pour fournir les services, assurer la maintenance, et améliorer l'expérience utilisateur.
- Le restaurateur dispose des droits d'accès, de rectification et de suppression de ses données personnelles, conformément à la législation en vigueur.

**8. Modifications des CGV**

Menio se réserve le droit de modifier les présentes CGV à tout moment. Les utilisateurs seront informés par email ou via leur dashboard de ces changements. En continuant à utiliser le service après la publication des modifications, l'utilisateur accepte tacitement les nouvelles CGV.

## Conditions générales d'utilisation (CGU)

**1. Objet**

Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation de la plateforme **Menio**. En utilisant le service, vous acceptez ces CGU.

**2. Accès à la plateforme**

- **Création de compte :** L'accès à Menio se fait via un **compte Google** ou un **numéro de téléphone**.
- **Accessibilité :** Le service est accessible sur tous les appareils (PC, mobile, tablette).

**3. Restrictions d'utilisation**

L'utilisateur s'engage à ne pas :

- Utiliser le service de manière abusive, illégale ou pour effectuer des activités nuisibles.
- Tenter de pirater, d'altérer ou de compromettre la sécurité du service.

**4. Gestion des comptes utilisateurs**

- **Compte unique :** Chaque utilisateur a un compte unique. Il n'y a pas de possibilité de gestion multi-utilisateurs à ce stade.
- **Sécurité du compte :** L'utilisateur est responsable de la sécurité de son compte et de ses identifiants.

**5. Modifications du Service**

Menio se réserve le droit de modifier, suspendre ou arrêter tout ou une partie de son service à tout moment, sans préavis. Les utilisateurs seront informés des changements par email.

**6. Propriété Intellectuelle**

- Menio détient tous les droits relatifs au contenu généré sur sa plateforme.
- Le contenu créé par le restaurateur (textes, images, menus) reste la propriété du restaurateur, qui en conserve les droits.

**7. Suspension et Résiliation**

Menio se réserve le droit de suspendre ou de résilier l'accès au service pour toute violation des présentes CGU, sans préavis ni indemnisation.

**8. Support et Assistance**

Le support client est accessible par email à **<support@menio.app>**. Menio garantit une réponse sous **24 heures**.

**9. Données Personnelles et RGPD**

Les données personnelles sont collectées et traitées par Menio pour la gestion des services. Conformément au RGPD, l'utilisateur a des droits d'accès, de rectification et de suppression de ses données personnelles.

**10. Modifications des CGU**

Menio se réserve le droit de modifier ces CGU à tout moment. Les utilisateurs seront informés des changements par email.

**11. Loi Applicable**

Les présentes CGV et CGU sont régies par la loi française. Tout litige relatif à leur interprétation et/ou exécution sera soumis aux juridictions compétentes en France.
`

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <Card
        className={cn(
          'gap-0',
          'prose dark:prose-invert bg-card p-8',
          'prose-h1:text-4xl prose-h1:font-bold prose-h1:mt-0',
          'prose-h2:text-2xl prose-h2:font-semibold prose-h2:mt-0',
          'prose-h3:text-xl prose-h3:font-medium prose-h3:mt-0',
          'prose-p:mt-0 prose-p:leading-tight',
          'prose-ul:my-3 prose-ul:pl-6 prose-li:my-0.5 prose-li:leading-tight prose-li:marker:text-primary',
          'prose-strong:font-semibold',
          'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
          '[&_*]:leading-tight',
        )}
      >
        <Markdown>{locale === 'fr' ? frContent : enContent}</Markdown>
      </Card>
    </div>
  )
}
