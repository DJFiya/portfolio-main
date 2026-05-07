import rawData from '../../data/portfolio.json'
import type { PortfolioData } from '../../types/portfolio'
import HangTag from '../HangTag'

const data = rawData as unknown as PortfolioData

const ROTATIONS = [-4, 3, -2, 5, -3, 4, -1, 2, -5, 3, -2, 4]

export default function ExperiencesSpread() {
  return (
    <div className="flex flex-col gap-7 h-full justify-center">
      {data.experiences.map((exp, ei) => (
        <div key={exp.company} className="flex flex-col gap-3">
          <div>
            <span className="font-author font-semibold text-ink-900 text-sm tracking-wide">
              {exp.title}
            </span>
            <span className="font-author text-azure-700 text-sm"> @ {exp.company}</span>
          </div>
          <div className="flex flex-wrap gap-x-2 gap-y-4 items-end">
            {exp.skills.map((skill, si) => (
              <HangTag
                key={skill}
                skill={skill}
                rotate={ROTATIONS[(ei * 6 + si) % ROTATIONS.length]}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
