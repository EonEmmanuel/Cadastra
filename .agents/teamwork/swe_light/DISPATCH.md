## 2026-11-04T16:29:37Z

This is a single self-contained fix; keep it small and focused. Refine the AI analysis section and the PDF download button in Cadastra-Cameroon according to the design rules in DESIGN.md and AGENTS.md. Set the PDF download button text to display both English "Download" and French "Téléchargement" without abnormal text wrapping, applying UI/UX and web design skills.

Integrity mode: development

## Requirements

### R1. Bilingual PDF Download Button and Typography
Update the PDF download button to display both English "Download" and French "Téléchargement". Structure the typography, padding, and layout to ensure the button label and surrounding elements do not wrap awkwardly or break across responsive viewport widths.

### R2. Design Guidelines and UI/UX Alignment
Align the AI analysis section and surrounding components with the project design direction in DESIGN.md and AGENTS.md (dark geodetic aesthetic, ENERGY 2 / RHYTHM 2 / MOTION 1). Apply anti-ai-slop rules during the work to ensure clean visual hierarchy, proper spacing rhythm, and polished micro-interactions without generic AI UI patterns.

## Verification Resources
- Repository build and lint checks (`npm run lint`, `npm run build`)
- Visual and structural review against `DESIGN.md` (dark geodetic aesthetic, ENERGY 2 / RHYTHM 2 / MOTION 1) and `AGENTS.md` (anti-ai-slop standards)

## Acceptance Criteria

### Button Layout and Bilingual Labeling
- [ ] The PDF download button displays both "Download" (English) and "Téléchargement" (French)
- [ ] The text within the PDF download button does not exhibit abnormal or broken line wrapping across mobile and desktop viewport widths

### Design System and Quality
- [ ] The AI analysis presentation complies with the dark geodetic design direction, motion constraints, and visual rhythm defined in DESIGN.md
- [ ] Anti-ai-slop design and copywriting checks pass without generic decorative elements or broken component states per AGENTS.md
- [ ] The project builds and passes lints without regressions
