import rawData from '../../data/portfolio.json'
import type { PortfolioData } from '../../types/portfolio'

const data = rawData as unknown as PortfolioData

export default function ClubsSpread() {
  return (
    <div className="flex flex-col gap-8 h-full justify-center">
      {data.clubs.map((club) => (
        <div
          key={club.org}
          className="flex flex-col gap-1 pl-4 border-l-2 border-azure-600"
        >
          <span className="font-author font-semibold text-ink-900 text-sm leading-snug">
            {club.role}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-ink-300 text-xs select-none">·</span>
            <span className="font-author text-ink-500 text-xs italic">{club.org}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
