import rawData from '../../data/portfolio.json'
import type { PortfolioData } from '../../types/portfolio'
import Medallion from '../Medallion'

const data = rawData as unknown as PortfolioData

export default function ProjectsSpread() {
  return (
    <div className="flex flex-col gap-6 h-full justify-center">
      {data.projects.map((project) => (
        <div key={project.name} className="flex items-start gap-3">
          <div className="flex-shrink-0 pt-0.5">
            <Medallion tier={project.awardTier} />
          </div>
          <div className="flex flex-col gap-0.5">
            <a
              href={project.devpostUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-author font-semibold text-ink-900 text-sm hover:text-azure-700 transition-colors focus-visible:outline-none focus-visible:underline"
            >
              {project.name} ↗
            </a>
            <p className="font-author text-ink-600 text-xs italic leading-snug">
              {project.tagline}
            </p>
            <p className="font-author text-ink-400 text-xs mt-0.5 leading-snug">
              {project.awardLabel}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
