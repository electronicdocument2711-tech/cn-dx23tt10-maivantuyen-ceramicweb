export type CeramicCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
};

export type CeramicProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  categorySlug: string;
  collection: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  condition: "like_new" | "good" | "vintage" | "rare";
  imagePosition: string;
  featured?: boolean;
};

export type CeramicPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
};

export const categories: CeramicCategory[] = [
  {
    id: "bat-dia",
    name: "Bát đĩa",
    slug: "bat-dia",
    description: "Bộ bàn ăn, đĩa lẻ, chén trà và vật dụng dùng hằng ngày.",
  },
  {
    id: "am-chen",
    name: "Ấm chén",
    slug: "am-chen",
    description: "Ấm trà, tách, chén và phụ kiện pha trà đã tuyển chọn.",
  },
  {
    id: "binh-lo",
    name: "Bình & lọ",
    slug: "binh-lo",
    description: "Bình trang trí, lọ hoa, chum nhỏ và đồ trưng bày.",
  },
  {
    id: "do-suu-tam",
    name: "Đồ sưu tầm",
    slug: "do-suu-tam",
    description: "Món cũ hiếm, men lạ, sản phẩm độc bản có câu chuyện riêng.",
  },
];

export const products: CeramicProduct[] = [
  {
    id: "sp-001",
    name: "Bộ đĩa men lam viền tay",
    slug: "bo-dia-men-lam-vien-tay",
    sku: "GS-BD-001",
    categorySlug: "bat-dia",
    collection: "Men lam",
    description:
      "Bộ 6 đĩa gốm đã qua sử dụng, mặt men còn sáng, viền vẽ tay mềm và đều.",
    price: 680000,
    compareAtPrice: 820000,
    stock: 3,
    condition: "good",
    imagePosition: "center",
    featured: true,
  },
  {
    id: "sp-002",
    name: "Ấm trà đất nung dáng thấp",
    slug: "am-tra-dat-nung-dang-thap",
    sku: "GS-AC-014",
    categorySlug: "am-chen",
    collection: "Trà cụ",
    description:
      "Ấm nhỏ phù hợp độc ẩm, nước men nâu trầm, quai chắc và rót gọn dòng.",
    price: 450000,
    stock: 5,
    condition: "like_new",
    imagePosition: "center",
    featured: true,
  },
  {
    id: "sp-003",
    name: "Lọ hoa men rạn cổ điển",
    slug: "lo-hoa-men-ran-co-dien",
    sku: "GS-BL-027",
    categorySlug: "binh-lo",
    collection: "Men rạn",
    description:
      "Lọ hoa cao, vân rạn tự nhiên, hợp bàn console hoặc kệ gỗ tối màu.",
    price: 920000,
    stock: 2,
    condition: "vintage",
    imagePosition: "center",
    featured: true,
  },
  {
    id: "sp-004",
    name: "Chén trà trắng ngà dáng Nhật",
    slug: "chen-tra-trang-nga-dang-nhat",
    sku: "GS-AC-022",
    categorySlug: "am-chen",
    collection: "Tối giản",
    description:
      "Chén trà đơn, form gọn tay, sắc trắng ngà nhẹ, hợp bộ trà hiện đại.",
    price: 120000,
    stock: 12,
    condition: "good",
    imagePosition: "center",
  },
  {
    id: "sp-005",
    name: "Bình gốm nâu vai rộng",
    slug: "binh-gom-nau-vai-rong",
    sku: "GS-BL-039",
    categorySlug: "binh-lo",
    collection: "Đất nung",
    description:
      "Bình trang trí mộc, bề mặt có dấu thời gian rõ, phù hợp không gian wabi-sabi.",
    price: 760000,
    stock: 1,
    condition: "rare",
    imagePosition: "center",
  },
  {
    id: "sp-006",
    name: "Tượng gốm nhỏ hình cá chép",
    slug: "tuong-gom-nho-hinh-ca-chep",
    sku: "GS-ST-011",
    categorySlug: "do-suu-tam",
    collection: "Độc bản",
    description:
      "Tượng nhỏ tráng men xanh rêu, có vài vết xước nhẹ đúng chất đồ cũ.",
    price: 390000,
    stock: 4,
    condition: "vintage",
    imagePosition: "center",
  },
];

export const posts: CeramicPost[] = [
  {
    slug: "cach-doc-vet-men-cu",
    title: "Cách đọc vết men trên đồ gốm cũ",
    excerpt:
      "Một vài dấu hiệu giúp phân biệt vết thời gian tự nhiên và lỗi bảo quản.",
    date: "2026-06-01",
    readTime: "5 phút đọc",
  },
  {
    slug: "bao-quan-am-chen-da-qua-su-dung",
    title: "Bảo quản ấm chén đã qua sử dụng",
    excerpt:
      "Cách làm sạch, khử mùi và cất giữ trà cụ cũ mà không làm mất nước men.",
    date: "2026-05-27",
    readTime: "4 phút đọc",
  },
  {
    slug: "chon-binh-gom-cho-ke-go",
    title: "Chọn bình gốm cho kệ gỗ",
    excerpt:
      "Tỷ lệ, màu men và chiều cao là ba yếu tố quyết định cảm giác cân bằng.",
    date: "2026-05-20",
    readTime: "6 phút đọc",
  },
];

export const sampleOrders = [
  {
    code: "GS260604-001",
    customer: "Nguyễn Minh An",
    total: 1130000,
    status: "Chờ xác nhận",
    payment: "COD",
    date: "2026-06-04",
  },
  {
    code: "GS260603-018",
    customer: "Lê Hoài Thu",
    total: 920000,
    status: "Đang giao",
    payment: "Chuyển khoản",
    date: "2026-06-03",
  },
  {
    code: "GS260602-011",
    customer: "Trần Gia Bảo",
    total: 1560000,
    status: "Hoàn tất",
    payment: "Ví điện tử",
    date: "2026-06-02",
  },
];

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

export const getProductBySlug = (slug: string) =>
  products.find((product) => product.slug === slug);

export const getPostBySlug = (slug: string) =>
  posts.find((post) => post.slug === slug);
