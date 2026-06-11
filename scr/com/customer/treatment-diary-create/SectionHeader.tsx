import { IconAlertTriangleFilled, IconChevronDown } from "@tabler/icons-react";

interface SectionHeaderProps {
  index: number;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  errors?: any;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  index,
  title,
  isOpen,
  onToggle,
  errors,
}) => (
  <button
    type="button"
    className={`w-full flex items-center justify-between  text-left ${
      isOpen
        ? "bg-[#E8F1FD] rounded-2xl"
        : index > 1
          ? "border-t border-default-200"
          : ""
    }`}
    onClick={onToggle}
  >
    <div className="flex items-center gap-2 text-xl font-bold text-blue-800 p-3">
      <span className="bg-gray-50 text-blue-800 rounded-lg px-2 py-1 min-w-9 flex items-center justify-center">
        {index}
      </span>
      <h3>{title}</h3>
    </div>
    <div className="flex items-center gap-2">
      {errors && (
        <div className="text-red-700 px-2 rounded-md justify-center py-1 bg-red-50 border border-red-100 flex gap-1 items-center">
          <IconAlertTriangleFilled size={16} />
          <span className="text-sm font-medium">Chưa đủ thông tin</span>
        </div>
      )}
      <span className=" flex size-8 mr-2 items-center justify-center rounded-full bg-white text-default-600">
        <IconChevronDown
          size={18}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </span>
    </div>
  </button>
);

export default SectionHeader;
