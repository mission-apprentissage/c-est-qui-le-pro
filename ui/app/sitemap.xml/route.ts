import { formationsCount } from "../queries/formationsCount/query";
import { formationsUrl } from "../queries/formationsUrl/query";

export const dynamic = "force-dynamic";

const URLS_PER_SITEMAP = 5000;
const BASE_URL = `https://${process.env.NEXT_PUBLIC_DOMAIN}`;

const staticUrls = [
  { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
  {
    url: `${BASE_URL}/recherche?address=98%20Quai%20du%20Port%2013002%20Marseille`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    url: `${BASE_URL}/recherche?address=5%20Rue%20Jean%20Pierre%20Timbaud%2087000%20Limoges`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    url: `${BASE_URL}/recherche?address=29%20rue%20de%20Rivoli%2075004%20Paris`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    url: `${BASE_URL}/recherche?address=33%20Rue%20de%20la%20Marine%2029730%20Guilvinec`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  },
];

function generateSitemapXml(urls: { url: string; lastModified?: Date; changeFrequency?: string; priority: number }[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.url}</loc>${
      u.lastModified
        ? `
    <lastmod>${new Date(u.lastModified).toISOString()}</lastmod>`
        : ""
    }
    <changefreq>${u.changeFrequency ?? "weekly"}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;
}

function generateSitemapIndexXml(sitemapCount: number) {
  const sitemaps = Array.from({ length: sitemapCount }, (_, i) => ({
    url: `${BASE_URL}/sitemap.xml?id=${i}`,
    lastModified: new Date(),
  }));

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps
  .map(
    (s) => `  <sitemap>
    <loc>${s.url}</loc>
    <lastmod>${s.lastModified.toISOString()}</lastmod>
  </sitemap>`
  )
  .join("\n")}
</sitemapindex>`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const idParam = searchParams.get("id");

  const totalFormations = await formationsCount();
  const sitemapCount = Math.ceil(totalFormations / URLS_PER_SITEMAP);

  // Si pas d'id, retourner le sitemap index
  if (idParam === null) {
    const xml = generateSitemapIndexXml(sitemapCount);
    return new Response(xml, {
      headers: { "Content-Type": "application/xml" },
    });
  }

  const id = parseInt(idParam);

  if (isNaN(id) || id < 0 || id >= sitemapCount) {
    return new Response("Invalid sitemap id", { status: 404 });
  }

  const formations = await formationsUrl({
    page: id,
    limit: URLS_PER_SITEMAP,
  });

  const formationUrls = formations.map((f) => ({
    url: `${BASE_URL}${f.url}`,
    lastModified: f.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  // Inclure les pages statiques uniquement dans le premier sitemap
  const urls = id === 0 ? [...staticUrls, ...formationUrls] : formationUrls;

  const xml = generateSitemapXml(urls);
  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
