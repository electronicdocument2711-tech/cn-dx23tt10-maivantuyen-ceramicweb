import React, { createContext, useContext, ReactNode } from "react";
import { useCookie } from "@/hook/cookie";

const LayoutContext = createContext<{
  isFullLayout?: boolean;
  setIsFullLayout?: void | ((isFull: boolean) => void);
}>({
  isFullLayout: false,
  setIsFullLayout: () => {},
});

export const LayoutProvider: React.FC<{
  isFull: boolean;
  children: ReactNode;
}> = ({ isFull, children }) => {
  const [isFullLayout, setIsFullLayout] = useCookie<boolean>(
    "fluid-layout",
    isFull ?? true,
  );

  return (
    <LayoutContext.Provider value={{ isFullLayout, setIsFullLayout }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayoutContext = () => {
  const context = useContext(LayoutContext);
  if (!context)
    throw new Error("useLayoutContext must be used within a LayoutProvider");

  return context;
};
