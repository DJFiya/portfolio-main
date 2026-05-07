import type { PortfolioData } from '../../types/portfolio'
import rawData from '../../data/portfolio.json'
import HangTag from '../HangTag'

const data = rawData as unknown as PortfolioData

// Cycling blue palette — light fills, darker strokes
const TAG_PALETTE = [
  { fill: '#dbeafe', stroke: '#1e4fa0' },
  { fill: '#bfdbfe', stroke: '#1a3a7a' },
  { fill: '#eff6ff', stroke: '#2563c2' },
  { fill: '#e0effe', stroke: '#1e4fa0' },
  { fill: '#c8d8f8', stroke: '#0f2358' },
  { fill: '#d4e8ff', stroke: '#2563c2' },
]

const ROTATIONS = [-4, 3, -2, 5, -3, 4, -1, 2, -5, 3, -2, 4]

export default function ExperiencesSpread() {
  return (
    <div className="flex flex-col gap-7 h-full justify-center">
      {data.experiences.map((exp, ei) => (
        <div key={exp.company} className="flex flex-col gap-3">
          {/* Role heading */}
          <div className="flex items-baseline gap-2">
            <span className="font-author font-semibold text-ink-900 text-sm">
              {exp.title}
            </span>
            <span className="text-ink-300 text-xs select-none">·</span>
            <span className="font-author text-ink-500 text-xs italic">
              {exp.company}
            </span>
          </div>

          {/* Skill tags — natural wrap */}
          <div className="flex flex-wrap gap-x-3 gap-y-5 items-end">
            {exp.skills.map((skill, si) => {
              const colorIdx = (ei * 6 + si) % TAG_PALETTE.length
              const rot = ROTATIONS[(ei * 6 + si) % ROTATIONS.length]
              return (
                <HangTag
                  key={skill}
                  skill={skill}
                  rotate={rot}
                  fillColor={TAG_PALETTE[colorIdx].fill}
                  strokeColor={TAG_PALETTE[colorIdx].stroke}
                />
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
