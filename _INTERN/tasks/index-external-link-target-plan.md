## Plan: Handle news-card button link targets on `pages/index.vue`

1. Inspect current link usage in the news slider (`NuxtLinkLocale :to="slide.more_button_link"`) and confirm there are no existing target/rel handling utilities in this component.
2. Add a small link-classification helper (component-local or reusable composable) that distinguishes:
   - relative links (start with `/` or `#`),
   - absolute links to `https://berlin-university-collections.de/...`,
   - all other absolute external URLs.
3. Derive link attributes from that helper:
   - same-tab links: no `target`, no `rel`,
   - external links: `target="_blank"` and `rel="noopener noreferrer"`.
4. Update the news-card button template to bind `:target` and `:rel` dynamically while keeping `NuxtLinkLocale` and existing styling/classes unchanged.
5. Add defensive handling for empty or malformed links (fallback to same-tab behavior and avoid runtime errors).
6. Validate manually in browser with representative examples:
   - `/sammlungen` -> same tab,
   - `https://berlin-university-collections.de/foo` -> same tab,
   - `https://example.org` -> new tab.
7. Run project checks used in this repo (at minimum lint/typecheck if available) and adjust if the template binding triggers warnings.
8. (Optional follow-up) Reuse the same helper logic in other components with CMS-driven links to keep behavior consistent across the site.
