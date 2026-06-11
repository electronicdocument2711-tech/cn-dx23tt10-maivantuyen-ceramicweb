# Gốm Sứ Vòng Đời

Đồ án website mua bán đồ gốm sứ đã qua sử dụng, tập trung vào việc giới thiệu
sản phẩm, hỗ trợ quy trình mua hàng và cung cấp khu vực quản trị cơ bản.

Repository hiện chứa:

- Prototype giao diện cửa hàng gốm sứ và trang quản trị.
- Một bộ mã nguồn quản lý phòng khám/nha khoa được dùng làm nền tảng hoặc mã
  tham khảo.
- Tài liệu đồ án gồm báo cáo, slide thuyết trình, poster và tài liệu tham khảo.

> **Lưu ý về trạng thái hiện tại:** repository chưa có `package.json`, lockfile,
> cấu hình Next.js/TypeScript và file mẫu biến môi trường. Vì vậy mã nguồn chưa
> thể được cài đặt hoặc chạy độc lập ngay sau khi clone. Thư mục mã nguồn đang
> được đặt tên là `scr/`, không phải tên thông dụng `src/`.

## Nội dung chính

### Website gốm sứ

Phần giao diện dành cho khách hàng có các màn hình:

- Trang chủ giới thiệu cửa hàng, sản phẩm nổi bật, danh mục và bài viết.
- Danh sách sản phẩm, ô tìm kiếm, bộ lọc danh mục và sắp xếp giao diện.
- Trang chi tiết sản phẩm và sản phẩm liên quan.
- Giỏ hàng, thanh toán và trang xác nhận đặt hàng.
- Blog và chi tiết bài viết.
- Tài khoản khách hàng và lịch sử đơn hàng.

Phần quản trị có các màn hình:

- Dashboard tổng quan doanh thu, đơn hàng, sản phẩm và tồn kho.
- Quản lý sản phẩm, danh mục, đơn hàng và khách hàng.
- Form tạo/sửa sản phẩm.
- Chi tiết đơn hàng.
- Báo cáo doanh thu và tồn kho.

Dữ liệu gốm sứ hiện là dữ liệu mẫu được khai báo trực tiếp tại
`scr/lib/ceramic/data.ts`. Các thao tác tìm kiếm, lọc, thêm giỏ hàng, thanh toán,
thêm/sửa/xóa trong khu vực quản trị phần lớn mới dừng ở mức giao diện minh họa,
chưa có cơ sở dữ liệu riêng cho cửa hàng.

### Mã nguồn quản lý phòng khám kế thừa

Bên cạnh phần gốm sứ, `scr/` còn chứa nhiều màn hình và API route cho hệ thống
quản lý phòng khám/nha khoa, bao gồm:

- Quản lý khách hàng, hồ sơ điều trị, chẩn đoán và hình ảnh.
- Lịch hẹn, lịch làm việc, bác sĩ và ghế nha khoa.
- Quản lý chi nhánh, nhân sự, phòng, dịch vụ và vật tư.
- Hóa đơn điện tử, thanh toán, hoàn tiền và tích hợp VNPAY.
- Dashboard, báo cáo vận hành, doanh thu và hiệu suất.
- Đăng nhập, đăng ký, xác thực và quản lý gói dịch vụ.

Các API route này chủ yếu đóng vai trò proxy tới dịch vụ CMS/SaaS bên ngoài và
cần biến môi trường cùng hệ thống backend tương ứng để hoạt động.

## Công nghệ nhận diện từ mã nguồn

- Next.js App Router, React và TypeScript.
- Tailwind CSS 4.
- HeroUI.
- Axios cho kết nối API.
- React Hook Form và Yup cho biểu mẫu/kiểm tra dữ liệu.
- Recharts và React Big Calendar.
- Day.js, jose, xlsx, Papa Parse và html2pdf.js.
- VNPAY cho luồng thanh toán trực tuyến.

Do thiếu `package.json`, phiên bản chính xác của các thư viện chưa được ghi nhận
trong repository.

## Cấu trúc thư mục

```text
.
├── README.md
├── scr/                         # Toàn bộ mã nguồn ứng dụng
│   ├── app/                     # Trang và API route theo Next.js App Router
│   │   ├── admin/               # Trang quản trị cửa hàng gốm sứ
│   │   ├── account/             # Tài khoản khách hàng
│   │   ├── blog/                # Blog
│   │   ├── cart/                # Giỏ hàng
│   │   ├── checkout/            # Thanh toán
│   │   ├── products/            # Chi tiết sản phẩm
│   │   ├── shop/                # Danh sách sản phẩm
│   │   ├── api/                 # API route, phần lớn thuộc hệ thống kế thừa
│   │   ├── clinic/              # Quản lý phòng khám
│   │   ├── customer/            # Quản lý khách hàng/bệnh án
│   │   ├── payment/             # Thanh toán và hóa đơn
│   │   ├── report/              # Báo cáo
│   │   └── ...
│   ├── com/                     # Component giao diện
│   │   └── ceramic/             # Shell và card dành riêng cho cửa hàng gốm
│   ├── const/                   # Hằng số ứng dụng
│   ├── context/                 # React Context
│   ├── css/                     # CSS/SCSS toàn cục và theo module
│   ├── data/                    # Dữ liệu mẫu của hệ thống kế thừa
│   ├── hook/                    # Custom React hooks
│   ├── lib/                     # Tiện ích, API client và dữ liệu gốm sứ
│   │   └── ceramic/data.ts      # Sản phẩm, danh mục, bài viết và đơn mẫu
│   └── types/                   # Khai báo kiểu TypeScript
├── thesis/
│   ├── abs/                     # Slide thuyết trình định dạng PPTX
│   ├── doc/                     # Báo cáo định dạng DOCX
│   ├── pdf/                     # Bản PDF của báo cáo và slide
│   ├── poster/                  # Poster dự án định dạng PNG/PDF
│   └── ref/                     # Tài liệu nghiên cứu và tiêu chuẩn tham khảo
├── progress-report/             # Thư mục dự kiến cho báo cáo tiến độ, đang rỗng
└── setup/                       # Thư mục dự kiến cho tài liệu cài đặt, đang rỗng
```

## Các tuyến trang gốm sứ

| Tuyến trang | Chức năng |
| --- | --- |
| `/` | Trang chủ |
| `/shop` | Danh sách sản phẩm |
| `/products/[slug]` | Chi tiết sản phẩm |
| `/cart` | Giỏ hàng |
| `/checkout` | Thanh toán |
| `/checkout/success` | Xác nhận đặt hàng |
| `/blog` và `/blog/[slug]` | Danh sách và chi tiết bài viết |
| `/account` và `/account/orders` | Tài khoản và lịch sử đơn hàng |
| `/admin` | Dashboard quản trị |
| `/admin/products` | Quản lý sản phẩm |
| `/admin/orders` | Quản lý đơn hàng |
| `/admin/customers` | Quản lý khách hàng |
| `/admin/categories` | Quản lý danh mục |
| `/admin/reports/revenue` | Báo cáo doanh thu |
| `/admin/reports/inventory` | Báo cáo tồn kho |

Ngoài các tuyến trên, mã nguồn còn có nhiều tuyến thuộc hệ thống phòng khám như
`/clinic`, `/customer`, `/schedule`, `/service`, `/payment`, `/report`,
`/marketing`, `/register` và `/upgrade`.

## Biến môi trường được sử dụng

Mã nguồn có tham chiếu đến các biến sau:

| Nhóm | Biến |
| --- | --- |
| Địa chỉ dịch vụ | `CMS_URL`, `SAAS_URL`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SAAS_URL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_LANDINGPAGE_URL` |
| Xác thực và token | `SECRET`, `SYSTEM_TOKEN`, `PERMANENT_TOKEN`, `VERIFY_CONFIRM_TOKEN`, `STRAPI_IPN_TOKEN`, `PASSWORD_ENCRYPTION_KEY` |
| Domain/cookie | `CHECK_DOMAIN`, `NEXT_PUBLIC_CHECK_DOMAIN`, `NEXT_PUBLIC_COOKIE_DOMAIN` |
| Gói dịch vụ | `FREE_PLAN_ID` |
| VNPAY | `VNPAY_TMN_CODE`, `VNPAY_HASH_SECRET`, `VNPAY_RETURN_URL`, `VNPAY_PAYMENT_ONLINE_API_URL` |

Không đưa khóa bí mật thật vào Git. Khi hoàn thiện dự án, nên bổ sung
`.env.example` chỉ chứa tên biến và giá trị minh họa an toàn.

## Khôi phục cấu hình để chạy dự án

Repository hiện chưa đủ file để chạy. Cần khôi phục hoặc bổ sung tối thiểu:

1. `package.json` và lockfile với đầy đủ dependencies.
2. `tsconfig.json` có alias `@/*` trỏ tới `scr/*`.
3. Cấu hình Next.js phù hợp.
4. Cấu hình lint/format nếu cần.
5. `.env.local` với các biến môi trường cần thiết.

Sau khi các file trên đã được khôi phục, quy trình Next.js thông thường là:

```bash
npm install
npm run dev
```

Sau đó mở `http://localhost:3000`.

Các lệnh `npm run build`, `npm run lint` và `npm test` chỉ khả dụng khi được
khai báo trong `package.json`.

## Hạn chế và việc cần hoàn thiện

- Bổ sung đầy đủ cấu hình dự án và danh sách dependencies.
- Cân nhắc đổi `scr/` thành `src/`, đồng thời cập nhật alias/import liên quan.
- Tách phần cửa hàng gốm sứ khỏi mã nguồn phòng khám kế thừa.
- Kết nối sản phẩm, danh mục, đơn hàng và khách hàng với cơ sở dữ liệu/backend.
- Hoàn thiện tìm kiếm, lọc, giỏ hàng và quy trình thanh toán thực tế.
- Bổ sung phân quyền và bảo vệ các trang quản trị.
- Thay hình minh họa CSS bằng ảnh sản phẩm thực.
- Bổ sung kiểm thử, lint, format và quy trình CI/CD.
- Loại bỏ `.DS_Store` khỏi repository và thêm vào `.gitignore`.

## Tài liệu đồ án

Tài liệu nằm trong `thesis/`:

- Báo cáo Word: `thesis/doc/cn-dx23tt10-maivantuyen-websitedogom.docx`
- Báo cáo PDF: `thesis/pdf/cn-dx23tt10-maivantuyen-websitedogom.docx.pdf`
- Slide PowerPoint: `thesis/abs/thuyet_trinh_website_mua_ban_gom_su.pptx`
- Slide PDF: `thesis/pdf/thuyet_trinh_website_mua_ban_gom_su.pdf`
- Poster: `thesis/poster/Poster_du_an_website_gom_su.png` và `.pdf`
- Tài liệu tham khảo: các file trong `thesis/ref/`

## Tình trạng repository

Tại thời điểm README này được cập nhật:

- Phần mã nguồn có khoảng 500 file, chủ yếu là TypeScript/TSX.
- Có khoảng 96 page component và 117 API route.
- Prototype gốm sứ sử dụng dữ liệu mẫu nội bộ.
- Chưa có cấu hình cài đặt/chạy dự án hoàn chỉnh.
- `progress-report/` và `setup/` chưa có nội dung.
