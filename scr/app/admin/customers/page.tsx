import AdminShell from "@/com/ceramic/AdminShell";

const customers = [
  ["Nguyễn Minh An", "an@example.com", "3 đơn"],
  ["Lê Hoài Thu", "thu@example.com", "2 đơn"],
  ["Trần Gia Bảo", "bao@example.com", "5 đơn"],
];

export default function AdminCustomersPage() {
  return (
    <AdminShell>
      <h1 className="text-3xl font-bold">Quản lý khách hàng</h1>
      <div className="mt-6 overflow-hidden rounded-lg bg-white">
        {customers.map(([name, email, orders]) => (
          <div
            key={email}
            className="grid gap-3 border-b p-4 text-sm last:border-b-0 md:grid-cols-3"
          >
            <strong>{name}</strong>
            <span>{email}</span>
            <span>{orders}</span>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
