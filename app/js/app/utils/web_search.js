import scrapeIt from "scrape-it";

class WebSearch {
  async firstHref(query) {
    const encodedQuery = encodeURI(query);
    result = await scrapeIt("https://duckduckgo.com/html/?q=" + encodedQuery + "&ia=web", {
      href: { selector: ".result__url", eq: 0 },
    });
    return "https://" + result.href;
  }
}

export const webSearch = new WebSearch();
