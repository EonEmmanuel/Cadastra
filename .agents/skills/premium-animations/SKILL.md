---
name: premium-animations
description: Implement premium micro-interactions and motion design for luxury e-commerce interfaces using framer-motion and thoughtful animation principles.
---
# PREMIUM ANIMATIONS FOR LUXURY E-COMMERCE

## Overview
This skill provides guidelines for implementing sophisticated, premium animations that enhance the luxury feel of e-commerce interfaces while maintaining performance and accessibility.

## Core Principles

### 1. Purpose-Driven Motion
Every animation must serve a clear purpose:
- **Feedback**: Confirming user actions (button presses, form submissions)
- **Guidance**: Directing attention to important elements
- **Continuity**: Maintaining context during state changes
- **Never animate just for decoration**

### 2. Luxury Motion Characteristics
- **Subtlety**: Premium is in the restraint - avoid flashy or excessive motion
- **Weight**: Movements should feel substantial and weighted, not floaty
- **Control**: Precise, intentional movements with clear beginnings and ends
- **Natural Physics**: Use spring physics for interactive elements, easing for transitions

### 3. Performance First
- Animate only `transform` and `opacity` for GPU acceleration
- Respect `prefers-reduced-motion` media query
- Keep UI animations under 300ms unless justified
- Test on mid-range devices

## Implementation Guidelines

### Button Interactions
Use spring physics for tactile feedback:
```tsx
<motion.button
  whileHover={{ scale: 1.02, transition: { type: 'spring', stiffness: 300 } }}
  whileTap={{ scale: 0.97, transition: { type: 'spring', stiffness: 500 } }}
  whileFocus={{ scale: 1.01, transition: { type: 'spring', stiffness: 400 } }}
>
  Button Content
</motion.button>
```

### Card Interactions
Gentle lift on hover with spring physics:
```tsx
<motion.div
  whileHover={{ y: -4, transition: { type: 'spring', stiffness: 300 } }}
>
  Card Content
</motion.div>
```

### Image Interactions
Natural zoom on product images:
```tsx
<motion.img
  whileHover={{ scale: 1.04, transition: { type: 'spring', stiffness: 400 } }}
  whileTap={{ scale: 0.98, transition: { type: 'spring', stiffness: 500 } }}
/>
```

### Page Transitions
Smooth route transitions with ease-out:
```tsx
<AnimatePresence>
  <motion.div
    key={pathname}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] } }}
    exit={{ opacity: 0, y: -10, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] } }}
  >
    {/* Page content */}
  </motion.div>
</AnimatePresence>
```

### Loading States
Sophisticated skeleton loaders:
```tsx
<motion.div
  style={{
    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
    backgroundSize: '200% 100%',
  }}
  variants={{
    initial: { backgroundPosition: '-200% 0' },
    animate: { 
      backgroundPosition: '200% 0',
      transition: { duration: '2s', ease: 'linear', repeat: Infinity }
    }
  }}
  initial="initial"
  animate="animate"
/>
```

## Specific Component Enhancements

### Product Cards
- Container: Gentle entrance animation with spring physics
- Image: Natural zoom on hover (1.04x) with tap feedback (0.98x)
- Buttons: Premium tactile feedback with spring physics
- Swatches: Hover scale with spring physics
- Action buttons: Elevated hover states

### Image Carousel
- Main image: Smooth transitions between images
- Navigation buttons: Hover and press states with spring feedback
- Thumbnails: Gentle scale on hover/press

### Forms
- Inputs: Focus state with subtle scale and color transition
- Buttons: Press and hover feedback
- Validation: Gentle shake for errors (use sparingly)

### Navigation
- Mobile menu: Smooth slide-in/fade-in
- Dropdowns: Precise snap entrance
- Links: Subtle underline animation on hover

## Safety and Accessibility

### Reduced Motion Support
Always respect user preferences:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}
```

### Interaction Safety
- Never animate elements that change frequently (>100x/day)
- Avoid animating numerical values (prices, counts)
- Ensure animations don't interfere with readability
- Provide static alternatives for critical information

## Implementation Files Created

1. `/src/components/ui/premium-button.tsx` - Enhanced button with spring physics
2. `/src/components/ui/premium-card.tsx` - Card with entrance and hover animations
3. `/src/components/ui/premium-image.tsx` - Image with natural zoom effects
4. `/src/components/ui/premium-skeleton.tsx` - Sophisticated loading skeletons
5. `/src/components/premium-layout.tsx` - Page transition wrapper
6. Enhanced components:
   - `src/features/products/components/product-card.tsx`
   - `src/features/products/components/product-image-carousel.tsx`
   - `src/features/products/routes/loading.tsx`

## Usage Guidelines

1. **Install framer-motion**: `bun add framer-motion`
2. **Import premium components** from `@/components/ui`
3. **Apply animations purposefully** - every motion should have a clear reason
4. **Test thoroughly** on different devices and with reduced motion preferences
5. **Maintain consistency** - use the same motion patterns throughout the application

## Review Checklist

Before implementing any animation, ask:
- [ ] Does this animation serve a clear purpose (feedback, guidance, continuity)?
- [ ] Is the motion subtle and weighted, not floaty or flashy?
- [ ] Does it use performant properties (transform/opacity only)?
- [ ] Does it respect prefers-reduced-motion?
- [ ] Is the duration appropriate for the interaction type?
- [ ] Does it enhance, not distract from, the luxury experience?