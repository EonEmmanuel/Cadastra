# Project agent instructions

## Design direction

For UI work, read `DESIGN.md` for the product's visual direction, then the
antislop core as the filter. The direction is a cadastral audit instrument:
dark geodetic language, emerald accent, ENERGY 2 / RHYTHM 2 / MOTION 1.

<!-- antislop:start -->
## anti-ai-slop

For UI, copy, people, mobile, dashboard, motion, or code work, read
`.agents/skills/antislop/SKILL.md` (core) and then the skill for the task:

- Master catalog: `.agents/skills/antislop-master/SKILL.md`
- UI / visual: `.agents/skills/antislop-ui/SKILL.md`
- Layout / composition: `.agents/skills/antislop-layout/SKILL.md`
- Copy & text: `.agents/skills/antislop-copywriting/SKILL.md`
- People / accessibility: `.agents/skills/antislop-human/SKILL.md`
- Mobile / responsive: `.agents/skills/antislop-layoutmobile/SKILL.md`
- Mobile / native: `.agents/skills/antislop-mobile/SKILL.md`
- Dashboard / data: `.agents/skills/antislop-dashboard/SKILL.md`
- Forms / states: `.agents/skills/antislop-forms/SKILL.md`
- Motion: `.agents/skills/antislop-motion/SKILL.md`
- Navigation: `.agents/skills/antislop-nav/SKILL.md`
- Authenticity: `.agents/skills/antislop-authenticity/SKILL.md`
- Design system: `.agents/skills/antislop-designsystem/SKILL.md`
- Imagery: `.agents/skills/antislop-imagery/SKILL.md`
- Code comments: `.agents/skills/antislop-code/SKILL.md`

To activate the whole family at once, load `.agents/skills/slop/SKILL.md`.
Before starting, ask the user when anti-ai-slop applies: during the work, or
after it is done.
<!-- antislop:end -->

## Button label economy & wrapping
- Primary action buttons in compact panels (width <= 480px) must use concise labels (e.g. "Download" in English, "Téléchargement" in French) rather than multi-word sentences.
- Always apply `whitespace-nowrap` and `shrink-0` to button text and icons to prevent multi-line text breaking on responsive viewports.

## Geodetic instrument visual purity
- Never use the Lucide `Sparkles` icon (auto_awesome, ✨) anywhere in the application.
- Adhere strictly to the geodetic palette: Base `#060709`, Surface `#0B0E14`, Elevated `#10141D`, Single Accent Emerald `#00DF8F`. Avoid arbitrary saturated blue gradients.
- Avoid `rounded-full` capsule badges for tags and chips; use the established radius scale (6px for controls, 10px for panels, 16px for cards).
- Use sentence-case headings; do not use uppercase wide-tracked labels.
