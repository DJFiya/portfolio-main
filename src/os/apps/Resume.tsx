import { EMAIL, PROJECTS, RESUME_PDF, ROLES } from '../content'

export function ResumeTools() {
  return <a className="btn" style={{ height: 30, fontSize: 13 }} href={RESUME_PDF} target="_blank" rel="noopener">Open PDF</a>
}

export default function Resume() {
  return (
    <div className="cv">
      <article className="cv-page">
        <h3>Daevik Jain</h3>
        <p className="contact">{EMAIL} · linkedin.com/in/daevik-jain · daevik.vercel.app · github.com/DJFiya</p>
        <h4>Education</h4>
        <div className="cv-role"><span>University of Waterloo</span><span>Sep 2024 – Present</span></div>
        <div className="cv-org">BASc in Biomedical Eng, Option in Software Eng, President Scholarship of Distinction, 3.9 GPA</div>
        <h4>Technical skills</h4>
        <div>
          <b>Languages:</b> Python, TypeScript, JavaScript, C++, C, Java, SQL, Bash, HTML/CSS, MATLAB<br />
          <b>Frameworks &amp; Libraries:</b> React, Next.js, Node.js, FastAPI, PyTorch, TensorFlow, scikit-learn, Playwright, Vercel AI SDK<br />
          <b>Tools &amp; Technologies:</b> AWS, Docker, Terraform, PostgreSQL, Redis, MongoDB, Supabase, GitHub Actions, Linux, Datadog
        </div>
        <h4>Experience</h4>
        {ROLES.slice(1).reverse().map(r => (
          <div key={r.tick}>
            <div className="cv-role"><span>{r.role}</span><span>{r.when}</span></div>
            <div className="cv-org">{r.org}</div>
            <ul>{r.points.map(p => <li key={p}>{p}</li>)}</ul>
          </div>
        ))}
        <h4>Projects</h4>
        {PROJECTS.map(p => (
          <div key={p.id}>
            <div className="cv-role"><span>{p.name} · {p.award}</span><span /></div>
            <ul><li>{p.line}</li>{p.points.map(x => <li key={x}>{x}</li>)}</ul>
          </div>
        ))}
      </article>
    </div>
  )
}
