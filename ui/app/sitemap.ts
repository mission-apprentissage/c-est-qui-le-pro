export const dynamic = "force-dynamic";

import { MetadataRoute } from "next";
import { formationsCount } from "./queries/formationsCount/query";
import { formationsUrl } from "./queries/formationsUrl/query";

const URLS_PER_SITEMAP = 5000;
const BASE_URL = process.env.NEXT_PUBLIC_DOMAIN || "https://futurpro.inserjeunes.beta.gouv.fr";

const staticUrls: MetadataRoute.Sitemap = [
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

export async function generateSitemaps() {
  const totalFormations = await formationsCount();
  const sitemapCount = Math.ceil(totalFormations / URLS_PER_SITEMAP);

  return Array.from({ length: sitemapCount }, (_, i) => ({ id: i }));
}

export default async function sitemap({ id: idPromise }: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
  const id = parseInt(await idPromise);
  const formations = await formationsUrl({
    page: id,
    limit: URLS_PER_SITEMAP,
  });

  const urls = formations.map((f) => ({
    url: `${BASE_URL}${f.url}`,
    lastModified: f.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // Inclure les pages statiques uniquement dans le premier sitemap
  if (id === 0) {
    return [...staticUrls, ...urls];
  }

  return urls;
}
