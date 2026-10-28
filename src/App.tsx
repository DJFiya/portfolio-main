import { BrowserRouter, useLocation } from 'react-router-dom'
import DeskScene from './components/DeskScene'
import BookPortfolio from './components/BookPortfolio'
import NotFound from './components/NotFound'
import { isBookRoute } from './routes'
import './index.css'

function Page() {
  const { pathname } = useLocation()
  return isBookRoute(pathname) ? <BookPortfolio /> : <NotFound />
}

export default function App() {
  return (
    <BrowserRouter>
      <DeskScene>
        <Page />
      </DeskScene>
    </BrowserRouter>
  )
}
