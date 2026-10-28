import { useEffect } from 'react'

const SITE_URL = 'https://daevik.vercel.app'
const SITE_NAME = 'Daevik Jain'

// title: chapter shown in the tab; canonical: the indexable URL for the route
const ROUTE_META: Record<string, { title?: string; canonical: string }> = {
  '/':             { canonical: '/' },
  '/experience':   { title: 'Experience', canonical: '/experience' },
  '/projects':     { title: 'Projects',   canonical: '/projects' },
  '/clubs':        { title: 'Clubs',      canonical: '/clubs' },
  '/links':        { title: 'Links',      canonical: '/links' },
  '/links/resume': { title: 'Resume',     canonical: '/links' },
  '/back':         { canonical: '/' },
}

export function useRouteMeta(pathname: string) {
  useEffect(() => {
    const meta = ROUTE_META[pathname] ?? ROUTE_META['/']
    const title = meta.title ? `${meta.title} · ${SITE_NAME}` : SITE_NAME
    const url = SITE_URL + meta.canonical
    document.title = title
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', url)
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', url)
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title)
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', title)
  }, [pathname])
}
