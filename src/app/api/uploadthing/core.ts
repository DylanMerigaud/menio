import { MAX_FILES } from '@/app/(private)/onboarding/menu-pictures/MenuAndPicturesForm'
import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { type UploadedFileData } from 'uploadthing/types'

const middleware = async () => {
  console.log('middleware')
  return {}
  // const session = await auth()
  // if (!session) throw new UploadThingError('Unauthorized')
  // return { userId: session.userId }
}

// This is just for server-side tracking, the actual saving to the database
// is done on the client side via tRPC
const onUploadComplete = async ({
  file,
}: {
  metadata: unknown
  file: UploadedFileData
}) => {
  console.log('file url', file.url)
  console.log('file key', file.key)

  // The actual DB operations happen in the client via tRPC
  // in the onClientUploadComplete callback
  return { success: true }
}

const f = createUploadthing()
// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Restaurant menu uploader - PDF only
  restaurantMenu: f({
    pdf: {
      maxFileSize: '8MB',
      maxFileCount: 1,
    },
  })
    .middleware(middleware)
    .onUploadError((error) => {
      console.log('onUploadError', error)
    })
    .onUploadComplete(onUploadComplete),

  // Restaurant pictures uploader - Images only
  restaurantPictures: f({
    image: {
      maxFileSize: '4MB',
      maxFileCount: MAX_FILES,
    },
  })
    .middleware(middleware)
    .onUploadError((error) => {
      console.log('onUploadError', error)
    })
    .onUploadComplete(onUploadComplete),
} satisfies FileRouter
export type OurFileRouter = typeof ourFileRouter
