export type Project = {
  id: string
  name: string
  color: string
  award: string
  prize: string
  line: string
  points: string[]
  stack: string[]
  links: [string, string][]
  // Shape of the ascent plot: apoapsis height and where the gravity turn ends (0–1)
  apo: number
  turn: number
}

export type Role = {
  tick: string
  role: string
  org: string
  when: string
  points: string[]
}

export const PROJECTS: Project[] = [
  { id: 'avesia', name: 'Avesia', color: '#1B3A6B', award: 'Winner · NexHacks', prize: '$1k New York trip and a billboard', line: 'No-code platform for composing and deploying real-time AI surveillance pipelines.',
    points: ['Full-stack React + FastAPI + MongoDB app with a Gemini-powered vision agent and REST API.', 'OpenCV motion detection gates vision API calls to frames with movement.'],
    stack: ['React', 'FastAPI', 'Python', 'MongoDB', 'OpenCV', 'Tailwind'], links: [['Devpost', 'https://devpost.com/software/avesia']], apo: 0.82, turn: 0.42 },
  { id: 'compass', name: 'Compass', color: '#1F5132', award: 'Winner · QHacks', prize: '', line: 'AI civic dashboard that queries 137k+ service requests and writes data-backed analytical reports.',
    points: ['RAG pipeline on FastAPI, Supabase and pgvector, with a Gemini agent for trend analysis.', 'UMAP projects 768-dimension embeddings into an interactive 3D cluster view.'],
    stack: ['FastAPI', 'pgvector', 'Supabase', 'PostgreSQL', 'React', 'scikit-learn'], links: [['Live site', 'https://compass-queens.vercel.app']], apo: 0.7, turn: 0.55 },
  { id: 'blurr', name: 'Blurr', color: '#6B1E2A', award: 'Semifinalist · Hack the North', prize: '', line: 'Real-time privacy shield that detects and blurs sensitive information in live video streams.',
    points: ['Low-latency YOLOv8, OpenCV and WebRTC pipeline with sub-100ms in-memory redaction.'],
    stack: ['FastAPI', 'OpenCV', 'WebRTC', 'React', 'Python', 'TypeScript'], links: [['Devpost', 'https://devpost.com/software/blurr']], apo: 0.6, turn: 0.35 },
  { id: 'solari', name: 'Solari', color: '#6E4A0E', award: 'HackThe6ix', prize: '', line: 'AI assistive wearable with real-time audio and haptic feedback for people who are visually impaired.',
    points: ['Multimodal pipeline with TwelveLabs and Gemini for real-time scene analysis and narration.', 'Dual Raspberry Pi system isolating QNX for sensors and Linux for AI inference.'],
    stack: ['Python', 'C', 'QNX', 'TwelveLabs', 'Embedded'], links: [['Devpost', 'https://devpost.com/software/aura-gpnklq']], apo: 0.52, turn: 0.62 },
]

// Oldest first: the Career fader runs left to right through time
export const ROLES: Role[] = [
  { tick: 'Waterloo', role: 'University of Waterloo', org: 'BASc Biomedical Engineering, Software Engineering option', when: 'Sep 2024 – Present', points: ['3.9 GPA, President’s Scholarship of Distinction.'] },
  { tick: 'Biomech', role: 'Machine Learning Engineer', org: 'Biomechatronic Design Team · Waterloo, ON', when: 'Sep 2024 – Apr 2025', points: ['Built a TensorFlow pipeline classifying 8 hand gestures from wavelet-denoised EMG at 91.6% test accuracy.', 'Developed a Matplotlib + Tkinter tool for real-time EMG signal visualization, used by the team for debugging.'] },
  { tick: 'RideCo', role: 'Software Engineer in Test', org: 'RideCo On-Demand Transit · Waterloo, ON', when: 'May 2025 – Aug 2025', points: ['Shipped Python/Django features for a production AI transit agent across behaviour, routing, and admin configuration.', 'Reduced LLM costs by 70% via dynamic model routing, prompt token optimization, and context window tuning.', 'Built an LLM eval framework (simulated users, LLM judge, tool-call judge) that gated agent changes before release.'] },
  { tick: 'Relay', role: 'QA Engineer', org: 'Relay Financial · Toronto, ON', when: 'Jan 2026 – Apr 2026', points: ['Engineered an AWS Lambda test account generator with DynamoDB and S3, saving $25K in annual testing costs.', 'Developed a React/Vue.js/TypeScript platform powering bug bashes and release workflows for 80+ engineers.', 'Built GitHub Actions and Jira integrations to automate test tracking and bug reporting, saving 5+ hours/week.'] },
  { tick: 'Courtyard AI', role: 'Software Engineer', org: 'Courtyard AI · Toronto, ON', when: 'Sep 2026 – Present', points: ['Designed a durable scheduling engine that runs recurring AI agent tasks for business owners at under 6¢ per run.', 'Built isolated per-user sandboxes on Modal so the agent can safely run code and edit files, passing 18/18 evals.', 'Rebuilt browser-agent recovery so failed steps resume instead of silently stalling, eliminating 64 audited stalls.', 'Built an end-to-end eval suite testing the live agent on 52 scenarios with an LLM judge panel, catching 5 launch bugs.'] },
]

export const EMAIL = 'daevikjain@gmail.com'

// [label, display text, href]
export const CONTACTS: [string, string, string][] = [
  ['Email', EMAIL, `mailto:${EMAIL}`],
  ['GitHub', 'github.com/DJFiya', 'https://github.com/DJFiya'],
  ['LinkedIn', 'linkedin.com/in/daevik-jain', 'https://linkedin.com/in/daevik-jain'],
  ['Devpost', 'devpost.com/daevikjain', 'https://devpost.com/daevikjain'],
]

export const RESUME_PDF = '/resume/swe_resume.pdf'

export const WALLS: [string, string][] = [['Moss', '#2E4A3A'], ['Ink', '#1D2742'], ['Slate', '#2B3036'], ['Plum', '#3A2438'], ['Clay', '#5A3B2B']]
