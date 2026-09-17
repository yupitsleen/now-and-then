// Live-link check for every source URL in mockSites.ts.
// Network-dependent by design, so it is NOT part of the vitest suite — run on demand
// (npm run test:links) or on a schedule. Exit 1 on dead links (404/5xx, or a network
// failure that survives a retry); 403/429 are reported but tolerated (bot-blocking and
// rate-limiting that a real browser gets past).
import { mockSites } from "../src/data/mockSites.ts";

const urls = new Map(); // url -> [siteIds]
for (const site of mockSites) {
  for (const src of site.sources ?? []) {
    if (src.url) urls.set(src.url, [...(urls.get(src.url) ?? []), site.id]);
  }
  for (const img of Object.values(site.images ?? {})) {
    if (img?.sourceUrl) urls.set(img.sourceUrl, [...(urls.get(img.sourceUrl) ?? []), site.id]);
  }
}

const attempt = async (url) => {
  const opts = {
    redirect: "follow",
    signal: AbortSignal.timeout(15000),
    headers: { "user-agent": "Mozilla/5.0 (compatible; heritage-tracker-link-check)" },
  };
  try {
    let res = await fetch(url, { ...opts, method: "HEAD" });
    if ([403, 404, 405].includes(res.status)) res = await fetch(url, { ...opts, method: "GET" });
    res.body?.cancel?.();
    return res.status;
  } catch (err) {
    return `FAIL: ${err.cause?.code ?? err.name}`;
  }
};

// A slow or throttled host from a CI runner is not a dead link: retry once before believing it.
const check = async (url) => {
  const first = await attempt(url);
  if (typeof first === "number") return first;
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return attempt(url);
};

const entries = [...urls.entries()];
console.log(`Checking ${entries.length} unique URLs across ${mockSites.length} sites...`);
const results = [];
for (let i = 0; i < entries.length; i += 8) {
  results.push(
    ...(await Promise.all(
      entries.slice(i, i + 8).map(async ([url, ids]) => [url, ids, await check(url)])
    ))
  );
}

let dead = 0;
let blocked = 0;
for (const [url, ids, status] of results) {
  if (status === 200 || (typeof status === "number" && status < 400)) continue;
  const cited = ids.slice(0, 3).join(", ") + (ids.length > 3 ? ` +${ids.length - 3} more` : "");
  // 403 = bot-blocked, 429 = rate-limited. Both mean "the host refused us", not "the page is gone".
  if (status === 403 || status === 429) {
    blocked++;
    console.log(`  BLOCKED ${status} (verify in browser): ${url}  [${cited}]`);
  } else {
    dead++;
    console.log(`  DEAD ${status}: ${url}  [${cited}]`);
  }
}
console.log(`\n${entries.length - dead - blocked} ok, ${blocked} bot-blocked, ${dead} dead.`);
if (dead > 0) {
  console.error("Dead links found — replace or archive them (see docs/audit/findings-sources.md for canonical sources).");
  process.exit(1);
}
