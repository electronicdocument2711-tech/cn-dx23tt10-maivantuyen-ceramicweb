// import BranchList from "@/com/clinic/BranchList";
import AddBranch from "@/com/clinic/AddBranch";
import BranchList from "@/com/clinic/BranchList";
import { cms } from "@/lib/cms";
import { prop } from "remeda";

interface BranchPageProps {
  searchParams: Record<string, string | undefined>;
}
export default async function BranchPage({ searchParams }: BranchPageProps) {
  const pageParams = await searchParams;
  const page = parseInt(pageParams.page || "1", 10);
  const limit = parseInt(pageParams.limit || "20", 10);
  let data = null;

  try {
    const res = await cms.get(
      `/hr/branch?_act=getBranchsWithPagination&lmstart=${(page - 1) * limit}&limit=${limit}`,
    );

    data = prop(res, ...["data", "module", "views", "0"]);
  } catch (error: any) {
    throw new Error(
      error?.message || "Đã có lỗi xảy ra khi tải dữ liệu chi nhánh",
    );
  }

  if (!data) {
    throw new Error("Không thể tải dữ liệu chi nhánh");
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Chi nhánh</h2>
        <AddBranch />
      </div>
      <BranchList data={data} />
    </>
  );
}
