# Oria Design Plan

## Subject Matter & Audience
**Product**: Oria – a place discovery & trip planning app for explorers in Germany (Closed Beta)
**Audience**: Urban explorers, travelers, locals wanting to discover hidden gems nearby
**Primary Job**: "Discover what's around you" – serendipitous place discovery with AI assistance

---

## Color Palette (6 named values)

| Token | Hex | Usage |
|-------|-----|-------|
| `ink` | #0B1220 | Primary text, high-contrast headlines |
| `ink-muted` | #4A5568 | Secondary text, captions |
| `paper` | #FAFAFA | Base background (warm off-white, not sterile) |
| `paper-elevated` | #F5F5F5 | Card/sheet backgrounds |
| `accent` | #D94A1C | Primary actions, focus states – burnt orange/terracotta (evokes discovery, warmth, clay) |
| `accent-soft` | #FFF3EF | Accent backgrounds, subtle highlights |
| `success` | #1E7D32 | Saved states, confirmations |
| `border` | #E2E8F0 | Hairline dividers, input borders |

**Rationale**: Avoids the generic blue-purple SaaS palette. Terracotta (`#D94A1C`) feels grounded, human, and distinct – like a clay map pin or brick façade. Warm off-white (`#FAFAFA`) is easier on eyes than pure white and works with glassmorphism.

---

## Typography

| Role | Font | Weights | Sizes |
|------|------|---------|-------|
| **Display / Headlines** | **Albert Sans** (variable) | 700, 800 | 48/32/24/20 |
| **Body / UI** | **Almarai** (Arabic/Latin, clean humanist) | 400, 600, 700 | 17/15/13/11 |

**Scale (ratio 1.25)**:
- Display: 48 / 1.15 lh / -0.5 tracking
- H1: 32 / 1.2 lh / -0.3 tracking  
- H2: 24 / 1.3 lh / normal
- H3: 20 / 1.35 lh / normal
- Body: 17 / 1.6 lh / normal
- Body-sm: 15 / 1.6 lh / normal
- Caption: 13 / 1.5 lh / +0.3 tracking
- Overline: 11 / 1.4 lh / +0.5 tracking / uppercase

**Rationale**: Albert Sans has geometric warmth and distinctive caps (Q, G, K) – memorable at large sizes. Almarai is highly legible at small sizes, supports German umlauts beautifully, and feels friendly not corporate. Two clearly distinct families.

---

## Layout Concept

**Alignment**: Left-aligned throughout (not centered hero). Content breathes with generous margins.

**Spacing Scale** (4px base):
- xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48, xxxl: 64

**Border Radius**:
- Tight: 8 (chips, badges)
- Card: 16 (content cards)
- Sheet: 24 (bottom sheets, modals)
- Pill: 9999 (pills, FABs)

**Glassmorphism**: Retain but refine – single `heavy` variant with 0.95 opacity, subtle border, no heavy shadows. Let the blur do the work.

**ASCII Wireframe – Landing Page**:
```
┌─────────────────────────────────────┐
│  ◀ Back                    🇩🇪 DE  │  ← Minimal top bar
├─────────────────────────────────────┤
│                                     │
│       Oria                          │  ← Albert Sans 48, ink
│   Discover what’s                  │  ← Almarai 20, ink-muted
│   around you.                       │
│                                     │
│   [ Start Exploring ]        (xl)   │  ← Accent pill button
│                                     │
│   Already have an account? Sign in  │  ← Ghost link
│                                     │
├─────────────────────────────────────┤
│  WHY ORIA              (overline)   │
│                                     │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐│  ← 3 columns, icon + title + desc
│  │ 🗺️ Map  │ │ ✨ AI   │ │ ❤️ Save ││     No cards – inline layout
│  └─────────┘ └─────────┘ └─────────┘│
│                                     │
├─────────────────────────────────────┤
│  DISCOVER           (overline)      │
│  Interactive map with live          │
│  places, smart search, categories   │
│  [ Open Map ]                       │  ← Secondary button
│                                     │
├─────────────────────────────────────┤
│  PLAN TRIPS           (overline)    │
│  AI itineraries, multi-modal        │
│  routing, Google Maps export        │
│  [ Plan a Trip ]                    │
│                                     │
├─────────────────────────────────────┤
│  PRIVACY FIRST          (overline)  │
│  Your data. Your control.           │
│  [ Read Policy ]                    │
│                                     │
└─────────────────────────────────────┘
```

**Key Principles**:
1. **One memorable element**: The terracotta accent on a warm paper ground – no gradients, no purple.
2. **Type as design**: Headlines set in Albert Sans with tight leading become visual anchors.
3. **No card kits**: Content flows in sections, not chopped into identical rounded rectangles.
4. **German-first copy**: All UI text in German (Beta is DE-only).
5. **Restrained motion**: Single page-load fade-in on hero; tap feedback only.
6. **Accessibility**: 4.5:1 contrast, focus rings, reduced-motion respected.

---

## Implementation Order

1. **Tokens** → `src/design-system/Colors.ts`, `Typography.ts`, `Layout.ts`
2. **Font loading** → `app/_layout.tsx` (expo-font)
3. **Core components** → GlassCard, GlassButton, GlassChip, Typography primitives
4. **Landing page** → `app/landing/index.tsx` (full rebuild)
5. **App screens** → Explore, AI, Saved, Profile – apply new tokens
6. **Onboarding** → Apply new tokens + German copy
7. **Review & critique** → Self-check against plan

---

## Self-Critique Checklist (post-build)

- [ ] No `#0066CC` / `#FF6B35` / `#00A86B` remains in UI
- [ ] No "System" font-family in any StyleSheet
- [ ] No ALL-CAPS labels (except overline: 11px, +0.5 tracking)
- [ ] No single-word color accents in headlines
- [ ] No identical card grid (4-up feature grids removed)
- [ ] German copy throughout
- [ ] Terracotta `#D94A1C` used only for primary actions & focus
- [ ] Albert Sans loads and renders on web & native
- [ ] Landing page loads < 2s, no layout shift
