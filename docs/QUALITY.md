# Design and quality review

## Design intent

A manga-like editorial sequence: prologue, origin, projects, toolkit, learning, and the next conversation. Paper, ink, vermilion, halftone texture, speed lines, angled panels, and condensed display type establish the visual world. The existing portrait is retained instead of inventing a likeness.

Recruiter needs remain a first-class path: a quick-view dossier, clear role/experience, real project links, readable case studies, and direct contact.

## Impeccable guidance

Official read-only reference: https://github.com/pbakaus/impeccable and https://impeccable.style.

The craft-floor, animate, audit, and critique guidance informed the review: preserve the requested manga world, make the work visible immediately, avoid generic gradients and unnecessary 3D loaders, use restrained state feedback, provide keyboard and reduced-motion alternatives, keep touch targets comfortable, and inspect real pixels.

No Impeccable executable, installer, external paid checker, or detector was run. This is a guidance-based design review plus automated browser/accessibility testing.

## Automated verification

`npm run check` checks unique IDs, in-page anchors, local file existence, HTTPS URLs, external-link isolation, real contact, reduced motion, and absence of runtime CDN dependencies.

`npm test` uses Playwright Chromium and axe-core. Coverage includes:

- Desktop and mobile layouts in PT-BR and English
- Viewport widths 320, 360, 390, 600, 768, 1024, and 1440
- No horizontal overflow
- Native project and recruiter dialogs, dismissal, focus restoration
- Repeated project filters
- Local sandbox examples, idempotency, interrupted requests
- Command palette, search, keyboard navigation, empty states
- Actual clipboard copy and email destination
- Operating-system and manual reduced-motion choices
- Mobile touch-emulated navigation, controls, and a vertical gesture
- Main content without JavaScript
- Local JavaScript errors and missing network resources
- Deployment asset allowlist

Screenshots and exact test results are written to `test-results/` after each run. Automated WCAG results do not prove full accessibility. Mobile touch emulation is not physical-device testing. Safari/Firefox and actual email-client opening have not been tested here. Issuer access/validity and production deployment require separate verification.

## Performance and maintenance

The third-edition static deploy is approximately 2.4 MB total, including self-hosted WOFF2 fonts, the original portrait, and fourteen source-grounded badge PNGs. Badge images are lazy-loaded; the original first-screen assets stay lightweight. There is no runtime framework, third-party script, analytics, backend dependency, or artificial loading screen. Animations pause offscreen and when the page is hidden. Reduced motion leaves all content visible.

The build publishes only approved assets. History and original assets stay in the repository. The feature branch should be reviewed before merging and enabling the GitHub Pages Actions source.

## Second-edition motion and interaction review

The Chinese-inspired paper dragon uses inline SVG and a coordinated native Web Animations API timeline for head, body, legs, and tail. There is no GLB, 3D engine, external animation CDN, or runtime package dependency. The user’s Anime.js/SpiritJS-style references informed the pure-code choreography.

In the second edition, badge anchors stayed positionally stable while the creature artwork moved. The third edition below adds coordinated traveling cargo and a separate stable credential grid. Explicit pause/resume, offscreen pause, hidden-page pause, OS reduced motion, and global motion controls share the same motion controller. The static credential grid remains a complete alternative.

New Playwright coverage includes all seven real images, badge dossiers and correct credential types, paper-dragon greeting and timeline controls, stable hit-target geometry, architecture layer selection/keyboard movement/interruptions, in-page professional details, GitHub destinations, hidden key sequences, touch-discovered margin panels, repeated bug-hunt/reset, language switching, and reader Back/Forward behavior. The actual downloadable file is separately tested, including embedded dynamic badge images.

## Third-edition actual motion review

The earlier idle float was replaced by an 8.4-second walking/delivery sequence. Seven independently articulated paper segments, four gait-driven limbs, whiskers, and cargo hinges share one clock. Each badge banner follows its corresponding body hinge until the selected banner detaches into the delivery dock. The SVG skeleton is mirrored to face its direction of travel; badge artwork remains upright and unchanged.

Mission selection, pause/resume, restart, and keyboard/touch route scrubbing make the choreography inspectable. Motion pauses offscreen, with hidden tabs, and while a dialog is open. Reduced motion is static by default. An explicit, scene-only full-motion choice allows a visitor to opt into the bounded demonstration without enabling other page animation. The global motion control stops that demonstration.

The motion tests measure actual horizontal travel, differing limb transforms, stable banner-to-segment offsets, a frozen paused position after native animation pause has settled, a visible selected-banner flight, and different delivered credentials. Screenshots capture early travel, walking, the handoff, and the completed delivery. Long-task sampling covers an isolated walking interval; screenshot and axe injection costs are excluded and no physical-device performance guarantee is asserted.

The complete third-edition suite covers 75 Playwright checks, 13 automated WCAG audits, and 10 separate checks against the actual self-contained file. The source still has zero runtime package dependencies. The expanded original badge artwork makes the full static deploy approximately 2.4 MB; badge images remain lazy-loaded.

## Fourth-edition illustration review

This focused update preserves the approved page layout, credential content, walking route, and physical banner delivery. The dragon illustration replaces sparse decorative marks with readable anatomy: layered, curved scale plates; broad belly plates; branched antlers; distinct brow/iris/nostril/jaw/fangs; folded mane/beard; curled whiskers; joint armor and separated claws; and layered tail folds/tassels. Major features have a strong ink silhouette; smaller fold strokes support rather than replace it. Paper-plane shading and painted occlusion use ordinary vector fills, not GPU filters or 3D models.

The source SVG contains 244 nodes, using shared paint servers for repeated scale and belly geometry. Mane, beard, and tail-tassel movement belong to the existing bounded walking clock and pause together with the carried credentials. An optional static inspector exposes face, armor/claws, tail, and full-dragon views. Its cloned paint servers have unique IDs and its geometry is excluded from the walking selectors. The journey pauses while inspection owns focus, then resumes after dismissal.

Independent design review and real desktop/mobile pixel inspection confirmed that anatomy is visible at actual scene size. Review found the mobile greeting control obscuring the taller antlers; it was moved clear of the head before final verification. The official Impeccable craft-floor/critique guidance informed this review; no Impeccable detector, executable, or overlay was installed or run.

The complete fourth-edition regression passes 87 Playwright checks, 16 zero-violation automated WCAG audits, and 11 checks against the actual self-contained downloadable HTML. New coverage verifies the SVG node budget, paint-server references, unique IDs, inspector views and focus restoration, PT/EN copy, emulated touch/reduced motion, secondary appendage movement, and synchronized pause/resume during inspection. The isolated motion long-task sample remains evidence from this cloud Chromium run, not a claim about physical devices.

## Fifth-edition continuous-flight review

The reported frozen animation was reproduced in the actual fourth-edition downloadable file with normal motion enabled. Three code behaviors caused it: a one-shot 8.4-second sequence permanently canceled its articulated motion; a 1%-visible scene header could start the sequence before the dragon stage appeared; and viewport-height changes canceled motion without restarting it. These were code issues, not an assumption about the visitor's settings.

The fifth edition observes meaningful stage visibility and runs a 14.8-second entry/flight/toss/exit cycle. Seven armor segments have distinct sinusoidal offsets and tangent rotations. A covered curve joins the anatomy, while head, fins, floating limbs, tail, mane, beard, and whiskers have independent subordinate phases. There is no ground-contact gait. A banner is released at its actual carried position, follows a separate controlled arc, and lands in a fixed credential-image slot. The next cycle rotates to a different catalog entry and changes the flight phase/altitude; the previous credential stays readable until replacement.

Repeat mode, manual pause/resume, restart, mission selection, route scrubbing, and a static close-up remain available. Hovering or keyboard-focusing the fixed delivered card pauses the shared clock for reading. Offscreen/hidden-page signals pause it; returning resumes it. Height-only resizing preserves the clock, and width changes rebuild geometry at the existing cycle progress. Reduced motion remains static by default, with an explicit scene-only demonstration choice. The drawing now has 253 source SVG nodes and still uses zero runtime dependencies.

Live independent desktop/mobile pixel review confirmed a coherent flying wave and intact anatomy. The greeting control was moved outside the flight canvas so entering antlers stay visible; the tail wave was constrained and given clearance. A fading-toast contrast issue found by axe was also corrected: visible functional text retains full contrast.

Final verification: 87 main Playwright checks, 16 zero-violation automated WCAG audits, and 25 checks against the actual self-contained HTML. The file tests include two real-time deliveries with different badge IDs, independent segment positions/angles, release/landing continuity, loop off/on, hover/focus reading holds, stage visibility, responsive recovery, mobile normal motion, and a simulated hidden-tab signal. The hidden-tab check is a signal simulation in headless Chromium, not a claim of physical browser-tab testing. Touch remains emulated; Safari/Firefox and physical devices were not tested. An unaccelerated browser recording and multiple motion frames supplement the measurements. The prepared GitHub Pages workflow runs both main and standalone suites; it has not run remotely because publication remains paused.

## Sixth-edition QA draft (pending browser verification)

This targeted revision separates ETEC/FATEC education from professional experience, anchors Auxilium at ETEC’s2022 hackathon, explains the2019 drone administrative role and hardware volunteering, broadens the sourced toolkit, and personalizes the local illustrative lab. The new concept cover embeds the authentic Auxilium PNG unchanged. The approved dragon flight, marquee, architecture explorer, Keel/StarWars covers, and project links are retained.

Local syntax/static checks and the allowlisted build pass. This cloud environment’s installed Chromium cannot create its Unix sockets, including after the permitted execution review, so sixth-edition browser, axe, screenshot, and standalone verification are pending an authorized local QA run. Prior fifth-edition results above are not sixth-edition results. The separate QA draft does not replace the tested Library preview.
