import type { SVGProps } from 'react'

// Sized to the surrounding font and coloured by currentColor, so they drop in
// where text glyphs used to be without new CSS.
function Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    />
  )
}

export function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M4 4l8 8M12 4l-8 8" />
    </Icon>
  )
}

export function StopIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <rect x="4" y="4" width="8" height="8" rx="1" fill="currentColor" stroke="none" />
    </Icon>
  )
}

export function NoteIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M6 12V3.5l6-1.5V10.5" />
      <circle cx="4.5" cy="12" r="1.5" fill="currentColor" />
      <circle cx="10.5" cy="10.5" r="1.5" fill="currentColor" />
    </Icon>
  )
}
