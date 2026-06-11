import CeramicShell from "@/com/ceramic/CeramicShell";
import { getPostBySlug } from "@/lib/ceramic/data";
import { notFound } from "next/navigation";

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  return (
    <CeramicShell>
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-sm text-stone-500">
          {post.date} · {post.readTime}
        </p>
        <h1 className="mt-3 text-4xl font-black">{post.title}</h1>
        <p className="mt-5 text-lg leading-8 text-stone-700">{post.excerpt}</p>
        <div className="mt-8 space-y-5 leading-8 text-stone-700">
          <p>
            Đồ gốm cũ cần được nhìn bằng cả mắt và tay: độ bóng của men, vết
            rạn, điểm chạm đáy và cảm giác cân bằng đều kể một phần lịch sử của
            món đồ.
          </p>
          <p>
            Khi mua đồ qua sử dụng, điều quan trọng nhất là mô tả trung thực.
            Những vết xước nhỏ không làm mất giá trị nếu người mua biết trước và
            món đồ vẫn giữ được công năng.
          </p>
        </div>
      </article>
    </CeramicShell>
  );
}
