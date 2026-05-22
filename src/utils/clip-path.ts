/**
 * Generate a beveled rectangle clip-path polygon.
 * All bevels are 45° cuts at the corners.
 */
export function bevelRect(bevel = 6): string {
  return `polygon(
    ${bevel}px 0%,
    calc(100% - ${bevel}px) 0%,
    100% ${bevel}px,
    100% calc(100% - ${bevel}px),
    calc(100% - ${bevel}px) 100%,
    ${bevel}px 100%,
    0% calc(100% - ${bevel}px),
    0% ${bevel}px
  )`;
}

/**
 * Bevel that only cuts top-left and bottom-right corners.
 * Useful for asymmetric industrial accents.
 */
export function bevelDiagonal(bevel = 6): string {
  return `polygon(
    ${bevel}px 0%,
    100% 0%,
    100% calc(100% - ${bevel}px),
    calc(100% - ${bevel}px) 100%,
    0% 100%,
    0% ${bevel}px
  )`;
}

/**
 * Bevel for a border-only overlay (used with ::before pseudo-element).
 */
export function bevelBorderPath(bevel = 6): string {
  return bevelRect(bevel);
}
