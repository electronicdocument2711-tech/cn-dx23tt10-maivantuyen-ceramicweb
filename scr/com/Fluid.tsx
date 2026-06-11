"use client";

import { useLayoutContext } from "@/context/LayoutContext";

const Fluid: React.FC<{
  isFull?: boolean;
  children: React.ReactNode;
}> = ({ children }) => {
  const { isFullLayout } = useLayoutContext();

  return (
    <div
      className={`w-full ${isFullLayout ? "max-w-full" : "max-w-4xl lg:max-w-5xl xl:max-w-7xl"} mx-auto p-6`}
    >
      {children}
    </div>
  );
};

export default Fluid;
