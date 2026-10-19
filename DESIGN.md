# Design direction — October revision

Static HTML/CSS/JavaScript, three production pages, no backend. Editorial typography, cool paper, cobalt, violet and graphite. Page text and backgrounds do not use green theme colors.

## Device imagery

Hero and use-case photos are generated concepts with manufacturer names removed. Samsung Galaxy S24 Ultra and Samsung Galaxy Book6 Ultra are identified only in a separate development test-device note. This is the user-supplied development setup, not a published device benchmark. No compatibility or legal guarantee is inferred from removing labels.

Video calls and content creation are the only images showing people. Their laptop screens show white adult callers/creator as requested; both phone screens consistently show PhoneCam Link controls, rather than a native camera app or face preview. The streaming image has a single cable, fully visible from phone bottom USB to laptop left-side USB, and the phone displays USB ADB. The call concept uses Wi-Fi. Nature remains in the hero, camera comparison and lens examples.

## Layout and controls

Remove the three header section links. Keep Get the apps and a discoverable Get Started page link. Replace the font-dependent Roman numeral pause glyph with native SVG bars/play triangle. Crop the source-based Android UI into a normal phone viewport; lower controls may be outside it. Remove application version text from public pages.

Lens choices: Ultra wide, Wide, Telephoto, Periscope, Front camera. Rear choices illustrate field of view with crops; Front camera turns the phone illustration toward its screen and shows an empty workspace facing a mountain window. No faces are used there. Landscape/Portrait are independent from a persistent Flip horizontally switch.

Connectivity panels are generated from JSON, currently Wi-Fi, USB ADB and Wi-Fi Direct. The phone, PC, labels, port positions and cable are now drawn in one SVG coordinate system. Generic labels do not overlap or detach from the illustration as it scales. Cable endpoints align with the bottom phone port and side of the laptop chassis. Unique clip-path IDs derive from item IDs, so future cards can reuse the same visual safely.

## USB ADB walkthrough

Play on viewport entry, as selected by the user. A 17-second forward sequence shows the cable, Android USB ADB selection and Start camera, Windows USB ADB and Connect, Android debugging authorization if needed, then a connected overview. It does not claim automatic app opening. Scroll does not control time or reverse playback. Completion is held while visible. Leaving the viewport completely resets it for the next entry. Pause, replay, background-tab suspension and OS reduced-motion handling are implemented. Written steps remain readable without animation. The authorization prompt is an illustration; timing and appearance vary, and trusted computers may not prompt.

USB accessory and automatic app opening are removed from the product story. The app itself is unchanged.

## Copy decisions and references

See COPY-REVIEW.md for the user's section-by-section choices. Downloads and Get Started copy are retained pending review. The offline preview now embeds every page to make navigation work without separate downloaded companions.

Original design references: Samsung Galaxy release pages, Apple's product storytelling and NVIDIA's draggable comparison pattern. No third-party site code or commercial template assets were copied.

Follow-up: the lens demonstration uses a shorter desktop layout with a side console and a compact stacked phone layout. USB playback has a bounded stage and collapsible written steps. Wireless wave geometry is identical on both devices and separated from the network label. USB port and plug shapes are generated only for USB mode. The USB signal path is measured with getTotalLength so each animation cycle traverses the complete cable, including future paths of different lengths. Preview fragment navigation is intercepted locally to avoid srcdoc base-URL navigation.

Shared page utility: a fixed round arrow-up button appears after the user scrolls beyond the header, and disappears at the top. Wireless symbols now broadcast by brightening their inner, middle and outer rings in sequence; the phone and PC use identical synchronized timing. Global motion pause and reduced-motion rules still apply. The existing camera logo is restored in the outer offline preview head, with SVG and 32-pixel PNG formats.

Preview navigation now belongs to the outer document’s History API. Page and section clicks record one route entry; Back/Forward restores the relevant page and saved scroll position. A fresh initial frame is mounted when changing pages to avoid secondary iframe navigation entries. The top button remains rendered during its 350 ms opacity-only fade; hidden state blocks pointer and keyboard access. Get Started uses the approved direct page label and instruction headings.

Latest approved refinement: the setup overview has a clear label/title/intro hierarchy and three bordered cards with readable descriptions. On phones each card places its number and icon beside the text. Existing type families and the detailed connection guide remain. The floating top button shares var(--ink), var(--paper), and var(--button-hover) with the primary CTA, so the hover state stays dark with a light arrow. Its opacity-only transition is retained.

The development test-device note is a quiet signature within the dark footer: a centred label, paired outline phone/laptop icons, stacked device names, a fine centre divider and a restrained explanatory line. Both devices keep equal columns on desktop and mobile. The home copyright is centred beneath it.
