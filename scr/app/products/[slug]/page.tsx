import CeramicShell from "@/com/ceramic/CeramicShell";
import ProductCard from "@/com/ceramic/ProductCard";
import { formatCurrency, getProductBySlug, products } from "@/lib/ceramic/data";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) notFound();

  return (
    <CeramicShell>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="aspect-square rounded-lg bg-[radial-gradient(circle_at_35%_25%,#fffdf8,#dbc7a8_34%,#815f44_35%,#f1e7d8_36%,#f9f7f2_70%)]" />
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8a5d2f]">
            {product.collection} · {product.sku}
          </p>
          <h1 className="mt-3 text-4xl font-black">{product.name}</h1>
          <p className="mt-4 text-2xl font-bold text-[#254f45]">
            {formatCurrency(product.price)}
          </p>
          <p className="mt-5 leading-7 text-stone-700">{product.description}</p>
          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-lg bg-white p-4">
              <dt className="text-stone-500">Tình trạng</dt>
              <dd className="mt-1 font-semibold">{product.condition}</dd>
            </div>
            <div className="rounded-lg bg-white p-4">
              <dt className="text-stone-500">Tồn kho</dt>
              <dd className="mt-1 font-semibold">{product.stock}</dd>
            </div>
          </dl>
          <div className="mt-8 flex gap-3">
            <Link
              href="/cart"
              className="rounded-full bg-[#254f45] px-6 py-3 text-sm font-semibold text-white"
            >
              Thêm vào giỏ
            </Link>
            <Link
              href="/checkout"
              className="rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-semibold"
            >
              Mua ngay
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold">Sản phẩm liên quan</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products
            .filter((item) => item.id !== product.id)
            .slice(0, 3)
            .map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
        </div>
      </section>
    </CeramicShell>
  );
}
