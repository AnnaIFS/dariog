# dariog.it — Session Log

## Session: August 24, 2026 — SEO + AI-crawler setup, and the Search Console answer

**Asked:** is the site on Google Search Console, and was a sitemap ever created? Then: build everything needed for SEO and for AI bots, full audit and setup.

**Answer to the first question: no, and no.** Verified rather than assumed — a Search Console property cannot be verified without leaving a tag or file behind, and there were none:

| Check | Result |
|---|---|
| `dariog.it/sitemap.xml` | 404 |
| `dariog.it/robots.txt` | 404 |
| `google-site-verification` meta tag | absent from all 9 pages |
| `google*.html` verification file | never existed in git history |
| Analytics / Tag Manager | not installed |

**Already fine before this session** (worth recording so it isn't re-audited): unique title + meta description on every page, exactly one `<h1>` per page, `alt` on every `<img>`, `loading="lazy"` already in place, correct viewport, HTTPS, clean trailing-slash URLs (no-slash 301s to slash — so the sitemap uses the slash form).

### Built

- **`sitemap.xml`** — 8 public pages. `thankyou.html` deliberately excluded.
- **`robots.txt`** — allows search engines, disallows `/thankyou.html`, points at the sitemap, and names ~20 AI crawlers individually (OpenAI, Anthropic, Perplexity, Google-Extended, Applebot-Extended, Meta, CCBot, others) with an explicit `Allow`. Named rather than left to the wildcard so the intent is documented and Google-Extended/Applebot-Extended are unambiguous.
- **`llms.txt`** — plain-language summary of who Dario is and what each page covers, for AI assistants. Content drawn from the site's own about/services/saray copy, not invented.
- **Per-page head block** in all 9 pages, wrapped in `SEO_START` / `SEO_END` comments so the generator script is idempotent — re-running replaces the block instead of duplicating it. Contains: canonical, `robots` with `max-image-preview:large`, author, theme-color, full Open Graph set, Twitter card, `preconnect` to the Google Fonts hosts (the CSS `@import` is render-blocking), and JSON-LD.
- **Structured data** — homepage carries `WebSite` + a full `Person` (alternateName Dario Giuffrida, Sapienza, IFS, four languages, `knowsAbout`, six `sameAs` profiles) under `@id` `https://dariog.it/#person`; subpages reference that `@id` rather than redefining it. `Service` on services/individual/couple/group, `MusicAlbum` on saray (10 tracks, 2026-06-21, Spotify artist as `sameAs`), `ContactPage` with a `ScheduleAction` to Calendly, `AboutPage`, and `BreadcrumbList` on every subpage. Deliberately **not** `LocalBusiness`/`ProfessionalService` — those want a postal address and telephone, and would only earn Search Console warnings without them. All 8 blocks verified to parse as JSON.
- **`thankyou.html`** → `noindex, follow` + self-canonical.
- **Homepage title** — was bare `Dario Hampi Pakari`, which gave a search engine nothing to match on. Now `Dario Hampi Pakari | Psychologist, IFS Practitioner & Medicine Man`. Easily reverted if it reads wrong.

### Social share images

There were none, so shared links rendered as bare grey rows. Generated with PIL:
- `images/og-default.jpg` — 1200x630, a 1.91:1 crop of `dario-offering.jpg` taken from y=40 so the face and hands stay in frame. Used site-wide.
- `images/og-saray.jpg` — 1200x630, the square album cover sharp and centred over a blurred, darkened scale-up of itself, since letterboxing square art looks broken on Facebook/LinkedIn.

### Performance — the real find

`anna_and_dario_1.jpg` was a **5978x3985, 11.8 MB** camera original being served to every visitor of the couple page. Page speed feeds ranking directly, so this mattered as much as any tag. Recompressed at quality 82, progressive, capped on the long edge:

| Image | Page | Before | After |
|---|---|---|---|
| `anna_and_dario_1.jpg` | couple | 11.8 MB | 210 KB |
| `nina-urku-1.jpg` | group | 1.5 MB | 676 KB |
| `dario-new-1.jpg` | about | 975 KB | 391 KB |

Visually identical at displayed size. Originals remain recoverable from git history.

### Left alone deliberately

- **~34 MB of unused images** in `images/` — `saray-cover.png` (20 MB) plus `half-moon-altar-background.gif`, `dario-picture-smiling-cactus-shirt.jpg`, `dario-profile-nobg.png`. Nothing references them, so they cost no page speed; they only bloat the repo. Kept in case they are masters.
- **`/` and `/about/` share the same `<h1>`** ("Twenty years walking between worlds."). A mild duplicate signal, but it is Dario's copy — flagged, not rewritten.
- **`sonaja.gif` (1.5 MB, individual page)** — resizing an animated GIF risks breaking the animation; left as is.

### Still open — the one step that cannot be done from here

Google Search Console needs a human with the right Google account. Handover page written and published as an Artifact (audit + copy-paste steps, owner vs developer labelled):
`https://claude.ai/code/artifact/db358f49-3c71-4fc3-851c-eae53e6bff86`

Route chosen for it: **URL-prefix property + HTML-tag verification**, because Anna controls the repo and the owner may not have the registrar password. That costs one round-trip (owner copies the tag → developer publishes it → owner clicks Verify). The DNS/Domain-property alternative is documented on the page as the no-developer route. Once verified, the sitemap is submitted as the relative string `sitemap.xml`.

**After the verification tag lands, it must stay in `index.html` permanently — removing it un-verifies the property.**

### Security pass (same session)

Full review of the site code, the git history, the live headers, the repo and the DNS.

**Clean — checked and found nothing:**
- **No secrets, ever.** Scanned the working tree and all 22 commits across every ref for API keys, tokens, private keys, Stripe/GitHub/Google/Slack patterns. Nothing. No file has ever been deleted from history either, so nothing was committed and later scrubbed.
- **No XSS route.** The three `innerHTML` writes in `js/main.js` (album bar, footer block, listen module) are built entirely from the hardcoded `SARAY` config object — no user input, no URL data reaches them. The one read of `location.search` is a regex `test()` for `?released=0|1` that only flips a boolean; it is never interpolated into the DOM. No `eval`, `document.write`, or `insertAdjacentHTML` anywhere.
- **No mixed content**, and every `target="_blank"` already carries `rel="noopener noreferrer"`.
- **HTTPS is enforced** — `http://dariog.it` and `www` both 301 to `https://dariog.it/`.
- **DNS is correct**: the four official GitHub Pages A records, `www` CNAME to `annaifs.github.io`.
- **Email authentication is properly configured** — SPF (`include:spf.titan.email`), DKIM (`titan._domainkey`), and DMARC at `p=quarantine` with aggregate reporting. Domain spoofing is already covered.
- **No Actions workflows, no dependencies, no lockfiles** — there is no supply chain to audit. Only third-party runtime code is the Calendly widget on `/contact/`.

**Fixed this session:** breadcrumb `name`/`item` swap (see commit message), repo-level `.gitignore`, contact-form honeypot, explicit referrer policy.

**Known gaps that cannot be fixed on GitHub Pages** — recorded so they are not re-investigated:

GitHub Pages serves static files and offers **no way to set response headers**. So the site has no HSTS, no `Content-Security-Policy`, no `X-Frame-Options`, no `X-Content-Type-Options`. Confirmed absent by inspecting the live response.
- `frame-ancestors` (clickjacking) and HSTS **cannot** be set via `<meta>` — they are header-only by spec. A `<meta http-equiv>` CSP is technically possible but `/contact/` has an inline `<script>` and both `/contact/` and `/saray/` carry inline `style=` attributes, so any useful policy would need `unsafe-inline` or hashes and would be fragile against future edits.
- **The only real fix is fronting the domain with Cloudflare** (free tier), which allows header rules and would supply all of the above at once. That is a DNS change, not a code change, and it is Anna's call — not done.
- Risk in the meantime is low: the site is static, has no login, no session, no cookies, and stores nothing.

`access-control-allow-origin: *` in the response is the GitHub Pages default for static assets and is not a finding — there are no credentials or private data behind it.

**Needs a human in a browser** (no `gh` CLI on this machine, so unverified):
- Repo is **public** (confirmed via the unauthenticated API) — correct for Pages on a free account, but worth remembering that everything committed is permanently world-readable.
- Unchecked: 2FA on the GitHub account, branch protection on `main`, Actions permissions, and any stale deploy keys or collaborators.
- Formspree (`xdaplelv` contact, plus the SARAY form): the honeypot helps, but enabling reCAPTCHA and a submission cap in the Formspree dashboard is the stronger control.
- Adding a **CAA record** would restrict which certificate authorities may issue for `dariog.it`. There is currently none, so any CA can. Low urgency, cheap to add.


---

## Session: August 22, 2026 — Fixed the mobile menu

**Reported:** on a phone the menu "doesn't open well" — scrolling lags and the page shows through behind it.

**Two real bugs, both only visible after scrolling down the page:**

1. **The menu collapsed to the size of the nav bar.** `.nav.scrolled` used `backdrop-filter: blur(8px)`. A filtered element becomes the *containing block* for its `position: fixed` children, so the menu's `inset: 0` resolved against the nav bar instead of the viewport. Measured on the old code at 390x844: the open menu was **390x76px at y=44**, and tapping "through" it hit `btn-primary` / `intro-photo` / `intro-quote`. At the very top of the page there is no `.scrolled` class, so it worked fine there — which is why it looked intermittent. The same blur repainting over scrolling content is also the classic cause of mobile scroll jank.
2. **The page kept scrolling behind the open menu.** `html { overflow-x: hidden }` makes `<html>` the scrolling box, so the old `document.body.style.overflow = 'hidden'` locked nothing at all. Old code: a wheel gesture with the menu open moved the page 600 -> 1100.

**Fixes** (`styles/main.css` + `js/main.js` only — all 9 pages share them):
- Mobile drops `backdrop-filter` for a solid `rgba(42, 18, 6, 0.97)` background. **Desktop keeps the blur** (the bug can't occur there — the desktop menu isn't a fixed overlay).
- New `html.menu-open` scroll lock on both `<html>` and `<body>` (`position: fixed`), with the scroll position saved on open and restored exactly on close. `scroll-behavior: smooth` is temporarily disabled during the restore so it jumps instead of animating.
- Menu now scrolls when the list is taller than the screen (`overflow-y: auto` + `overscroll-behavior: contain`). Auto margins on the first/last child keep the links centred when they fit and collapse to 0 when they don't, so nothing gets stranded off the top — previously `justify-content: center` with no overflow made the lower links unreachable with the Work dropdown expanded on a short screen.
- Scroll handler is rAF-throttled; open dropdowns reset when the menu closes; added `aria-expanded`, Escape-to-close, and a resize guard so rotating to desktop width can't leave the page locked.

**Verified in a real headless Chromium at iPhone 390x844** (not by eye) — same test run against the pre-fix code to confirm the diagnosis, then against the live site:

| Check | Before | After (live) |
|---|---|---|
| Menu size | 390x76 at y=44 | 390x844 at y=0 |
| Page visible through it | yes (`btn-primary`, `intro-photo`) | no — every sample point hits the menu |
| Scroll leak while open | 500px | 0px |
| Scroll position on close | lost (1100) | restored (600) |
| Console / page errors | none | none |

Checked on `/`, `/about/`, `/services/`, `/saray/`. Desktop nav, hover dropdowns and page scrolling all unchanged (verified separately at 1280x800).

**Shipped:** commit `fae1d5e`, pushed to `origin/main`, GitHub Pages rebuilt and confirmed live by polling the deployed CSS then re-running the mobile test against dariog.it.

**Test rig note:** the cached Playwright Chromium was missing `libnspr4` / `libnss3` / `libasound2`. Rather than installing system packages, the debs were unpacked into the session scratchpad and loaded via `LD_LIBRARY_PATH` — nothing was changed on the machine.

---

## Session: June 19, 2026 — Flipped SARAY live early + QA

**Why early:** Anna won't have internet the night of 21 June when the auto-flip was due to fire. To avoid an unattended switch she couldn't fix, we flipped the album to "out now" today (19 Jun) while she has access to verify it.

**Change:** `js/main.js` — `RELEASED: 'auto'` → `RELEASED: true`. One line, fully reversible. Committed `26799f0`, pushed to `origin/main`, confirmed live on dariog.it (polled the deployed `main.js`).

**QA on the released state — all green (0 fail / 0 warn):**
- **Download form works end to end** — live POST to Formspree (`xeewgbad`) returned `{"ok":true}` 200. A test entry labelled "QA TEST - please ignore" is in Anna's Formspree inbox (safe to delete).
- Success path reveals the Samply link (200). Honeypot + error fallback present.
- Listen links (Spotify/Apple/YouTube/Linktree) all 200 — still artist/channel pages, as agreed.
- All `target="_blank"` have `rel="noopener noreferrer"`. No placeholders/TODOs. No em-dashes. 12 media queries; mobile hero fixes already in.

**Still pending (after the real release):** swap Spotify/Apple/YouTube to album-specific URLs in `js/main.js` lines 78–80, then redeploy. Nothing else required — site is live and self-sufficient now.

---

## Session: June 17, 2026 — SARAY release system

Goal: make the SARAY album release self-switch the whole site from countdown to "out now" at midnight Madrid (21 June 2026), with album access site-wide.

### Single source of truth
All album behaviour is driven by ONE config block at the top of `js/main.js` (`var SARAY = {...}`):
- `releaseUTC: Date.UTC(2026,5,20,22,0,0)` = midnight Madrid (CEST = UTC+2).
- `RELEASED: 'auto' | true | false` — manual override backstop.
- `links: { spotify, appleMusic, youtube, more, download, notify }` — paste final URLs here. Empty link falls back to `/saray`; empty `more` auto-hides the "+ more platforms" link. `download` = the external email-capture FORM url (collects name+email, then forwards to the file).

### How the flip works
`js/main.js` sets `<html class="saray-pre">` or `saray-out` from the config. CSS toggles visibility:
`.saray-pre .saray-when-out { display:none }` / `.saray-out .saray-when-pre { display:none }`.
A 1s timer auto-flips at `releaseUTC` (auto mode). Preview override: append `?released=1` (out) or `?released=0` (countdown) to any URL.

### Injected on every page (from main.js)
- **Top album bar** (`.album-bar`, above nav): cover + eq animation + warm sheen, one CTA (pre: Join the listening; out: Listen & download → /saray). Mobile = single tap-through. Reduced-motion safe. Body gets `has-album-bar` (40px desktop / 38px mobile offset; nav shifted down).
- **Footer album block** (`.footer-album`): cover + state-aware links.
- **Reusable Listen & Download module**: drop `<div data-saray-listen></div>` (add `saray-when-out`); JS fills it with the stream pills (Spotify/Apple/YouTube + optional more) and the Download-free button. Used in SARAY hero, SARAY gift section, homepage SARAY section (`.album-cta--start` = left-aligned variant).

### Files touched
- `js/main.js` — nav code unchanged; whole SARAY engine added below it.
- `styles/main.css` — added: state toggles, `.album-bar`, `.footer-album`, `.album-cta`/`.album-link`/`.album-download` module.
- `saray/index.html` — hero date+countdown+CTAs wrapped pre/out; bespoke inline countdown removed (engine drives `#countDays` etc.); gift section uses the module.
- `index.html` — SARAY section sub/body/CTAs wrapped pre/out; uses the module.

### Verified
jsdom harness (/tmp/dariog-test) runs the real `main.js` against the real pages: PRE at Jun 17, OUT at Jun 22, no JS errors, modules built, links wire, "more" auto-hides. Local preview: `python3 -m http.server 8000`.

### Links wired (June 17)
All set in `SARAY` config in `js/main.js`:
- spotify / appleMusic / youtube = artist/channel pages (swap to SARAY album-specific URLs once live on 21 June).
- more = Linktree. download = `/saray#get-album` (opens on-page form).
- formAction = `https://formspree.io/f/xeewgbad` (Formspree; reCAPTCHA turned OFF so AJAX works — verified `{"ok":true}` 200).
- downloadFile = Samply link, revealed after the form submits.

### Free-download form
On-page Name+Email form in the SARAY gift section (`#get-album`, `saray-when-out`). `sarayDownloadForm()` in main.js sets `form.action`, POSTs via fetch, and on success reveals `#dlLink` (Samply). All "Download" buttons site-wide point to `/saray#get-album`.

### Deployed (June 18)
- Live on dariog.it (commits ccbc383, b713dfb). All 9 pages 200. Live main.js confirmed releaseUTC=midnight Madrid, RELEASED:'auto'.
- Auto-push configured machine-wide: SSH key (already on AnnaIFS GitHub account) + global `url."git@github.com:".insteadOf "https://github.com/"` — every repo on this machine pushes over SSH, no tokens.
- QA skill fixed: installed `~/.claude/skills/website-qa/scripts/qa-check.sh`. Ran clean: 0 fail, 0 warn.

### TODO (waiting on Anna)
- Confirm the Formspree activation email; mark test entries "Not Spam"; add dariog.it/www.dariog.it to the form's allowed domains.
- Optional: turn on Formspree autoresponse with the Samply link.
- On 21 June: send SARAY album-specific URLs for Spotify/Apple/YouTube; swap in config + redeploy (seconds).

---

## Session: April 1, 2026

### Stack
Plain HTML, CSS, vanilla JS. No frameworks. Served via `python3 -m http.server 8000` from `/home/aniam/dariog`.

---

### Files — Current State

```
/home/aniam/dariog/
  index.html          — homepage
  about.html          — about/bio page
  services.html       — work overview with 4 service cards
  individual.html     — individual sessions detail
  couple.html         — couple sessions detail
  group.html          — group work detail
  saray.html          — SARAY album page (fully rebuilt)
  contact.html        — calendly embed + contact form
  thankyou.html       — post-donation thank you
  styles/main.css     — all shared styling
  js/main.js          — nav scroll, hamburger, dropdowns
  images/
    dario-walking-camp.jpg      — homepage hero bg
    dario-offering.jpg          — homepage intro portrait
    dario-new-1.jpg             — about page portrait
    fuoco-sacro-1.jpg           — about page hero bg (converted from webp)
    nina-urku-1.jpg             — group page hero bg (converted from webp)
    dario-picture-smiling-cactus-shirt.jpg
    dario-profile-nobg.png
    dario.jpg                   — services hero bg
    anna_and_dario_1.jpg        — couple page hero bg (12MB, needs compression)
    saray-cover.jpg             — compressed album cover (190KB)
    saray-cover.png             — original album cover (20MB)
    sonaja.gif                  — individual page hero bg
    half-moon-altar-background.gif
```

### Deleted Files
- community.html — removed, content lives on homepage
- artist.html — removed, Substack link in nav replaces it

---

### Design System

- Fonts: Cormorant Garamond (headings, quotes) + Outfit (body, nav, labels)
- Colors: --bone #F0E6D0, --earth #2A1206, --terra #C4622D, --ochre #D4943A, --ash #9E8E7A, --smoke #1A1A1A
- Section transitions: Soft asymmetric hill shapes via clip-path: ellipse() on ::after pseudo-elements. Alternating offset (45%/55%)
- No frameworks, no build tools, no animation libraries

---

### Navigation (all pages)

```
[DARIO HAMPI PAKARI]   Work v  SARAY  About  Substack  Contact
```

- Logo: Outfit, uppercase, 0.8rem, warm ochre glow on hover, links to index.html
- "Home" link removed — logo serves as home
- Work dropdown: Individual, Couple, Group, With Organizations (-> fino.website)
- SARAY: internal link
- About: internal link
- Substack: external link (new tab) -> https://substack.com/@dariog
- Contact: internal link
- Active states: Work active on services/individual/couple/group, SARAY/About/Contact active on their pages
- Mobile: hamburger menu with full-screen overlay, dropdown toggles on tap

### Footer (all pages)
- Brand, tagline, languages
- Links: Work With Me, SARAY, About, Contact
- Social: Instagram, Spotify, YouTube, Facebook, Substack, Linktree
- Copyright: Dario Giuffrida - dariog.it

---

### Page Details

#### index.html (Homepage)
- Hero: full-bleed bg (dario-walking-camp.jpg), dark gradient overlay, left-aligned
  - Label: Psychologist - Medicine Man - IFS Practitioner
  - Headline: Twenty years walking between worlds.
  - CTA: Book an Intro Call -> Calendly
- Intro: two columns, arch portrait (dario-offering.jpg), quote + bio
- The Work: dark bg, 3 cards (Individual, Couple, Group) with hover glow
- SARAY: bone bg, album cover + text, "Release on all platforms: Summer Solstice - June 21, 2026"
- Community: dark bg, "This work lives and breathes in community", 3 blocks (Fuoco Sacro, Sumak Kawsay, FERM)

#### about.html
- Hero: fuoco-sacro-1.jpg bg, 70vh
  - Label: About
  - Title: Twenty years walking between worlds.
  - Subtitle: Psychologist. Medicine man. IFS Practitioner. Different paths, one purpose.
- Who I Am: two columns, arch portrait (dario-new-1.jpg), full bio
- Credentials: dark bg, centered list with ochre dividers
- Speaking: "Available for Events and Podcasts", SEEKERS podcast link
- FINO: dark bg, centered block, link to fino.website

#### services.html
- Hero: dario.jpg bg, 60vh
  - Label: The Work
  - Title: The work looks different for each person.
- Intro section: "The Approach", 6 paragraphs about IFS + traditional practice
- Cards: dark earth bg, 2x2 grid (Individual, Couple, Group, Organizations)
- Bottom CTA: "Not sure where to start?" -> Calendly

#### individual.html
- Hero: sonaja.gif bg, 65vh
  - Label: One on One
  - Title: Something in you knows it is time.
  - Subtitle: One-on-one work with the inner system.
- Body: 4 paragraphs about IFS sessions
- What to Expect: 4 items (First Call, Session, Pace, Language)
- Final CTA: "Ready to begin?" -> Calendly

#### couple.html
- Hero: anna_and_dario_1.jpg bg, 65vh
  - Label: Couple Sessions
  - Title: Two people, doing the same work, going in the same direction.
  - Subtitle: This is not conflict management. It is an invitation to know each other more honestly.
  - CTA: Book a Free Intro Call
- The Work: IFS, Anna as co-practitioner, real presence, 4 paragraphs
- How We Work: First Call, Individual Sessions, Joint Sessions, Into Daily Life
- This Might Be for You If: 5 bullet points
- Footer CTA: languages + Book a Free Intro Call

#### group.html
- Hero: nina-urku-1.jpg bg, 65vh, left-aligned
  - Label: The Circle
  - Title: Community is the medicine.
  - Subtitle: Circles, retreats, and multi-day experiences. The group format changes what becomes possible.
- Body: 4 paragraphs about group work, vision quests
- Upcoming: dark bg, mailing list CTA
- Final CTA: "Questions about group work?" -> Calendly

#### saray.html (fully rebuilt)
- Hero: 85vh, saray-cover.jpg bg, centered
  - Label: Medicine Music
  - Title: SARAY (huge, clamp 5-10rem)
  - Date: Summer Solstice - June 21, 2026
  - Sub: Ten songs. Eighteen years. One community listening together.
  - CTA: Join the listening
- The Name: what SARAY means (corn, daughter, prayer)
- Where They Came From: songs received over 18 years of ceremony
- The First Song: storm in the Andes with Taita Marcelino
- The Bow: "Songs are arrows. The community is the bow." + WhatsApp CTA
- Community Voices: 2x2 quote grid (Helvecia, Ruben, Frane, JM), centered intro
- Collaborators: Gaddafi Nunez, Paulina Violina, Stefan Suro, Gonzalo Paniagua, Mireia Berdun
- The Gift: mailing list CTA top, Stripe + PayPal donation side by side

#### contact.html
- Hero: dark bg, no photo, 50vh, centered
  - Title: Start Here
  - Subtitle: Available in English, Spanish, Italian, and Portuguese.
- Calendly widget (580px height)
- Contact form (Formspree, needs real FORM_ID)
- Social links row

#### thankyou.html
- Full viewport dark page, centered
- "Thank You" + message + "Sonqo manta Sonqo" + back to SARAY link

---

### CSS/JS Notes

- main.css: dropdown hover bridge (invisible ::after pseudo-element on .nav-dropdown)
- main.js: mobile dropdown fix — dropdown-toggle clicks don't close menu overlay, uses stopPropagation
- Nav logo: warm ochre text-shadow glow, brightens on hover
- All em dashes removed site-wide, replaced with hyphens
- No translation comments in HTML

---

### What Still Needs Doing

| Item | Status |
|------|--------|
| Formspree form ID | Placeholder FORM_ID in contact.html — sign up at formspree.io |
| GitHub Pages deployment | Not set up |
| Custom domain (dariog.it) | DNS + CNAME after GitHub Pages |
| anna_and_dario_1.jpg compression | 12MB, needs compression for couple.html hero |
| PayPal button | Code in place, needs HTTPS/live domain to render |
| Supabase download counter | Placeholder on saray.html, wire when ready |
| Favicon | Missing |
| Open Graph / social meta | No og:image, og:title for social sharing |
| Mobile visual testing | CSS is mobile-first but not tested on real devices |
| thankyou.html redirect | Wire to Stripe/PayPal post-donation redirect |
| SEO | Basic title/description in place, no structured data |

---

### How to Resume

```bash
cd /home/aniam/dariog && python3 -m http.server 8000
```

Open http://localhost:8000 in Chrome. Hard refresh with Ctrl+Shift+R after changes.

---

## Session: March 29, 2026

### What was built
- index.html homepage (all sections)
- styles/main.css (full design system)
- js/main.js (nav scroll, hamburger, dropdowns)
- Initial image setup
- Design system established: fonts, colors, transitions, section structure
