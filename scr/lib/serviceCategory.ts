import rest from "@/lib/rest";

type SaveServiceCategoryOptions = {
  name: string;
  serviceGroupId?: string;
};

export const saveServiceCategory = async ({
  name,
  serviceGroupId,
}: SaveServiceCategoryOptions) => {
  const payload = serviceGroupId
    ? { Name: name, ServiceGroupId: serviceGroupId }
    : { Name: name };

  return rest.post("/category/service", payload);
};
