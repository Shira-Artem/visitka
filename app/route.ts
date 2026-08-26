import { siteHtml } from "./site-html";

export async function GET() {
  return new Response(siteHtml, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-cache",
    },
  });
}
