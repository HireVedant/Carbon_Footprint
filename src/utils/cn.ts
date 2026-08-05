/**
 * A simple utility to merge tailwind classes and filter out falsy values.
 * In a larger project, this would typically be replaced by `clsx` + `tailwind-merge`.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ').trim();
}
