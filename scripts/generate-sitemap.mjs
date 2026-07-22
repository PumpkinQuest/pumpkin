import { writeFileSync } from "node:fs";

const BASE = "https://pumpkin.quest";

const pages = [
  { path: "", changefreq: "weekly", priority: 1.0 },
  { path: "/tools", changefreq: "monthly", priority: 0.8 },
  { path: "/tools/npc", changefreq: "monthly", priority: 0.7 },
  { path: "/lss", changefreq: "monthly", priority: 0.9 },
  { path: "/lss/spells", changefreq: "monthly", priority: 0.7 },
  { path: "/lss/dimension-door", changefreq: "monthly", priority: 0.7 },
  { path: "/lss/dataset-editor", changefreq: "monthly", priority: 0.7 },
  { path: "/privacy/dimension-door", changefreq: "yearly", priority: 0.3 },
];

const urls = pages
  .map(
    ({ path, changefreq, priority }) => `  <url>
    <loc>${BASE}${path}/</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  )
  .join("\n");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>\n`;

writeFileSync("out/sitemap.xml", sitemap);
console.log("sitemap.xml generated");
