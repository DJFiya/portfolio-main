import { useEffect } from 'react'
import { createPortal } from 'react-dom'

import resumePdfUrl from '../assets/resume/swe_resume.pdf'

const RESUME_URL = resumePdfUrl

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function ExternalLinkIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}


export default function ResumeModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div
      className="resume-modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="resume-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Resume preview"
      >
        {/* Google Drive–style toolbar */}
        <div className="resume-modal-toolbar">
          <div className="resume-modal-title">
            <span className="resume-modal-pdf-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </span>
            <span className="resume-modal-filename">swe_resume.pdf</span>
          </div>

          <div className="resume-modal-actions">
            <a
              href={RESUME_URL}
              download="swe_resume.pdf"
              className="resume-modal-action-btn"
              title="Download"
              aria-label="Download resume"
            >
              <DownloadIcon />
              <span>Download</span>
            </a>
            <a
              href={RESUME_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="resume-modal-action-btn"
              title="Open in new tab"
              aria-label="Open resume in new tab"
            >
              <ExternalLinkIcon />
              <span>Open</span>
            </a>
            <div className="resume-modal-sep" />
            <button
              type="button"
              className="resume-modal-close"
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* PDF viewer */}
        <div className="resume-modal-body">
          <iframe
            src={`${RESUME_URL}#toolbar=0&navpanes=0&scrollbar=0`}
            className="resume-modal-iframe"
            title="Resume PDF viewer"
          />
        </div>
      </div>
    </div>,
    document.body,
  )
}
