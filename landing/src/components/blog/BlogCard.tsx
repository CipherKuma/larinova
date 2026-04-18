import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/data/blog-posts";

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group overflow-hidden rounded-xl border border-white/[0.06] bg-card/30 transition-all hover:border-primary/20"
    >
      <div className="relative h-44 w-full overflow-hidden">
        <Image
          src={post.image}
          alt={post.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
        <span className="absolute bottom-3 left-3 rounded-full bg-primary/20 px-2.5 py-0.5 font-mono text-[10px] text-primary">
          {post.tag}
        </span>
      </div>
      <div className="p-5">
        <p className="mb-2 font-mono text-[11px] text-muted-foreground">
          {post.date}
        </p>
        <h3 className="mb-2 text-[15px] font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
          {post.title}
        </h3>
        <p className="text-[13px] leading-relaxed text-muted-foreground line-clamp-2">
          {post.excerpt}
        </p>
      </div>
    </Link>
  );
}
