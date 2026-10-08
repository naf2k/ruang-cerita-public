import type { MetadataRoute } from "next";
import { listPublishedArticles } from "@/lib/actions/articles";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ruangcerita.id";
  const staticRoutes = ["/", "/about", "/counselors", "/resources", "/help-now", "/login", "/register", "/privacy"];
  const articles = await listPublishedArticles().catch(() => []);
  return [
    ...staticRoutes.map((p) => ({ url: `${base}${p}`, lastModified: new Date() })),
    ...articles.map((a) => ({ url: `${base}/resources/${a.slug}`, lastModified: new Date(a.created_at) })),
  ];
}
