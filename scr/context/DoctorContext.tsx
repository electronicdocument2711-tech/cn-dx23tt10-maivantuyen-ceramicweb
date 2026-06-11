import React, { createContext, useContext, ReactNode } from "react";
interface DoctorsContextType {
  doctors: any[];
}

const DoctorsContext = createContext<DoctorsContextType | undefined>(undefined);

export const DoctorsProvider: React.FC<{
  doctors: any[];
  children: ReactNode;
}> = ({ doctors, children }) => {
  return (
    <DoctorsContext.Provider value={{ doctors }}>
      {children}
    </DoctorsContext.Provider>
  );
};

export const useDoctorsContext = () => {
  const context = useContext(DoctorsContext);

  if (!context) {
    throw new Error("useDoctorsContext must be used within DoctorsProvider");
  }

  return context;
};
