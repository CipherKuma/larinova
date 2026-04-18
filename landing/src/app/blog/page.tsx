import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";
import { BlogCard } from "@/components/blog/BlogCard";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Insights on AI medical scribing, Indian healthcare technology, and building for doctors who speak Tamil, Hindi, and English.",
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  openGraph: {
    title: "Blog | Larinova",
    description:
      "Insights on AI medical scribing and Indian healthcare technology.",
    url: `${SITE_URL}/blog`,
    siteName: SITE_NAME,
    locale: "en_IN",
    type: "website",
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <>
      <BlogHeader />
      <main className="min-h-screen pt-28 pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16">
            <span className="mb-4 inline-block font-mono text-xs uppercase tracking-widest text-primary">
              Blog
            </span>
            <h1 className="font-display text-3xl font-bold text-foreground md:text-5xl">
              Latest from Larinova
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              Building AI that understands how Indian doctors actually speak.
              Product updates, technical deep dives, and stories from the
              ground.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
