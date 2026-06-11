import { PRODUCT_NAME_MAPPING } from "@/const";

export interface UpgradePlan {
  documentId?: string;
  id?: number | string;
  months_per_interval: number;
  name: string;
  product_name?: string;
  price: number;
  product: {
    name: string;
    description: string;
    features?: string[] | string;
    product_features: {
      name: string;
    }[];
  };
  product_pricings: {
    price: number;
  }[];
}

export const getUpgradePlanLabel = (productName: string) =>
  PRODUCT_NAME_MAPPING[productName as keyof typeof PRODUCT_NAME_MAPPING] ??
  productName;

export const getUpgradePlanIntervalLabel = (monthsPerInterval: number) => {
  if (monthsPerInterval === 12) {
    return "Theo năm";
  }

  return `Theo tháng`;
};

export const getUpgradePlanKey = (plan: UpgradePlan, index = 0) =>
  plan.documentId ??
  plan.id ??
  `${plan.name}-${plan.months_per_interval}-${index}`;
