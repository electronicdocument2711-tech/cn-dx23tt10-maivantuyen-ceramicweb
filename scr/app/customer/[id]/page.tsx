import { redirect } from "next/navigation";

export default function CustomerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/customer/${params.id}/board`);
}
