import Link from "next/link";
import type { CeramicProduct } from "@/lib/ceramic/data";
import { formatCurrency } from "@/lib/ceramic/data";

const conditionLabel: Record<CeramicProduct["condition"], string> = {
  like_new: "Gần như mới",
  good: "Còn tốt",
  vintage: "Vintage",
  rare: "Hiếm",
};

export default function ProductCard({ product }: { product: CeramicProduct }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block overflow-hidden rounded-lg border border-stone-200 bg-white"
    >
      <div className="aspect-[4/3] bg-[radial-gradient(circle_at_35%_25%,#fbfaf7,#d9c8af_42%,#7f5f43_43%,#efe7dc_44%)]" />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-stone-950 group-hover:text-[#254f45]">
            {product.name}
          </h3>
          <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
            {conditionLabel[product.condition]}
          </span>
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-stone-600">
          {product.description}
        </p>
        <div className="mt-4 flex items-end justify-between">
          <p className="text-lg font-bold text-[#254f45]">
            {formatCurrency(product.price)}
          </p>
          <p className="text-xs text-stone-500">Còn {product.stock}</p>
        </div>
      </div>
    </Link>
  );
}
