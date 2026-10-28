// Each chapter route opens the book to the left page of its spread
export const ROUTE_TO_PAGE: Record<string, number> = {
  '/': 0,
  '/experience': 1,
  '/projects': 3,
  '/clubs': 5,
  '/links': 7,
  '/links/resume': 7,  // modal sub-route — same page as /links
  '/back': 9,
}

// Routes that show a modal overlay on top of a page (do not change the active page URL)
export const MODAL_ROUTES = new Set(['/links/resume'])

export function isBookRoute(pathname: string) {
  return Object.hasOwn(ROUTE_TO_PAGE, pathname)
}
