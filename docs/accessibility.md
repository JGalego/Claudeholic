# Accessibility contract

Accessibility is part of the premise's craftsmanship, not a compliance garnish.
The essential intervention must remain understandable and operable across input
methods, motion preferences, viewport sizes, and enhancement failures.

## Target

The project targets WCAG 2.2 AA for the public site. Automated checks are useful
evidence, not a substitute for manual review.

## Structural requirements

- One clear `h1`; headings descend without skipped levels in each content tree.
- Semantic landmarks identify navigation, main content, complementary content,
  and footer information.
- Every form control has a persistent visible label.
- Status changes use restrained live regions and do not steal focus.
- Links remain identifiable without relying on color alone.
- The skip link becomes visible on focus.
- The page retains complete guidance and manual scoring instructions without
  JavaScript.

## Interaction requirements

- Every action is available by keyboard.
- Focus indicators have at least a 3:1 contrast change and are never clipped.
- The terminal uses a native modal dialog, restores focus when closed, and
  offers `Ctrl+Shift+.` as a discoverable non-sequence shortcut.
- The native recovery disclosure remains usable if enhancement code fails.
- Achievement notifications do not interrupt typing or trap focus.
- No interaction depends solely on hover, precise timing, or pointer gestures.

## Visual requirements

- Normal text meets 4.5:1 contrast; large text and interface boundaries meet
  3:1 where WCAG permits.
- Content reflows without horizontal page scrolling at 320 CSS pixels.
- Text remains usable at 200% browser zoom.
- Fixed-format controls have stable dimensions and labels wrap safely.
- Color supplements text, shape, state labels, or native semantics.

## Motion requirements

Under `prefers-reduced-motion: reduce`:

- scrolling is immediate;
- entry and toast animation durations collapse;
- the panic protocol skips its theatrical progress sequence; and
- the fake typing cursor resolves immediately.

There is no autoplay audio, flashing content, parallax, or endless ambient
movement.

## Manual release checklist

1. Navigate the complete page with `Tab`, `Shift+Tab`, `Enter`, `Space`, and
   arrow keys where native controls support them.
2. Complete and reset the assessment using only the keyboard.
3. Open, operate, and close the terminal without a pointer.
4. Enable reduced motion and repeat the panic protocol.
5. Disable JavaScript and verify that every core section and instruction remains.
6. Inspect 320, 390, 768, 1440, and 1920 CSS-pixel widths for overlap.
7. Zoom to 200% and verify that controls and copy reflow.
8. Review landmark, heading, form-label, dialog, and live-region output with a
   screen reader.
9. Run automated accessibility and Lighthouse checks, then investigate every
   finding rather than treating the score as absolution.

## Known distinction

Hidden jokes are optional content. Safety advice, privacy disclosures,
attribution, navigation, and the non-medical disclaimer are never hidden behind
an easter egg.