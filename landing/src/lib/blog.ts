import { BLOG_POSTS, type BlogPost } from "@/data/blog-posts";
import { BLOG_POSTS_ID } from "@/data/blog-posts-id";
import type { Locale } from "@/data/locale-content";

const ALL_POSTS = [...BLOG_POSTS, ...BLOG_POSTS_ID];

function getPostsForLocale(locale?: Locale): BlogPost[] {
  if (locale === "id") return BLOG_POSTS_ID;
  if (locale === "in") return BLOG_POSTS;
  return ALL_POSTS;
}

export function getAllPosts(locale?: Locale): BlogPost[] {
  return getPostsForLocale(locale);
}

export function getPostBySlug(
  slug: string,
  locale?: Locale,
): BlogPost | undefined {
  return getPostsForLocale(locale).find((post) => post.slug === slug);
}

export function getAllSlugs(locale?: Locale): string[] {
  return getPostsForLocale(locale).map((post) => post.slug);
}
