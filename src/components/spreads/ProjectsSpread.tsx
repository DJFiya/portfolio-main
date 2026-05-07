import rawData from '../../data/portfolio.json'
import type { PortfolioData } from '../../types/portfolio'
import Medallion from '../Medallion'

const data = rawData as unknown as PortfolioData

export default function ProjectsSpread() {
  return (
    <div className="flex flex-col justify-center h-full gap-5">
      {data.projects.map((project, i) => (
        <div key={project.name}>
          {/* Thin rule above each entry */}
          {i > 0 && (
            <div
              className="mb-4"
              style={{
                height: 1,
                background:
                  'linear-gradient(to right, rgba(30,79,160,0.18), transparent)',
              }}
            />
          )}

          <div className="flex items-start gap-3">
            {/* Badge */}
            <div className="flex-shrink-0">
              <Medallion tier={project.awardTier} />
            </div>

            {/* Text */}
            <div className="flex flex-col gap-1 pt-1">
              <a
                href={project.devpostUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-author font-semibold text-ink-900 leading-tight hover:text-azure-700 transition-colors focus-visible:outline-none focus-visible:underline"
                style={{ fontSize: '0.85rem' }}
              >
                {project.name}
                <span className="ml-1 text-azure-500" style={{ fontSize: '0.7rem' }}>
                  ↗
                </span>
              </a>

              <p
                className="font-author text-ink-500 italic leading-snug"
                style={{ fontSize: '0.72rem' }}
              >
                {project.tagline}
              </p>

              <p
                className="font-author text-ink-400 leading-snug"
                style={{ fontSize: '0.67rem', letterSpacing: '0.01em' }}
              >
                {project.awardLabel}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
