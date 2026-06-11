import { HTMLAttributes } from "react";

const Tooth: React.FC<HTMLAttributes<SVGGElement>> = ({
  children,
  ...props
}) => {
  return (
    <g
      {...props}
      role="button"
      tabIndex={-1}
      className="cursor-pointer hover:opacity-80 transition-all duration-200"
    >
      {children}
    </g>
  );
};

export default Tooth;
