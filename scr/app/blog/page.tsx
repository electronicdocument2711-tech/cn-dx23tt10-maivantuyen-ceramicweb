import CeramicShell from "@/com/ceramic/CeramicShell";
import { posts } from "@/lib/ceramic/data";
import Link from "next/link";

export default function BlogPage() {
  return (
    <CeramicShell>
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold">Tin tức / Blog</h1>
        <div className="mt-6 grid gap-4">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="rounded-lg border bg-white p-5"
            >
              <p className="text-xs text-stone-500">
                {post.date} · {post.readTime}
              </p>
              <h2 className="mt-2 text-xl font-bold">{post.title}</h2>
              <p className="mt-2 text-stone-600">{post.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>
    </CeramicShell>
  );
}
