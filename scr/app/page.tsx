import CeramicShell from "@/com/ceramic/CeramicShell";
import ProductCard from "@/com/ceramic/ProductCard";
import { categories, products, posts } from "@/lib/ceramic/data";
import Link from "next/link";

export default function HomePage() {
  const featuredProducts = products.filter((product) => product.featured);

  return (
    <CeramicShell>
      <section className="bg-[#efe5d7]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8a5d2f]">
              Gốm cũ được tuyển chọn
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-stone-950 sm:text-6xl">
              Tìm lại những món gốm đẹp đã có một đời sống trước đó.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-stone-700">
              Cửa hàng chuyên đồ gốm sứ qua sử dụng: kiểm tình trạng rõ ràng,
              chụp ảnh thật, đóng gói kỹ và giao toàn quốc.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="rounded-full bg-[#254f45] px-6 py-3 text-sm font-semibold text-white"
              >
                Xem cửa hàng
              </Link>
              <Link
                href="/blog"
                className="rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-stone-900"
              >
                Đọc kinh nghiệm chọn gốm
              </Link>
            </div>
          </div>
          <div className="min-h-[360px] rounded-lg bg-[radial-gradient(circle_at_35%_25%,#fffdf8,#dbc7a8_34%,#815f44_35%,#f1e7d8_36%,#f9f7f2_70%)] shadow-sm" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Sản phẩm nổi bật</h2>
            <p className="mt-2 text-sm text-stone-600">
              Các món đang được quan tâm nhiều trong tuần này.
            </p>
          </div>
          <Link href="/shop" className="text-sm font-semibold text-[#254f45]">
            Xem tất cả
          </Link>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold">Danh mục sản phẩm</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                href={`/shop?category=${category.slug}`}
                key={category.id}
                className="rounded-lg border border-stone-200 p-5 hover:border-[#254f45]"
              >
                <h3 className="font-semibold">{category.name}</h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  {category.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold">Tin tức / Blog</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="rounded-lg border border-stone-200 bg-white p-5"
            >
              <p className="text-xs text-stone-500">
                {post.date} · {post.readTime}
              </p>
              <h3 className="mt-3 font-semibold">{post.title}</h3>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                {post.excerpt}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </CeramicShell>
  );
}
