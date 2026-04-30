# Higgsfield Marketing Studio Research

Date: 2026-04-28
Source: live browser inspection of `https://higgsfield.ai/marketing-studio`, which redirected to `https://higgsfield.ai/marketing-studio/product?marketing-project-id=...`.

## Executive Summary

Higgsfield Marketing Studio is a template-driven AI ad generator for short product and app marketing videos. The live UI is optimized around choosing a subject type, uploading assets, selecting an ad format/style, selecting aspect ratio and output quality, then generating a short video.

For the Larinova demo/promo video, its strongest use is not the main product walkthrough. It is better suited for short social ad cutaways: doctor-facing hooks, UGC-style reactions, app promo clips, and vertical paid-social variants. The tool appears built for 6-15 second ad units, not a controlled 60-70 second narrative demo with precise UI sequencing.

## Feature Inventory

- Marketing Studio project workspace with left navigation:
  - New project
  - Search
  - Tools
  - Url to Ad
  - Projects
  - New folder
  - Upgrade
  - Assets
- Subject modes visible in the main generator:
  - Product
  - App
- Product mode headline:
  - "TURN ANY PRODUCT INTO A VIDEO AD"
- Prompt field:
  - Placeholder: "Describe what happens in the ad..."
- Asset slots:
  - Product upload slot
  - Avatar upload slot
- Generation button:
  - Visible cost state: `GENERATE 48 40`
  - Inference: UI is showing a discounted or changed credit cost, with 48 crossed/secondary and 40 current credits.
- Format/style selector:
  - Default selected: UGC
  - Opens a modal titled "PICK THE FORMAT THAT HITS"
- Format modal copy:
  - "From unboxing to UGC - choose the type of video that fits your product and audience."
- Browsable example gallery:
  - Cards with autoplay video previews
  - Each card has "Recreate"
  - Visible gallery labels repeat across examples: Hyper Motion, Unboxing, UGC, UGC Virtual Try On, TV Spot, Tutorial, Pro Virtual Try On
- "Generate across formats" section:
  - Inference: examples are intended to be reused as presets or source prompts through "Recreate".
- Global Higgsfield navigation visible in the DOM:
  - Image
  - Video
  - Audio
  - Edit
  - Character
  - Community
  - Marketing Studio
  - Cinema Studio 3.5
  - Originals
  - Apps
  - Assist

## Supported Formats, Aspect Ratios, Durations, Models

Visible generation controls:

- Ad format/style:
  - UGC
  - Tutorial
  - Unboxing
  - Hyper Motion
  - Product Review
  - TV Spot
  - Wild Card
  - UGC Virtual Try On
  - Pro Virtual Try On
- Aspect ratio:
  - Auto
  - 16:9
  - 9:16
  - 4:3
  - 3:4
  - 1:1
  - 21:9
- Resolution:
  - 480p
  - 720p
  - 1080p
- Duration:
  - 8s was visible as the selected duration.
  - The dropdown was not opened to avoid selector roulette, so additional selectable durations are unknown.
- Models:
  - No model selector was visible in Marketing Studio during inspection.
  - Global navigation mentioned "Cinema Studio 3.5", but no Marketing Studio model choice was confirmed.
- Preview/example durations from loaded videos:
  - Around 6s, 8.38s, 9.06s, 10.05s, 12.05s, 13.07s, and 15.07s.
  - Inference: Marketing Studio examples/templates are mostly short-form ad clips, and generated outputs may support multiple short durations beyond the selected 8s.

## Workflow Map

1. Open Marketing Studio.
2. Choose a subject mode: Product or App.
3. Enter a prompt describing what should happen in the ad.
4. Choose a format/style, such as UGC, Tutorial, Unboxing, Hyper Motion, Product Review, TV Spot, Wild Card, UGC Virtual Try On, or Pro Virtual Try On.
5. Choose aspect ratio. The visible choices cover vertical, horizontal, square, and ultrawide output.
6. Choose resolution: 480p, 720p, or 1080p.
7. Choose duration. Only 8s was confirmed visible as selected.
8. Upload required assets:
   - Product asset
   - Avatar asset, if the concept needs a person/spokesperson
9. Click Generate.
10. Review generated output in the project/gallery area.
11. Use Recreate on existing examples as a starting point for similar outputs.
12. Download/export was not reached. It is likely available after generation or in project results, but this was not confirmed.

## Template Catalog

- UGC
  - Description: "Realistic social media videos"
  - Useful for: doctor testimonial-style or creator-style vertical ad hooks.
- Tutorial
  - Description: "Step-by-step tutorials"
  - Useful for: short "how a doctor records a note" or "how OPD follow-up works" snippets.
- Unboxing
  - Description: "High-quality unboxing"
  - Useful for: physical products. Low relevance for Larinova unless reframed as "opening the app" metaphor, which may feel forced.
- Hyper Motion
  - Description: "Highlight your product"
  - Useful for: energetic visual product shots, transitions, and quick feature teasers.
- Product Review
  - Description: "Authentic product reviews"
  - Useful for: doctor-facing testimonial ads, but likely needs careful prompting to avoid fake medical claims.
- TV Spot
  - Description: "Authentic stories, amplified"
  - Useful for: polished brand ad framing, possibly for a 10-15 second intro or closing social ad.
- Wild Card
  - Description: "A unique and creative video mode for custom ideas"
  - Useful for: experimentation only. Avoid for core Larinova narrative because control is unknown.
- UGC Virtual Try On
  - Description: "Try before you buy"
  - Useful for: fashion/product try-on. Not useful for Larinova.
- Pro Virtual Try On
  - Description: "Advanced virtual try-on"
  - Useful for: fashion/product try-on. Not useful for Larinova.

Additional gallery labels visible outside the modal:

- Hyper Motion
- Unboxing
- UGC
- UGC Virtual Try On
- TV Spot
- Tutorial
- Pro Virtual Try On

## Relevance To Larinova Demo Video

Use Marketing Studio for:

- 9:16 social ad variants after the main demo is planned.
- Short 8-15 second hooks aimed at Indian doctors:
  - "After clinic, notes are already drafted."
  - "Speak naturally after each consult."
  - "Turn OPD conversations into structured summaries."
- UGC or Product Review style clips if we need creator-like paid-social ads.
- Tutorial style clips for quick workflow fragments.
- TV Spot or Hyper Motion if we need polished brand cutaways and energy.
- Multi-format output testing: 9:16 for reels/shorts, 16:9 for YouTube/website, 1:1 for feed ads.

Avoid Marketing Studio for:

- The primary 66-second Larinova demo/promo video, if the script requires exact UI timing, exact screenshots, exact product states, or medically careful claims.
- Anything that must show real Larinova UI faithfully. Higgsfield may hallucinate or stylize UI unless fed precise app captures, and even then consistency is unknown.
- Virtual try-on modes. They are irrelevant to a healthcare workflow product.
- Unboxing, unless the creative direction intentionally wants a metaphorical "new tool" reveal.
- Wild Card for production deliverables before testing, because output control is unknown.

Recommended use:

- Build the core demo in a deterministic video pipeline using real Larinova UI captures.
- Use Higgsfield as an optional ad-variant generator for 2-4 short social clips after the main story is locked.
- Best initial template tests: Tutorial, UGC, Product Review, TV Spot, Hyper Motion.

## Evidence

- `/tmp/higgsfield-marketing-studio-research/01-marketing-studio-initial.png`
  - Initial screenshot captured immediately after navigation. The page was still blank/dark, likely before client-side render completed.
- `/tmp/higgsfield-marketing-studio-research/02-after-wait-product.png`
  - Main Product mode UI after render. Shows Marketing Studio layout, Product/App mode selector, prompt bar, UGC, 9:16, 720p, 8s, Product/Avatar uploads, Generate button, and example gallery.
- `/tmp/higgsfield-marketing-studio-research/03-product-style-dropdown.png`
  - Format modal. Shows "PICK THE FORMAT THAT HITS" and the visible format catalog: UGC, Tutorial, Unboxing, Hyper Motion, Product Review, TV Spot, Wild Card, UGC Virtual Try On, Pro Virtual Try On.
- `/tmp/higgsfield-marketing-studio-research/04-app-mode.png`
  - Attempted App mode screenshot after a low-risk coordinate click. The UI remained in Product mode, so App mode is marked inaccessible in this research pass.

## Unknowns And Blockers

- App mode exists visibly, but could not be accessed reliably without further selector exploration. Marked unknown/inaccessible for this pass.
- Download/export flow was not confirmed because no generation was run.
- Exact credit rules are unknown. The Generate button showed `48 40`, suggesting a credit cost or discounted cost.
- Full duration menu was not opened; only selected `8s` was confirmed.
- No explicit model selector was visible.
- Login was already available through the persistent browser profile; no password or CAPTCHA blocker appeared.
- Generation constraints after upload, such as asset requirements, content policy limits, queue time, watermarking, and commercial usage terms, were not visible from the inspected state.
