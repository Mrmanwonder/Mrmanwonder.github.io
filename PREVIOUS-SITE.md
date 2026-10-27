# Where the Sea Keeps Us — V22

## New scroll-film section

The uploaded `Firefly 787395.mp4` is now integrated into the full birthday site as a dedicated scroll-driven section between **Just Us** and **Memories**.

### How it behaves
- The section pins to the viewport while the visitor scrolls.
- Scroll progress maps directly to the video's 192 frames at 24 fps.
- The source video was converted from 4K HEVC to browser-safe 1080p H.264 with frequent keyframes and `faststart` for smooth seeking.
- The scene is muted so the existing **Bloom** soundtrack remains the only audio.
- Once the crowd has mostly disappeared, a restrained cinematic zoom gradually begins.
- The final scale is about **1.145x**, with a tiny upward optical shift so the ending feels closer without becoming dramatic.
- The last part of the scroll holds near the end frame, allowing the final image to land before the memories section begins.
- Reduced-motion users see the final still instead of a scrub animation.

### Video assets
- `assets/video/only-us-scroll.mp4`
- `assets/video/only-us-start.jpg`
- `assets/video/only-us-end.jpg`

## Bloom soundtrack
V22 keeps the resilient soundtrack lookup from V21. The easiest placement is still:

`bloom.mp3` beside `index.html`

The commercial song file itself is not included in this package.
