'use client'

import { useDropzone } from '@uploadthing/react'
import { useCallback, useMemo, useState } from 'react'
import { useUploadThing } from '@/lib/uploadthing'
import {
  generateClientDropzoneAccept,
  generatePermittedFileTypes,
} from 'uploadthing/client'
import { cn } from '@/utils/tailwind'
import { Button } from './button'
import { File, UploadCloud, X } from 'lucide-react'
import { useTranslations } from '@/i18n/useTypedTranslations'
import Image from 'next/image'
import { type ClientUploadedFileData } from 'uploadthing/types'

export type EnhancedUploadDropzoneProps = {
  endpoint: Parameters<typeof useUploadThing>[0]
  className?: string
  onClientUploadComplete?: (
    res: ClientUploadedFileData<{
      success: boolean
    }>[],
  ) => void
  onUploadError?: (error: Error) => void
  showPreview?: boolean
  multiple?: boolean
  maxFiles?: number
  previewType?: 'list' | 'grid'
}

export default function UploadDropzone({
  endpoint,
  className,
  onClientUploadComplete,
  onUploadError,
  showPreview = true,
  maxFiles = 0,
  previewType = 'list',
}: EnhancedUploadDropzoneProps) {
  const t = useTranslations()
  const [files, setFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<Error | null>(null)

  const { startUpload, routeConfig, isUploading } = useUploadThing(endpoint, {
    onClientUploadComplete: (res) => {
      setFiles([])
      setUploadProgress(0)
      onClientUploadComplete?.(res)
    },
    onUploadError: (error) => {
      setUploadProgress(0)
      setError(error)
      onUploadError?.(error)
    },
    onUploadBegin: (uploadBeginData: unknown) => {
      console.log('upload has begun for', uploadBeginData)
    },
    onUploadProgress: (progress) => {
      setUploadProgress(progress)
    },
  })

  const { fileTypes, multiple } = useMemo(() => {
    return generatePermittedFileTypes(routeConfig)
  }, [routeConfig])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!multiple && acceptedFiles.length > 0) {
        setFiles([acceptedFiles[0]])
      } else {
        setFiles(acceptedFiles)
      }
      void startUpload(acceptedFiles)
    },
    [multiple, startUpload],
  )

  const allowedTypes = fileTypes.join(', ')

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: generateClientDropzoneAccept(fileTypes),
    disabled: isUploading,
    multiple: multiple,
    maxFiles: maxFiles > 0 ? maxFiles : undefined,
  })

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev]
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const isImage = (file: File) => {
    return file.type.startsWith('image/')
  }

  const isPdf = (file: File) => {
    return file.type === 'application/pdf'
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const renderPreview = () => {
    if (!showPreview || files.length === 0) return null

    if (previewType === 'grid') {
      return (
        <div className="mt-4 w-full">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="group relative aspect-square rounded border"
              >
                <div className="flex h-full w-full items-center justify-center p-2">
                  {isImage(file) ? (
                    <div className="relative aspect-square h-full w-full">
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="rounded object-cover"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <File className="text-muted-foreground h-10 w-10" />
                      <span className="mt-2 max-w-full truncate text-xs">
                        {file.name}
                      </span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFile(index)
                    }}
                    className="bg-background hover:bg-destructive hover:text-destructive-foreground absolute top-1 right-1 rounded-full p-1 opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className="mt-4 w-full">
        <ul className="space-y-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="bg-muted/30 flex items-center justify-between rounded-md p-2"
            >
              <div className="flex items-center space-x-2">
                {isImage(file) ? (
                  <div className="relative h-10 w-10 overflow-hidden rounded">
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="object-cover"
                      fill
                      sizes="40px"
                    />
                  </div>
                ) : isPdf(file) ? (
                  <File className="text-primary h-10 w-10" />
                ) : (
                  <File className="text-muted-foreground h-10 w-10" />
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{file.name}</span>
                  <span className="text-muted-foreground text-xs">
                    {(file.size / 1024 / 1024).toFixed(2)}{' '}
                    {t('common.megabyte')}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile(index)
                }}
                className="hover:text-destructive ml-2 rounded-full p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  const renderUploadButton = () => {
    // Don't show the button if we're showing a preview and there are no files
    if (isUploading) {
      return (
        <div className="mt-4 w-full max-w-xs">
          <div className="relative pt-1">
            <div className="mb-1 text-center text-xs">
              {uploadProgress >= 100
                ? t('components.uploadDropzone.uploading', {
                    fileName: files[0]?.name || '',
                  })
                : `${Math.round(uploadProgress)}%`}
            </div>
            <div className="bg-secondary mb-4 flex h-2 overflow-hidden rounded text-xs">
              <div
                style={{ width: `${uploadProgress}%` }}
                className="bg-primary flex flex-col justify-center text-center whitespace-nowrap text-white shadow-none transition-all duration-500"
              />
            </div>
          </div>
        </div>
      )
    }

    if (files.length > 0) {
      return (
        <div className="mt-4 flex items-center justify-center">
          <Button
            onClick={(e) => {
              e.stopPropagation()
              void startUpload(files)
            }}
            disabled={isUploading}
            className="group"
          >
            {files.length === 1
              ? t('components.uploadDropzone.uploading', {
                  fileName: files[0].name,
                })
              : t('components.uploadDropzone.selectFiles')}
          </Button>
        </div>
      )
    }

    return null
  }

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {renderUploadButton()}

      <div
        {...getRootProps()}
        className={cn(
          'border-border text-muted-foreground relative flex w-full flex-col items-center justify-center rounded-md border-2 border-dashed p-6 transition-colors',
          isDragActive
            ? 'border-primary bg-secondary/20'
            : 'hover:border-primary/50 hover:bg-secondary/10',
          isUploading && 'pointer-events-none opacity-60',
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <UploadCloud className="text-muted-foreground h-10 w-10" />
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">
              {t('components.uploadDropzone.dragAndDrop')}
            </p>
            <p className="text-xs">
              {t('components.uploadDropzone.allowedTypes', {
                allowed: allowedTypes,
              })}
            </p>
          </div>
        </div>
      </div>

      {error && <div className="mt-4 text-red-500">{error.message}</div>}

      {/* {renderPreview()} */}
    </div>
  )
}
