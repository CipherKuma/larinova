import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/metadata";
import { getAllPosts } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();

  const blogEntries = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    priority: 0.7 as const,
  }));

  return [
    { url: SITE_URL, lastModified: new Date(), priority: 1 },
    { url: `${SITE_URL}/in`, lastModified: new Date(), priority: 0.9 },
    { url: `${SITE_URL}/id`, lastModified: new Date(), priority: 0.9 },
    {
      url: `${SITE_URL}/in/discovery-survey`,
      lastModified: new Date(),
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/id/discovery-survey`,
      lastModified: new Date(),
      priority: 0.7,
    },
    { url: `${SITE_URL}/blog`, lastModified: new Date(), priority: 0.8 },
    { url: `${SITE_URL}/book`, lastModified: new Date(), priority: 0.6 },
    ...blogEntries,
  ];
}
