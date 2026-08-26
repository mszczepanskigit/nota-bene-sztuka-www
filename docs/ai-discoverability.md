# AI discoverability and structured data

## Scope

The site exposes people-first, Polish-language static HTML, canonical URLs, a sitemap, a documented
crawler policy, and accurate JSON-LD. These signals help crawlers and AI systems understand the
business, but they do not guarantee indexing, citations, search ranking, or inclusion in generated
answers.

## Structured-data model

Every page includes a `WebSite` and `ProfessionalService` node. The homepage adds:

- a `Person` node for Marta Miller;
- an `OfferCatalog` with individual tutoring, small-group tutoring, and webinar services;
- `Service` records describing online delivery and Polish availability.

The data intentionally avoids prices, ratings, opening hours, local-service claims, credentials,
and outcomes that are not clearly supported by visitor-visible content.

## Crawler policy

`public/robots.txt` allows all crawlers and explicitly names:

- `OAI-SearchBot`, which OpenAI documents as the crawler for ChatGPT Search;
- `GPTBot`, for OpenAI model training;
- `ClaudeBot`, `Claude-SearchBot`, and `anthropic-ai`;
- `PerplexityBot`;
- `Google-Extended`, which controls Gemini grounding and future model training rather than Google
  Search ranking.

`public/llms.txt` is a supplementary machine-readable summary. It is an emerging convention, not a
web standard or an indexing guarantee.

## Validation after deployment

1. Test the deployed URL in [Google Rich Results Test](https://search.google.com/test/rich-results).
2. Validate the JSON-LD graph with [Schema Markup Validator](https://validator.schema.org/).
3. Inspect the URL and sitemap in Google Search Console.
4. Confirm the deployed `robots.txt`, `sitemap-index.xml`, `llms.txt`, share image, and site icons
   return `200`.
5. Recheck ChatGPT Search, Perplexity, and Google only after their crawlers have had time to recrawl;
   cache and ranking behavior are external to this repository.
