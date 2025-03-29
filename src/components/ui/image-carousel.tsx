'use client'

import type React from 'react'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import Image from 'next/image'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel'
import { useTranslations } from '@/i18n/useTypedTranslations'

interface ImageCarouselProps {
  images: Array<{
    src: string
    alt: string
  }>
  className?: string
}

export function ImageCarousel({ images, className }: ImageCarouselProps) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [fullscreenImage, setFullscreenImage] = useState<number | null>(null)
  const t = useTranslations()

  // Track the current slide
  useEffect(() => {
    if (!api) {
      return
    }

    const handleSelect = () => {
      setCurrent(api.selectedScrollSnap())
    }

    api.on('select', handleSelect)

    return () => {
      api.off('select', handleSelect)
    }
  }, [api])

  // Open fullscreen view
  const openFullscreen = (index: number) => {
    setFullscreenImage(index)
  }

  // Close fullscreen view
  const closeFullscreen = () => {
    setFullscreenImage(null)
  }

  // Handle keyboard events for fullscreen navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (fullscreenImage === null) return

      if (e.key === 'Escape') {
        closeFullscreen()
      } else if (e.key === 'ArrowRight') {
        setFullscreenImage((prev) =>
          prev === null ? null : (prev + 1) % images.length,
        )
      } else if (e.key === 'ArrowLeft') {
        setFullscreenImage((prev) =>
          prev === null ? null : (prev - 1 + images.length) % images.length,
        )
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [fullscreenImage, images.length])

  // Handle dot indicator click
  const handleDotClick = (index: number) => {
    if (api) {
      api.scrollTo(index)
    }
  }

  // If there's only one image, we'll display it differently
  if (images.length === 1) {
    return (
      <div className={cn('relative mx-auto w-full max-w-3xl', className)}>
        <div
          className="cursor-pointer overflow-hidden rounded-lg"
          onClick={() => openFullscreen(0)}
        >
          <div className="relative h-[500px] w-full overflow-hidden">
            <Image
              src={images[0].src || '/placeholder.svg'}
              alt={images[0].alt}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
              priority
            />
          </div>
        </div>

        {/* Fullscreen modal */}
        {fullscreenImage !== null && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            onClick={closeFullscreen}
          >
            <div className="relative h-full max-h-screen w-full max-w-7xl p-4 md:p-8">
              <div className="relative h-full w-full">
                <Image
                  src={images[0].src || '/placeholder.svg'}
                  alt={images[0].alt}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  closeFullscreen()
                }}
                className="absolute top-4 right-4 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                aria-label={t('components.carousel.closeFullscreen')}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn('relative mx-auto w-full max-w-3xl', className)}>
      <Carousel
        setApi={setApi}
        className="w-full"
        opts={{
          loop: true,
          align: 'center',
          containScroll: false,
        }}
      >
        <CarouselContent className="-ml-4">
          {images.map((image, index) => {
            const isActive = index === current

            return (
              <CarouselItem key={index} className="w-full pl-4">
                <div
                  className={cn(
                    'cursor-pointer overflow-hidden rounded-lg transition-all duration-500',
                    isActive ? 'brightness-100' : 'brightness-90',
                  )}
                  onClick={() => openFullscreen(index)}
                >
                  <div className="relative h-[500px] w-full overflow-hidden">
                    <Image
                      src={image.src || '/placeholder.svg'}
                      alt={image.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                      priority={isActive}
                    />
                  </div>
                </div>
              </CarouselItem>
            )
          })}
        </CarouselContent>

        {/* Custom navigation buttons matching dot colors */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 flex items-center justify-between">
          <CarouselPrevious className="bg-card hover:text-primary/80 pointer-events-auto relative left-4 h-10 w-10 rounded-full border-0 shadow-none" />
          <CarouselNext className="bg-card pointer-events-auto relative right-4 h-10 w-10 rounded-full border-0 shadow-none" />
        </div>
      </Carousel>

      {/* Dot indicators */}
      <div className="mt-6 flex justify-center gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={cn(
              'h-3 w-3 rounded-full transition-all duration-300',
              current === index
                ? 'w-6 bg-gray-400 dark:bg-gray-400'
                : 'bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500',
            )}
            aria-label={t('components.carousel.goToSlide', {
              number: index + 1,
            })}
          />
        ))}
      </div>

      {/* Fullscreen modal */}
      {fullscreenImage !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={closeFullscreen}
        >
          <div className="relative h-full max-h-screen w-full max-w-7xl p-4 md:p-8">
            <div className="relative h-full w-full">
              <Image
                src={images[fullscreenImage].src || '/placeholder.svg'}
                alt={images[fullscreenImage].alt}
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation()
                closeFullscreen()
              }}
              className="absolute top-4 right-4 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
              aria-label={t('components.carousel.closeFullscreen')}
            >
              <X className="h-6 w-6" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                setFullscreenImage((prev) =>
                  prev === null
                    ? null
                    : (prev - 1 + images.length) % images.length,
                )
              }}
              className="absolute top-1/2 left-6 -translate-y-1/2 text-white/80 transition-colors hover:text-white"
              aria-label={t('components.carousel.previousImage')}
            >
              <ChevronLeft className="h-10 w-10 stroke-[1.5]" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                setFullscreenImage((prev) =>
                  prev === null ? null : (prev + 1) % images.length,
                )
              }}
              className="absolute top-1/2 right-6 -translate-y-1/2 text-white/80 transition-colors hover:text-white"
              aria-label={t('components.carousel.nextImage')}
            >
              <ChevronRight className="h-10 w-10 stroke-[1.5]" />
            </button>

            <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation()
                    setFullscreenImage(index)
                  }}
                  className={cn(
                    'h-3 w-3 rounded-full transition-all duration-300',
                    fullscreenImage === index
                      ? 'w-6 bg-white dark:bg-gray-200'
                      : 'bg-gray-500 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500',
                  )}
                  aria-label={t('components.carousel.goToImage', {
                    number: index + 1,
                  })}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
