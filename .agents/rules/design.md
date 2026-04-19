---
trigger: always_on
---

Design System Strategy: Technical Editorial

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Blueprint Archive."** 

This system is designed to move the mechanical engineering portfolio away from a generic resume and into the realm of a high-end technical publication. We are blending the precision of industrial blueprints with the sophisticated white space of architectural magazines. The visual identity avoids standard "web-style" components in favor of an intentional, technical aesthetic characterized by hard edges (0px border radius), asymmetric layouts, and vertical text elements that mimic the annotations found on CAD drawings.

By utilizing a monochromatic core with a sophisticated Moss Green anchor and Cyan technical highlights, the interface creates an environment of authority and meticulous detail.

---

## 2. Colors
Our palette is rooted in the "Precision Moss" spectrum, utilizing tonal depth rather than structural lines to create hierarchy.

### Color Principles
- **The "No-Line" Rule:** Standard 1px solid borders for sectioning are strictly prohibited. Boundaries must be defined through background color shifts. For example, a project specification block (`surface_container_low`) should sit atop the main page (`surface`) to create a natural, architectural break.
- **Surface Hierarchy:** Use the `surface_container` tiers to nest content.
    - **Page Background:** `surface` (#f9f9f7)
    - **Project Cards:** `surface_container_lowest` (#ffffff) to make them "pop" forward.
    - **Technical Specs Blocks:** `surface_container_high` (#e8e8e6) to suggest a recessed, structural area.
- **Technical Highlights:** Use `tertiary` (#005a7b) and `tertiary_fixed_dim` (#87cff9) exclusively for CAD-related callouts, data points, or software-specific badges. This mimics the standard UI of tools like CATIA or NX.
- **The "Glass & Gradient" Rule:** Use `primary` (#46583c) transitioning into `primary_container` (#5e7153) for large Hero backgrounds. Apply a `backdrop-blur` of 12px to navigation elements using a semi-transparent `surface` color to maintain the feeling of stacked technical sheets.

---

## 3. Typography
The typography system utilizes a high-contrast scale to separate "Engineering Specs" from "Narrative Storytelling."

- **Headings (Space Grotesk):** An industrial, wide-aperture sans-serif that feels engineered. 
    - **Display Large (3.5rem):** Reserved for section numbers and major project titles.
    - **Headline Medium (1.75rem):** Used for project phases (e.g., "01. Concept Generation").
- **Body & Labels (Inter):** A hyper-readable, neutral typeface for technical descriptions.
    - **Title Medium (1.125rem):** Used for spec labels (e.g., "Material: Grade 5 Titanium").
    - **Label Small (0.6875rem):** Used for CAD software versioning and metadata.

**Editorial Tip:** Use `label-md` with 10% letter spacing and `text-transform: uppercase` for all technical metadata to reinforce the industrial aesthetic.

---

## 4. Elevation & Depth
In this system, elevation is an expression of material density, not light and shadow.

- **The Layering Principle:** Depth is achieved by "stacking" surface tokens.
    - **Level 0:** `surface` (The drafting table)
    - **Level 1:** `surface_container_low` (The drawing sheet)
    - **Level 2:** `surface_container_highest` (The focused component)
- **Ambient Shadows:** Standard drop shadows are banned. If an element must float, use a "Technical Glow" using the `on_surface` color at 4% opacity with a 40px blur—this mimics the soft ambient occlusion found in high-end CAD renders.
- **The "Ghost Border" Fallback:** If a technical drawing requires a border for clarity, use `outline_variant` at 20% opacity. It should feel like a faint pencil guideline, not a digital box.
- **Vertical Orientation:** Reference the Behance inspiration by placing "Vertical Text Annotations" along the left edge of project containers using `primary` at low opacity to denote software tools (e.g., "CATIA V5" rotated -90 degrees).

---

## 5. Components

### Buttons
- **Primary:** `primary` background, `on_primary` text. Shape: 0px radius.
- **Secondary:** `outline` border (Ghost Border style), `on_surface` text.
- **Interaction:** On hover, shift background to `primary_container`. No rounded corners; the engineer's world is one of hard edges and precision.

### Project Specs Cards
- **Structure:** No borders. Use `surface_container_lowest` against a `surface_container` background.
- **Internal Spacing:** Use 32px padding (Spacing-XL) to give the technical imagery room to breathe.
- **Content:** Pair a high-res CAD render with a right-aligned list of specifications using `body-sm`.

### Software Skill Badges (Technical Chips)
- **Style:** Small, rectangular badges using `tertiary_container`. 
- **Icons:** Use monochromatic SVG icons of software logos (SolidWorks, NX).
- **Typography:** `label-sm` in `on_tertiary_container`.

### Technical Input Fields
- **Background:** `surface_container_high`.
- **Bottom Border Only:** Use `outline` (#74786f) for a 1px bottom border only, mimicking a fill-in-the-blank technical form. 
- **Error State:** `error` color for the underline and `body-sm` for the helper text.

---

## 6. Do's and Don'ts

### Do:
- **Do** use intentional asymmetry. Place the project description on the left and the CAD render bleeding off the right edge of the screen.
- **Do** use large "Technical Numbers" (e.g., 01, 02) in `display-lg` to guide the user through the project narrative.
- **Do** ensure all images of 3D models are high-contrast with transparent or neutral backgrounds that match the `surface` tokens.

### Don't:
- **Don't** use any border-radius. All corners must be 0px (Sharp).
- **Don't** use generic dividers. Use a 48px or 64px vertical gap to separate content sections.
- **Don't** use standard blue for links. Use `tertiary` (#005a7b) to maintain the "Technical Highlight" color logic.
- **Don't** overcrowd the "Software Skills" section. Use ample white space to let each tool stand as a badge of expertise.