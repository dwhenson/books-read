/**
 * Sorts books newest first. Books finished on the same day are ordered by
 * title, matching the order Hugo produced.
 */
function byDateDescending(a, b) {
  return b.date - a.date || a.data.title.localeCompare(b.data.title);
}

function indexOfPage(books, page) {
  return books.findIndex((book) => book.url === page.url);
}

export default function (eleventyConfig) {
  eleventyConfig.amendLibrary("md", (md) =>
    md.set({ html: true, typographer: true }),
  );

  eleventyConfig.addPassthroughCopy({ "assets/js": "js" });
  eleventyConfig.addPassthroughCopy({ static: "/" });
  eleventyConfig.addWatchTarget("assets/scss/");

  eleventyConfig.addCollection("books", (collectionApi) =>
    collectionApi.getFilteredByTag("books").sort(byDateDescending),
  );

  // Unfinished books appear on the Bookshelf, but not on the record of books read.
  eleventyConfig.addCollection("booksRead", (collectionApi) =>
    collectionApi
      .getFilteredByTag("books")
      .filter((book) => book.data.completed !== false)
      .sort(byDateDescending),
  );

  eleventyConfig.addFilter("year", (date) => date.getUTCFullYear());

  /** Groups a sorted list of books by the year they were finished. */
  eleventyConfig.addFilter("byYear", (books) => {
    const years = new Map();
    for (const book of books) {
      const year = book.date.getUTCFullYear();
      if (!years.has(year)) years.set(year, []);
      years.get(year).push(book);
    }
    return [...years].map(([year, yearBooks]) => ({
      year,
      books: yearBooks,
      fiction: yearBooks.filter((book) => book.data.category === "fiction")
        .length,
      nonfiction: yearBooks.filter(
        (book) => book.data.category === "nonfiction",
      ).length,
    }));
  });

  eleventyConfig.addFilter(
    "humanize",
    (text) => text.charAt(0).toUpperCase() + text.slice(1),
  );

  eleventyConfig.addFilter("pluralize", (count, singular, plural) =>
    count === 1 ? singular : plural,
  );

  eleventyConfig.addFilter("olderBook", (books, page) => {
    const index = indexOfPage(books, page);
    return index === -1 ? undefined : books[index + 1];
  });

  eleventyConfig.addFilter("newerBook", (books, page) => {
    const index = indexOfPage(books, page);
    return index > 0 ? books[index - 1] : undefined;
  });

  eleventyConfig.addShortcode("rating", (rating) => {
    const label = `${rating} ${Number(rating) === 1 ? "star" : "stars"} out of 5`;
    return `<div class="rating" style="--rating: ${rating};" role="img" aria-label="${label}"></div>`;
  });

  return {
    dir: {
      input: "content",
      includes: "../_includes",
      data: "../_data",
      output: "_site",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
