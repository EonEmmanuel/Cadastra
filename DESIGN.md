# Cadastra-Cameroon design direction

## Design read

Reading this as: a cadastral audit instrument for Cameroonian land surveyors, MINDCAF reviewers, and hackathon judges, in a dark geodetic-instrument visual language, dial ENERGY 2 / RHYTHM 2 / MOTION 1.

## Product character

Cadastra is a measurement and verification tool, not a generic AI SaaS. It should feel like a field instrument that happens to live in a browser: precise, legible, evidence-first, and calm under load. The interface can look technical, but every technical cue must carry real information.

## Palette

| Role | Value | Use |
|---|---|---|
| Base | `#060709` | Page background, the instrument's ground plane |
| Surface | `#0B0E14` | Panels and contained data regions |
| Elevated | `#10141D` | Inputs, hover states, raised controls |
| Accent | `#00DF8F` | Verified results, valid state, the one deliberate accent |
| Warning | `#F5B544` | Regulatory limits and non-fraud anomalies |
| Fraud | `#F04444` | Confirmed fraud or critical failure |
| Text | `#F4F4F5` | Primary copy |
| Muted | `#A1A1AA` | Secondary copy and metadata |

Neutral greys, white, and black do not count toward the core palette. Emerald is the only accent. It appears on verified outcomes and one primary focus moment per screen, not on every icon, border, and label.

## Typography

- **Geist Sans** is the UI face. It is neutral enough for dense legal and geodetic content and keeps the interface readable at small sizes.
- **Geist Mono** is reserved for coordinates, EPSG codes, file hashes, timestamps, and tabular figures. It is a data face, not a decorative "technical" costume.
- No uppercase wide-tracked section eyebrows. Labels are sentence case with normal tracking.
- Type scale: 11, 12, 13, 14, 16, 20, 24, 32, 40, 48. Headings are medium weight, not a wall of bold.

## Layout

- A framed artboard with hairline borders, echoing a printed survey sheet.
- Geodetic registration crosses at the frame corners are the identity motif. They are the one repeated graphic gesture.
- Density is a feature. A cadastral review screen should show the parcel, the declared values, the computed values, and the verdict together.
- One focal point per screen. On the landing page the focal point is the audit composer. On a workspace it is the active parcel or report.
- Whitespace separates evidence groups. It is not a decorative margin.

## Components

- Radius scale: 6px for controls, 10px for panels, 16px for major surfaces. Not every element gets the same radius.
- Status is plain text with a semantic colour and, only when it adds meaning, a functional icon. No dot status badges. No pill or capsule badges.
- Cards contain real data groups. Text is never wrapped in a card, chip, or grid purely to give it a shape.
- Primary button: white surface, dark text. Secondary: hairline border. Ghost: text only. No gradient buttons, no glow buttons.
- Shadows mark elevation only. Most surfaces sit flat.
- Glass is limited to at most one or two elements, such as a modal scrim. It is not the character of the whole interface.

## Motion

- MOTION 1: hover, focus, and state transitions only.
- No scroll reveals, no parallax, no looping glows, no floating decorative elements.
- Reduced motion is respected globally.
- A loading spinner is allowed because it communicates a real wait.

## Imagery

- Real maps, real documents, real extracted values, and real verdicts.
- No halftone domes, aurora blobs, rainbow gradients, generic 3D shapes, or stock illustrations.
- If a decorative mark is needed, use the registration-cross motif or a coordinate grid that refers to the cadastral subject.

## Evidence rules

- Every number comes from the backend or a named public standard. No invented traction, uptime, customer, or accuracy claims.
- Technology references are labelled as references, not customers or partners.
- Empty states say why they are empty and what to do next.
- The prototype disclaimer stays visible. The tool does not replace a licensed surveyor or a MINDCAF title.

## Session bans

These are absolute for any UI produced in this session:

- No dot or status indicator badges.
- No `Sparkles` icon or sparkle-style glyph.
- No uppercase wide-tracked label cards.
- No text wrapped in decorative containers, cards, grids, or chips purely for shape.
- No capsule or pill badges of any kind.

## Dial rationale

- **ENERGY 2**: the product should feel confident and technical, not loud. The data is the spectacle.
- **RHYTHM 2**: sections are consistent enough to scan, with deliberate breaks for the composer, the evidence panel, and the legal limits.
- **MOTION 1**: this is a review instrument. Motion confirms state; it does not perform.
