# Revera

Next.js 14 MVP for drafting medical billing appeals from denial letters and clinical notes.

## Run locally

1. Run `npm install`.
2. Copy `.env.example` to `.env.local` and set `OPENAI_API_KEY`.
3. Run `npm run dev`.

Upload selectable-text PDFs (up to 2 MB each). Revera extracts denial details, drafts an evidence-based appeal, and downloads it as `.docx`. Scanned PDFs need OCR.

Generated letters require qualified review. This MVP does not include authentication, OCR, or document persistence. Do not upload protected health information until your organization has approved the required hosting and AI-provider safeguards.
