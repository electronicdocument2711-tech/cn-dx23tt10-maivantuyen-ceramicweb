"use client";
import { useContext, createContext, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import rest from "@/lib/rest";
import { Customer } from "@/types/define.d";
import { addToast } from "@heroui/react";

export type CustomerContextProps = {
  customer: Customer | null;
  setCustomer: React.Dispatch<React.SetStateAction<Customer | null>>;
};

const CustomerContext = createContext<CustomerContextProps>({
  customer: null,
  setCustomer: () => {},
});

export const useCustomerContext = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error(
      "useCustomerContext must be used within a CustomerContextProvider",
    );
  }

  return context;
};

const CustomerProvider = ({ children }: { children: React.ReactNode }) => {
  const params = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    if (!params?.id) return;
    const fetchCustomerData = async () => {
      try {
        const res = await rest.get(`/customer/${params?.id}`);
        const data = res.data;
        if (!data) throw new Error("Không tìm thấy thông tin khách hàng");
        setCustomer(data);
      } catch {
        setCustomer(null);
        addToast({
          title: "Thất bại",
          description: "Không tìm thấy thông tin khách hàng",
          color: "danger",
        });
      }
    };
    fetchCustomerData();
  }, [params]);
  return (
    <CustomerContext.Provider value={{ customer, setCustomer }}>
      {children}
    </CustomerContext.Provider>
  );
};

export default CustomerProvider;
