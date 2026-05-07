import { BrowserRouter } from 'react-router-dom'
import DeskScene from './components/DeskScene'
import BookPortfolio from './components/BookPortfolio'
import './index.css'

export default function App() {
  return (
    <BrowserRouter>
      <DeskScene>
        <BookPortfolio />
      </DeskScene>
    </BrowserRouter>
  )
}
