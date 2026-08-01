# sofa-scroll

Scroll-driven exploded-view homepage — frame-sequence canvas scrubbing
synced to scroll position via GSAP ScrollTrigger.

## Setup

1. `npm install`
2. Drop your extracted frames (`ezgif-frame-001.jpg` … `ezgif-frame-300.jpg`)
   directly into `public/frames/` — delete the placeholder `.txt` file there
   once you do.
3. `npm run dev`, open `http://localhost:3000`

## Structure

- `app/layout.tsx` — root layout, imports `globals.css`
- `app/page.tsx` — homepage: nav, pinned hero, three content panels
- `components/FrameSequence.tsx` — preloads all 300 frames, draws the
  current one to `<canvas>` based on scroll progress, and fades in the
  teardown-style part callouts (FRAME / CUSHIONS / PILLOWS)
- `app/globals.css` — design tokens (colors, type) and all styling

## Known placeholders to replace

- Brand name "EMBER & OAK" in the nav — swap for your real store name
- All panel copy (materials/comfort/buy sections) — placeholder text,
  not written from real product specs
- Callout scroll-progress thresholds (`0.28`, `0.55`, `0.62` in
  `FrameSequence.tsx`) — tune these against where parts actually
  separate in your specific frame sequence
- Pin distance (`end: "+=400%"`) — controls how much scroll it takes
  to scrub through all 300 frames; adjust to taste

## Performance note

300 preloaded full-res JPGs can be heavy on first load. If it's slow,
downscale the frames to viewport size (they don't need source
resolution) before dropping them into `public/frames/`.
