import rawData from '../../data/portfolio.json'
import type { PortfolioData } from '../../types/portfolio'

const data = rawData as unknown as PortfolioData

export default function ClubsSpread() {
  return (
    <div className="flex flex-col gap-8 h-full justify-center">
      {data.clubs.map((club) => (
        <div
          key={club.org}
          className="flex flex-col gap-1 pl-4"
          style={{ borderLeft: '2px solid #1e4fa0' }}
        >
          <span className="font-author font-semibold text-ink-900 text-sm leading-snug">
            {club.role}
          </span>
          <span className="font-author text-azure-700 text-xs tracking-wide">
            @ {club.org}
          </span>
        </div>
      ))}
    </div>
  )
}
