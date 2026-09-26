import * as sass from "sass";

export const data = {
  permalink: "/css/main.css",
  eleventyExcludeFromCollections: true,
};

export function render() {
  return sass.compile("assets/scss/main.scss").css;
}
