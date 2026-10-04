# CLAUDE.md

A personal static site recording the books Dave has read, built with Eleventy 3 and deployed on Vercel. It was migrated from Hugo, so some code mentions Hugo, for example where sort order is kept the same.

## Coding preferences

- **Simple over optimal.** Put readability first, even when it means some duplication. Avoid clever abstractions. For example, `fiction.css` and `nonfiction.css` are deliberately separate files rather than one generated pattern.
- **Native CSS and custom properties over JS.** If CSS can do it, use CSS. Cutting-edge CSS is fine (relative colour syntax, nesting, `:has()`, `@view-transition`, range media queries and so on). Browser compatibility isn't a concern.
- **Short JSDoc comments** on functions, saying what they do:
  ```js
  /**
   * Adds two numbers.
   * @param {number} num1 The first number to add.
   * @param {number} num2 The second number to add.
   * @return {number} The result of adding num1 and num2.
   */
  ```
- No build tooling beyond Eleventy: no bundler, no CSS preprocessor. CSS and JS are copied over as they are.

## Commands

- `npm start`: dev server with live reload (`eleventy --serve`)
- `npm run build`: build into `_site/`
- `npm run check`: build, then run `html-validate` on all output (rules in `.htmlvalidate.json`: standard + a11y), then `scripts/check-links.js`. Run this after changing templates.
- `npm run new -- <yyyymmdd> "<Title>" <fiction|nonfiction> [audiobook]`: create a book file

There's no test suite. `npm run check` is the verification step.

## Layout

```
eleventy.config.js      Collections, filters, the rating shortcode, directory config
content/                Eleventy input dir
  index.md              Bookshelf (home): every book, cover grid by year
  ratings.md            Rating guide page (uses {% rating n %} shortcode)
  books/                One .md file per book
    books.11tydata.js   Sets layout: layouts/book.njk and tags: books for every book
    index.md            /books/ "Books Read" list (overrides layout to books.njk)
_data/                  Global data: site.js (title, lang, description), nav.js (nav links)
_includes/layouts/      base → home | books | book | page
_includes/partials/     meta, nav, footer, bookcover, rating
assets/css/             Copied to /css/
assets/js/main.js       Copied to /js/: the <burger-menu> custom element
static/                 Copied to site root (Inter fonts are here but unused: system fonts are deliberate)
scripts/                new-book.js, check-links.js
vercel.json             Vercel build config + redirects for renamed book URLs
NOTES.md                Dave's TODO list
```

Note the config sets `includes: "../_includes"` and `data: "../_data"` relative to `content/`.

## Books

Filename: `content/books/yyyymmdd-slug.md`. Front matter:

| Field | Notes |
|---|---|
| `title`, `author` | strings |
| `date` | date finished. Drives sorting and year grouping (read in UTC) |
| `completed` | `false` = did not finish: shown on the Bookshelf but left out of Books Read |
| `audiobook` | `true` = labelled "Audiobook" wherever it appears |
| `category` | `fiction` or `nonfiction`. Also used as a CSS class name |
| `pages` | number |
| `id` | ISBN, used for the cover: `https://images-eu.bookshop.org/images/{id}.jpg` and in `view-transition-name`s |
| `rating` | 0–5, halves allowed (e.g. `3.5`) |
| `review` | one-line summary shown on the Books Read list |

The body is the full review, shown on the book's own page.

## Eleventy config

- Collections: `books` (all, newest first, ties broken by title) and `booksRead` (excludes `completed: false`).
- Filters: `year`, `byYear` (groups into `{year, books, fiction, nonfiction, audiobooks}`), `humanize`, `pluralize`, `olderBook`/`newerBook` (Previous/Next links on book pages).
- Shortcode: `rating`, used on the ratings page. Book templates use `partials/rating.njk` instead.
- Markdown has `html` and `typographer` turned on. Nunjucks preprocesses `.md` and `.html`.
- Partials `bookcover.njk` and `rating.njk` expect a `book` variable (the book's front matter) to be `set` before the include.

## CSS

- `assets/css/main.css` is the only linked stylesheet. It `@import`s every file once, in cascade order: tokens → global → components → utilities. Add new files there. No nested imports.
- `tokens.css` holds all design tokens as custom properties: colours (light/dark shades made with relative colour syntax `hsl(from …)`), the Utopia fluid type scale `--step-*`, and the space scale `--space-*`.
- One breakpoint, written out where needed: `@media (width >= 40em)`.
- Use logical properties (`inline-size`, `margin-block-start`, `inset-inline-end`).
- Components are often configured with inline custom properties from templates, e.g. `style="--rating: 3.5"`, `--flow-space`, `--star-size`. The star rating is pure CSS (gradient text clipped by `--rating`).
- Category colour utilities: `.fiction-normal`, `.fiction-dark`, `.nonfiction-normal`, `.nonfiction-dark`.
- Cross-page view transitions: `@view-transition { navigation: auto; }` plus `view-transition-name`s on headings, covers and year headings.

## JS

The only JS is `assets/js/main.js`: a `<burger-menu>` web component that wraps the site nav. It uses a `ResizeObserver` to turn itself on below its `max-width` attribute (550px) and sets `status`/`enabled` attributes that the CSS in `components/burger-menu.css` styles. Don't add more JS when CSS can do the job.

## Deployment

Vercel builds with `npm run build` and serves `_site/`. When renaming a book file (which changes its URL), add a permanent redirect in `vercel.json`.
