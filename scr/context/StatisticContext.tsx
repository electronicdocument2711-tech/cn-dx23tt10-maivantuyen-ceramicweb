"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface RevenueData {
  QuantityServicesConsultedAndAmount?: any;
}

interface RevenueContextType {
  revenueData: RevenueData | null;

  /* eslint-disable no-unused-vars */
  setRevenueData: (data: RevenueData | null) => void;
}

const RevenueContext = createContext<RevenueContextType | undefined>(undefined);

export const RevenueProvider = ({ children }: { children: ReactNode }) => {
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);

  return (
    <RevenueContext.Provider value={{ revenueData, setRevenueData }}>
      {children}
    </RevenueContext.Provider>
  );
};

export const useRevenue = () => {
  const context = useContext(RevenueContext);
  if (!context) {
    throw new Error(`seRevenue must be used within RevenueProvider`);
  }

  return context;
};
