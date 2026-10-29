import { Analytics } from '@vercel/analytics/react'
import Os from './os/Os'

export default function App() {
  return (
    <>
      <Os />
      <Analytics />
    </>
  )
}
