import React from "react";
import Navbar from "@/com/Navbar";

import { get } from "@/lib/cookie";
import Sidebar from "./Sidebar";
import Fluid from "./Fluid";

const MainLayout: React.FC<
  Readonly<{
    children: React.ReactNode;
  }>
> = async ({ children }) => {
  const isSidebarOpen = (await get("sidebar-open")) !== "false";
  const isFluid = (await get("fluid-layout")) !== "false";
  return (
    <div className="flex flex-nowrap min-h-screen w-full relative bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} />
      <main className="flex-1 relative">
        <Navbar />
        <Fluid isFull={isFluid}>{children}</Fluid>
      </main>
    </div>
  );
};

export default MainLayout;
