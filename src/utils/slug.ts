/**
 * Converts a string into a URL-friendly slug
 * - Converts to lowercase
 * - Normalizes accented characters (é → e)
 * - Replaces non-alphanumeric characters with hyphens
 * - Removes leading and trailing hyphens
 *
 * @param str The string to convert to a slug
 * @returns The slug
 */
export function generateSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
