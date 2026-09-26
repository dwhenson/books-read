# book-records

[Live Preview](https://hugo-books-read.vercel.app)

A simple site to record the books I've read. Originally built using [Hugo](https://gohugo.io/), now built with [Eleventy](https://www.11ty.dev/).

Cover images from: [Bookshop.org](https://uk.bookshop.org/).

## Usage

- `npm install` to install dependencies.
- `npm start` to run a local server with live reload.
- `npm run build` to build the site into `_site/`.
- `npm run check` to build, validate the HTML and check internal links.

To add a new book, pass the date finished (`yyyymmdd`), the title and the category:

```sh
npm run new -- 20260926 "Book Title" fiction
```

For an audiobook, add `audiobook` to the end:

```sh
npm run new -- 20260926 "Book Title" fiction audiobook
```

This creates `content/books/{{yyyymmdd}}-{{book-title}}.md`. Fill in the author, pages, bookshop `id` (ISBN), rating and review. Set `completed: false` for a book you didn't finish: it will show on the Bookshelf, but not on the Books Read list. Set `audiobook: true` for a book you listened to: it's labelled as an audiobook everywhere it appears.
