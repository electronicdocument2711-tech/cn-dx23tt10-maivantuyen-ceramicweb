import React, { SVGProps } from "react";

const Jaw: React.FC<SVGProps<SVGSVGElement>> = ({
  children,
  viewBox = "0 0 320 247",
  className,
  ...props
}) => {
  return (
    <svg
      viewBox={viewBox}
      className={`teeth-chart-svg w-full ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      {...props}
    >
      {children}
    </svg>
  );
};

export default Jaw;
