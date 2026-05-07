import type React from 'react'
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
          className="absolute select-none desk-item"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            '--item-rotate': `${item.rotate}deg`,
            zIndex: item.zIndex,
          } as React.CSSProperties}
        >
          <DeskItemSVG type={item.type} label={item.label} />
        </div>
      ))}
    </>
  )
}
