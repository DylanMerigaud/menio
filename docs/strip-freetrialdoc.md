Using trial periods on subscriptions
Delay payments on active subscriptions using trial periods.
Copy page
You can start a customer’s subscription with a free trial period by providing a trial_end argument when creating the subscription:

server.js

// Set your secret key. Remember to switch to your live secret key in production.
// See your keys here: <https://dashboard.stripe.com/apikeys>
const stripe = require('stripe')('sk_test_51R816MCFwkQ9nUpdvddOsufhNSJixbxVr3QKzYhSl4JE3ApFfSGFgGZ6kC7Of38pIrfIlLNH3ZAOXPFqqVVI45KM00b4cvE1VT');

const subscription = await stripe.subscriptions.create({
customer: '{{CUSTOMER_ID}}',
items: [
{
price: '{{PRICE_ID}}',
},
],
trial_end: 1610403705,
});
The trial_end parameter takes a timestamp indicating the exact moment the trial ends. When creating a subscription, you can alternatively use the trial_period_days parameter: an integer representing the number of days the trial lasts, from the current moment.

When creating a subscription with a trial period, no payment method is required for the customer. An immediate invoice is still created, but for $0.

Intra-subscription trials
Trial periods are normally applied at the start of a subscription, but you can also use a trial period on an existing subscription to change the subscription’s billing cycle.

When the trial ends, if the subscription status isn’t paused, we generate an invoice and send an invoice.created event notification. Approximately 1 hour later, we attempt to charge that invoice. A new billing cycle also begins for the customer when the trial ends.

To end a trial early, make an update subscription API call, setting the trial_end value to a new timestamp, or now to end immediately:

server.js

// Set your secret key. Remember to switch to your live secret key in production.
// See your keys here: <https://dashboard.stripe.com/apikeys>
const stripe = require('stripe')('sk_test_51R816MCFwkQ9nUpdvddOsufhNSJixbxVr3QKzYhSl4JE3ApFfSGFgGZ6kC7Of38pIrfIlLNH3ZAOXPFqqVVI45KM00b4cvE1VT');

const subscription = await stripe.subscriptions.update(
'{{SUBSCRIPTION_ID}}',
{
trial_end: 'now',
}
);
Combining trials with billing cycle anchor
As of API version 2018-02-05, you can also combine trials with billing_cycle_anchor, resulting in a free period followed by a prorated period, leading into a fixed billing cycle.

For example, suppose it’s the 15th of the month and you want to give your customer a free 7 day trial (until the 22nd), and then start normal billing on the 1st. You can do this through the API by combining trials with billing_cycle_anchor. (This isn’t currently available through the Dashboard.)

In this example, the customer gets an invoice for a prorated amount on the 22nd (for the period until the 1st). Then, on the 1st, they’ll be invoiced again for the full amount, and again on the 1st of the following month, and so on.

server.js

// Set your secret key. Remember to switch to your live secret key in production.
// See your keys here: <https://dashboard.stripe.com/apikeys>
const stripe = require('stripe')('sk_test_51R816MCFwkQ9nUpdvddOsufhNSJixbxVr3QKzYhSl4JE3ApFfSGFgGZ6kC7Of38pIrfIlLNH3ZAOXPFqqVVI45KM00b4cvE1VT');

const subscription = await stripe.subscriptions.create({
customer: '{{CUSTOMER_ID}}',
items: [
{
price: '{{PRICE_ID}}',
},
],
trial_end: 1610403705,
billing_cycle_anchor: 1611008505,
});
Metered billing with paused subscriptions
You can send meter events associated with a price on a subscription even while it’s paused. However, after the subscription resumes, the invoice won’t include any meter events sent during the paused state. Future invoices only include meter events that occur after the resume date. If you use legacy usage records, you can’t create new usage records while a subscription is paused.

Combining trials with add_invoice_items
Trial periods for subscriptions can be combined with one time prices and add_invoice_items. This may happen if you want to charge a one time fee or add on at the same time as starting a trial. Note that doing this will cause an invoice to be cut immediately for the amount of the one time item at the beginning of the trial.

Compliance requirements for trials and promotions
You must comply with card network requirements when offering trials, whether they’re free or not. This includes scenarios like free trials or charging customers a reduced price for the first few months and then automatically charging them your normal rate. When using our trials features, you can enable messaging settings in the Stripe Dashboard to help you meet the requirements.

If you notify users of successful payments, Stripe automatically displays information about the trial and the cancellation URL in those notifications.

If you don’t use these settings, you’re still responsible for complying with the requirements.

When customer emails are enabled, a reminder is sent seven days before a trial ends. If a trial is shorter than seven days, the reminder email is sent as soon as the trial begins. If trials are renewed, a reminder email is resent.

If both trial reminders and subscription renewal reminders are enabled during a trial, customers only receive the trial ending reminder. Renewal emails are then sent for subsequent billing periods.

The cancellation policy link is a URL that is displayed on customer receipts, along with other trial information. This information is included for all card payments. The cancellation URL is also included in the reminder email that is sent to customers seven days before their trial ends.

For statement descriptors, if you manually set the statement descriptor on the invoice, the trial text isn’t appended so you need to add it. If you use product statement descriptors, the trial text is appended automatically. If your statement descriptor is greater than 10 characters, make sure it still makes sense to your customers with the trial text appended. There is a 22 character limit so anything after the 10th character is overwritten with \* TRIAL OVER.

If you don’t manually set the statement descriptor or use product statement descriptors, the trial text is appended to your account’s statement descriptor. If needed, you can set up a shortened descriptor to ensure the trial text displays correctly.

Meeting requirements without using Stripe’s features
If you offer trials or promotions without using our trials features, you still need to comply with the requirements. You can listen for the invoice.upcoming event to determine when to send email notifications. To add text to your statement descriptor that indicates the promotion is over:

Listen for the customer.subscription.updated event
Check to see if a trial or promotion has ended
Update the statement descriptor on the subscription’s latest_invoice
You need to update the latest invoice within an hour of its creation while it’s still in draft status.

Create free trials without collecting payment method
Security tip
While starting a free trial without a payment method lets your potential customers try your product or service faster, it can also allow spammers to create lots of fake customers, usage, and subscriptions. We recommend carefully considering the signup flow here to balance making it easy for real customers and difficult for spam bots to abuse (for example, requiring customers to create a user account and complete a captcha before starting their free trial subscription).

You can sign customers up for a free trial of a subscription without collecting their payment details in the Dashboard, the API, and Checkout. When you create the subscription, you can specify whether to cancel or pause the subscription if the customer didn’t provide a payment method during the trial period. To cancel or pause the subscription, set the trial_settings.end_behavior.missing_payment_method parameter when you create or update the subscription:

Cancel subscription-If the free trial subscription ends without a payment method, it cancels immediately. You can create another subscription if the customer decides to subscribe to a paid plan in the future. Set missing_payment_method=cancel to cancel the subscription when it reaches the end of a trial without an available payment method.
Pause subscription-If the free trial subscription ends without a payment method, it pauses and doesn’t cycle until it’s resumed. When a subscription is paused, it doesn’t generate invoices (unlike when a subscription’s payment collection is paused). When your customer adds their payment method after the subscription has paused, you can resume the same subscription. The subscription can remain paused indefinitely. Set missing_payment_method=pause to pause the subscription when it reaches the end of a trial without an available payment method.
Alternatively, set missing_payment_method=create_invoice to invoice at the end of the trial if no payment method is present. If a payment method isn’t provided when the invoice finalizes, the subscription moves into past_due.

Configure reminder emails to collect customer’s payment details in your free trial messaging settings.

Configure free trials without payment methods to cancel
Use the Dashboard, the API, or Checkout to create free trials of a subscription without collecting payment details from your customers, and to configure your subscription to cancel if the trial ends without a payment method.

Dashboard

API

Checkout
You can use the Dashboard to sign customers up for a free trial of a subscription without collecting their payment details:

From the Subscriptions settings of the Dashboard, select +Create subscription.
After adding your customer and product information, select +Add free trial, then input how many days the free trial lasts.
Select the Pause or cancel if free trial ends without a payment method option, then select Cancel immediately. If you’re using test clocks, advance to the end of the trial. You won’t see an upcoming invoice for the subscription.
Listen to the customer.subscription.deleted event that informs you when a subscription cancels at the end of trials without a payment method.
If you provide a payment method or select the Email invoice to customer with link to payment page option, the Pause or cancel if free trial ends without a payment method option won’t be visible.

Configure free trials without payment methods to pause
Use the Dashboard, the API, or Checkout to create free trials of a subscription without collecting payment details from your customers, and to configure your subscription to pause if the trial ends without a payment method.

Dashboard

API

Checkout
You can use the Dashboard to sign customers up for a free trial of a subscription without collecting their payment details:

From the Subscriptions settings of the Dashboard, select +Create subscription.
After adding your customer and product information, select +Add free trial, then input how many days the free trial lasts.
Select the Pause or cancel if free trial ends without a payment method option, then select Pause. If you’re using test clocks, advance to the end of the trial. You won’t see an upcoming invoice for the subscription.
Listen to the customer.subscription.paused event that informs you when a subscription pauses at the end of trials without a payment method.
If you provide a payment method or select the Email invoice to customer with link to payment page option, the Pause or cancel if free trial ends without a payment method option won’t be visible.

Collect payment details from your customer before their trial ends
Configure your subscription to automatically send a reminder email when the customer’s trial is about to expire. You must comply with the card network requirements when offering trials. Learn more about compliance requirements for trials and promotions.

Events
Events are triggered every time a free trial changes. Make sure that your integration properly handles the events. For example, you might want to email a customer before a free trial ends. Learn more about handling subscription events.

The following table describes the events that trigger before a free trial ends, when a trial subscription pauses or cancels, and when a subscription is resumed and becomes active.

Event Description Use case
customer.subscription.deleted Sent when a subscription ends. Stop providing access to your product in response to this event. The subscription moves to the canceled status and sends this event after a free trial ends without a payment method and if the subscription’s missing_payment_method end behavior is set to cancel.
customer.subscription.resumed Sent when a subscription is no longer paused. When you receive this event, grant the customer access to the product if access was revoked while the subscription was paused. Paused subscriptions are converted into active subscriptions after being resumed. Resuming a subscription might generate an invoice and corresponding Payment Intent that must be paid before the subscription moves out of the paused status.
customer.subscription.paused Sent when a subscription is fully paused. Invoicing won’t occur until the subscription resumes. When you receive this event, you can revoke the customer’s access to the product until they add a payment method and the subscription resumes. Stop providing access to your product in response to this event. The subscription moves to the paused status and sends this event after a free trial ends without a payment method and if the subscription’s missing_payment_method end behavior is set to pause. The subscription remains paused until explicitly resumed.
customer.subscription.trial_will_end Sent three days before the trial period ends. If the trial is less than 3 days, this event is triggered. Configure the subscription to automatically send an email to your customer 3 days before the trial period ends.
Use the customer portal to collect payment
After you create a subscription for a customer without collecting a payment method, you can redirect them to the Billing customer portal to add their payment details.

First, configure the Billing customer portal to enable your customers to manage their subscriptions.

Next, collect billing information from your customers:

Listen to the customer.subscription.trial_will_end event.
If the subscription doesn’t have a default payment method, get the customer’s email using the Customers API and send them a message with a link to your site. It’s helpful to embed the customer ID in the email. For example: <https://example.com?...&customer={{CUSTOMER_ID}}>.
When the customer enters your site, create a customer portal session using the customer ID from the previous step.
Redirect the customer to the customer portal, where they can update their subscription with payment details.
Allow customers to reactivate their subscriptions in the customer portal
To enable the subscription of a customer whose trial ended in a paused subscription through the customer portal, enable the free trial without payment method feature when creating a new subscription in the Dashboard.

Send an email reminder before the trial ends
To send a reminder email prior to the end of the trial, select the Link to a Stripe-hosted page option in the Subscriptions and emails setting. The reminder email contains a link for the customer to add or update their payment details. We don’t send free trial reminder emails in a sandbox. Learn more about how to setup free trial reminders.

Use the customer.subscription.trial_will_end event to send your own hosted emails to customers. After you see the event in the Dashboard, it’s confirmed that your email has been sent.

Convert a trial if customers provide payment information before the trial ends
Subscriptions and upcoming invoices are created at the start of the trial and become active at the end of the trial if the customer provides a payment method.

Configure pausing when a payment method isn’t provided
After a free trial ends, you can configure subscriptions to pause if no default payment method is available for a subscription on a per-subscription basis.

You can update subscriptions while they’re paused. Updates that typically generate prorations (adding items, changing price or plan, changing quantity, and so on) won’t generate proration line items because the customer isn’t being charged while the subscription is paused. If you want to extend a trial after a subscription transitions into a paused status, you must resume the subscription before configuring a trial.

We check default_source and default_payment_method on the subscription and customer to determine whether a subscription is missing a payment method at the end of a trial.

Resume a paused subscription
Use the Dashboard, API, customer portal, or Hosted Invoice Page to resume a paused subscription.

Dashboard

API

Customer portal

Hosted Invoice Page
To resume a paused subscription in the Dashboard, navigate to the subscription, then select Resume Subscription under the Actions menu. Select Reset billing cycle or Always invoice (if you’re not resetting the billing cycle) from the Resume subscription modal to charge the customer immediately.

Invoicing a subscription
While paused, a subscription won’t create an invoice. If you want to continue creating invoices, use pause_collection to stop collecting payments while continuing to invoice and advance billing periods.

To preview the invoice that’s generated when a paused subscription is resumed, specify subscription_details.resume_at.
