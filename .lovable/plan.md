# Refine live fraud alerts

## Changes
- Update the alert feed to keep events in chronological order and smoothly follow the newest row at the bottom.
- Add a short synthesized ping when a new `BLOCK` event arrives, enabled after the user’s first interaction to respect browser audio rules.
- Animate the Loss Prevented value from its previous total to each new total, while honoring reduced-motion preferences.

## Technical details
- Keep all behavior client-side with React refs/effects and the Web Audio API; no media file or backend is needed.
- Preserve the 40-alert limit and existing dashboard styling.
- Verify the live feed, BLOCK-only sound trigger, animated total, and current build status.
