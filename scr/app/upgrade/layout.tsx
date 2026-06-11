import React from "react";

export default function UpgradeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="w-full mx-auto ">{children}</div>;
}
