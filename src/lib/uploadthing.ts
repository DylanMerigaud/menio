'use client'

import {
  generateReactHelpers,
  generateUploadButton,
  generateUploadDropzone,
} from '@uploadthing/react'
import type { OurFileRouter } from '@/app/api/uploadthing/core'

// Generate the upload UI components
export const UploadButton = generateUploadButton<OurFileRouter>()
export const UploadDropzoneBase = generateUploadDropzone<OurFileRouter>()

// Generate the helper hooks
export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>()
