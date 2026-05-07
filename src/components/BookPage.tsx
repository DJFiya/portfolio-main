import React from 'react'
import type { ReactNode } from 'react'

interface BookPageProps {
  children?: ReactNode
}

// react-pageflip requires each page child to be a forwardRef component
const BookPage = React.forwardRef<HTMLDivElement, BookPageProps>(({ children }, ref) => (
  <div ref={ref} className="w-full h-full overflow-hidden">
    {children}
  </div>
))

BookPage.displayName = 'BookPage'

export default BookPage
