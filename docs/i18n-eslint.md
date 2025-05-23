ESLint
To ensure correct usage of next-intl, you can use ESLint to enforce certain rules.

Avoid hardcoded labels in component markup
The react/jsx-no-literals rule from eslint-plugin-react can be helpful with spotting hardcoded labels in component markup. This can be especially helpful when migrating a project to next-intl, if you want to make sure that all labels have been extracted.

eslint.config.js
// ...

rules: {
// Avoid hardcoded labels
'react/jsx-no-literals': 'error'
}

Be careful though that this doesn’t catch hardcoded attributes (e.g. aria-label="Open menu").

Consistent usage of navigation APIs
If you are using i18n routing, you might want to ensure that developers consistently use the navigation APIs that you’ve configured in your project.

In this example, developers will be prompted to import from @/i18n/navigation when they try to import navigation APIs from Next.js.

eslint.config.js
// ...

rules: {
// Consistently import navigation APIs from `@/i18n/navigation`
'no-restricted-imports': [
'error',
{
name: 'next/link',
message: 'Please import from `@/i18n/navigation` instead.'
},
{
name: 'next/navigation',
importNames: ['redirect', 'permanentRedirect', 'useRouter', 'usePathname'],
message: 'Please import from `@/i18n/navigation` instead.'
}
]
