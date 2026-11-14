# CHOOP brand and design system — version 1

This guide records the visual direction used in the current landing-page prototype. CHOOP is a proposed social coupon platform; its business model, features, and audience decisions remain open.

## Brand foundation

**Name:** CHOOP, styled as the lowercase wordmark “choop”.  
**Tagline:** Discover. Share. Save.  
**Positioning:** Make discovering places and enjoying offers feel social, simple, and rewarding.  
**Personality:** Optimistic, welcoming, playful, and contemporary.  
**Promise:** More opportunities to discover good places and enjoy good moments together.

### Voice

Write in plain, upbeat language. Lead with the experience and the person, then explain the saving. Use short, conversational sentences and active verbs: discover, share, enjoy, explore. Be warm without sounding pushy. Avoid exaggerated savings claims, invented urgency, and implying that proposed functionality is already live.

Examples: “Discover more. Spend less. Together.” and “Good food. Better company.”

### Wordmark

The prototype uses a lowercase, extra-bold Manrope wordmark with tight tracking and a small pink asterisk. Keep it clear, legible, and surrounded by whitespace. This is a typographic concept, not a finalized logo asset; do not stretch it or place it over busy imagery without sufficient contrast.

## Color

| Role | Color | Hex |
| --- | --- | --- |
| Primary accent | Choop pink | `#FA5C91` |
| Secondary accent | Social purple | `#AD50F6` |
| Reward accent | Reward orange | `#FFB44C` |
| Soft accent | Pastel lavender | `#C5B6F4` |
| Page and card surface | White | `#FFFFFF` |
| Quiet surface | Soft gray | `#F4F5F9` |
| Primary text | Soft black | `#222127` |
| Secondary text | Muted gray | `#696770` |

Use soft black for primary copy and white or pale surfaces for readability. Pink highlights selected heading phrases, accents, and small details; it should not carry essential small text unless contrast is sufficient. Purple, orange, and lavender bring warmth and variety rather than competing for attention. Test actual foreground/background combinations for accessible contrast before production.

### Gradients and motion

The opening area uses a subtle pink, lavender, purple, and mint mesh behind the header and hero. It moves slowly over 24 seconds, without distracting from content. Respect `prefers-reduced-motion` by stopping the animation. Gradients may also add depth to selected cards, but text must remain readable.

## Typography

**Display:** Manrope, primarily weight 800, for headings and the wordmark.  
**Body and interface:** DM Sans, weights 400–700.  
**Fallback:** system sans-serif if web fonts cannot load.

| Style | Desktop | Mobile | Line height / tracking |
| --- | --- | --- | --- |
| Hero | Fluid, 54–80 px | Fluid, 44–52 px | 1.08–1.1 / −0.055em |
| Section heading | Fluid, 40–62 px | Fluid, 36–42 px | 1.12 / −0.05em |
| Card heading | Approximately 21–28 px | Approximately 21–28 px | 1.15–1.25 / −0.035em |
| Body | 15 px | 15 px | 1.75 for long copy |
| Supporting copy | 13–14 px | 13–14 px | 1.7 |
| Eyebrow | 10 px, bold, uppercase | 10 px | 1.4 / 0.14em |
| Fine print | 11 px | 11 px | 1.6; use sparingly |

Use large type and generous whitespace to establish hierarchy. Keep paragraph widths comfortable and avoid applying tight heading tracking to body copy. Highlight only a short part of a heading in pink. Sizes in this guide describe the current prototype, not a fixed production accessibility specification.

## Imagery

Use candid, realistic lifestyle imagery that makes discovery and togetherness tangible: friends sharing food, shopping, café visits, and outings. Favor warm natural light, inviting places, diverse people, and subtle pink or lavender accents. Avoid generic discount banners, clutter, unrealistic claims, and images that imply a real endorsement. Current images are generated concept assets; replace them with appropriately licensed photography when needed. Example stories and reviews must remain clearly labeled until real, permissioned content exists.

## Layout and spacing

- Main container: maximum 1,320 px, with 40 px side margins on wide screens and 20 px on smaller screens.
- Desktop section rhythm: approximately 125 px vertical padding; smaller screens use approximately 85 px.
- Cards generally use 18–25 px rounded corners; buttons use full pill rounding.
- Use generous whitespace, asymmetric editorial compositions, and image-led cards. Avoid making the page feel like a dense marketplace.
- Responsive layouts stack content on narrow screens. The offer carousel remains horizontally scrollable.

## Components

### Navigation

A lowercase wordmark, concise section links, a sign-in link, and a dark primary join button. On narrow screens, use a menu button with an accurate expanded state and descriptive accessible label.

### Buttons and links

Primary actions use a dark pill with white text; secondary actions use a light outlined pill. Use brief action-oriented labels and a small directional arrow. Maintain a clear keyboard focus indicator and sufficient contrast. Prototype actions must clearly state when they are not connected.

### Cards

Use rounded image-led discovery cards, soft category cards, pastel journey tiles, and coupon cards with a dashed divider. Keep a clear content hierarchy and avoid inventing vendor names, prices, terms, or offer availability. Demo content must be identified as such.

### FAQ

Use native expandable disclosure rows with descriptive questions and concise answers. Preserve keyboard access and visible open states. Explain where product decisions remain undecided.

### Forms

Use visible labels, appropriate input types, and concise status feedback. The current newsletter is a visual preview and must not imply a subscription has been recorded.

### Accessibility and motion

Keep text and controls readable against every surface, use descriptive image alternatives, ensure keyboard access and visible focus, and honor reduced-motion preferences. Review at mobile, tablet, and desktop sizes. Do not represent a prototype as a completed accessibility audit.

## Current prototype boundaries

The page contains illustrative metrics, coupons, reviews, and stories. Claiming, accounts, personalization, and newsletter signup are not connected. The proposed social and redemption journeys are concepts, not implemented services. The source of truth for the current implementation is `index.html`, `style.css`, and `script.js` in this folder.
