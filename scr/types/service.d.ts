type Service = {
  id: number;
  code: string;
  name: string;
  plan: string;
  price: number;
  tax: number;
  category: string;
  status: "active" | "paused";
  description?: string;
};
