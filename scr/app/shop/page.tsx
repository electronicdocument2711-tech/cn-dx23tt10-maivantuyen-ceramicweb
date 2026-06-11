import CeramicShell from "@/com/ceramic/CeramicShell";
import ProductCard from "@/com/ceramic/ProductCard";
import { categories, products } from "@/lib/ceramic/data";

export default function ShopPage() {
  return (
    <CeramicShell>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Cửa hàng</h1>
            <p className="mt-2 text-stone-600">
              Danh sách sản phẩm có bộ lọc, tìm kiếm và sắp xếp theo sitemap.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              placeholder="Tìm gốm, men, SKU..."
              className="h-11 rounded-lg border border-stone-300 bg-white px-3 text-sm"
            />
            <select className="h-11 rounded-lg border border-stone-300 bg-white px-3 text-sm">
              <option>Tất cả danh mục</option>
              {categories.map((category) => (
                <option key={category.id}>{category.name}</option>
              ))}
            </select>
            <select className="h-11 rounded-lg border border-stone-300 bg-white px-3 text-sm">
              <option>Sắp xếp nổi bật</option>
              <option>Giá thấp đến cao</option>
              <option>Tồn kho nhiều</option>
            </select>
          </div>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </CeramicShell>
  );
}
