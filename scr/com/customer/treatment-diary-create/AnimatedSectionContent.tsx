import { motion } from "framer-motion";
import { PropsWithChildren } from "react";

interface AnimatedSectionContentProps extends PropsWithChildren {
  isOpen: boolean;
  className?: string;
}

const AnimatedSectionContent: React.FC<AnimatedSectionContentProps> = ({
  isOpen,
  className,
  children,
}) => {
  return (
    <motion.div
      initial={false}
      animate={{
        height: isOpen ? "auto" : 0,
        opacity: isOpen ? 1 : 0,
        y: isOpen ? 0 : -4,
      }}
      transition={{
        height: { duration: 0.3, ease: "easeOut" },
        opacity: { duration: 0.22, ease: "easeOut" },
        y: { duration: 0.22, ease: "easeOut" },
      }}
      className="overflow-hidden"
      style={{ pointerEvents: isOpen ? undefined : "none" }}
    >
      <div className={className}>{children}</div>
    </motion.div>
  );
};

export default AnimatedSectionContent;
