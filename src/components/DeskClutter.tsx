import rawData from '../data/portfolio.json'
import type { PortfolioData } from '../types/portfolio'
import { DeskItemSVG } from './DeskItems'

const data = rawData as unknown as PortfolioData

export default function DeskClutter() {
  return (
    <>
      {data.desk.map((item) => (
        <div
          key={item.id}
          className="absolute pointer-events-none select-none"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            // x/y are top-left anchors; rotate around the item's own centre (CSS default)
            transform: `rotate(${item.rotate}deg)`,
            zIndex: item.zIndex,
            opacity: 1,
          }}
        >
          <DeskItemSVG type={item.type} label={item.label} />
        </div>
      ))}
    </>
  )
}
