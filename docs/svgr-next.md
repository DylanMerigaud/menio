Install
npm install --save-dev @svgr/webpack

# or use yarn

yarn add --dev @svgr/webpack
Usage
Using SVGR in Next.js is possible with @svgr/webpack.

next.config.js

module.exports = {
webpack(config) {
// Grab the existing rule that handles SVG imports
const fileLoaderRule = config.module.rules.find((rule) =>
rule.test?.test?.('.svg'),
)

    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
        use: ['@svgr/webpack'],
      },
    )

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i

    return config

},

// ...other config
}
Your code

import Star from './star.svg'

const Example = () => (

  <div>
    <Star />
  </div>
)
Or, using the classic (URL) import:

import Image from 'next/image'
import starUrl from './star.svg?url'

const Example = () => (

  <div>
    <Image src={starUrl} />
  </div>
)
Please refer to SVGR webpack guide for advanced use cases.

TypeScript
Using SVGR with TypeScript support.

Type decleration

Add a custom type decleration file (e.g. svgr.d.ts) to the root of your repo.

declare module '\*.svg' {
import { FC, SVGProps } from 'react'
const content: FC<SVGProps<SVGElement>>
export default content
}

declare module '\*.svg?url' {
const content: any
export default content
}
tsconfig.json

Add the type decleration file to your tsconfig.json's include array. Ensure it's the first item.

{
"include": [
"svgr.d.ts",
"next-env.d.ts",
"**/*.ts",
"**/*.tsx",
".next/types/**/*.ts"
]
// ...other config
}
