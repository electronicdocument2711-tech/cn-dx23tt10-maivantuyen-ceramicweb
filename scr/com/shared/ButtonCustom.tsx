import { Button } from "@heroui/react";

type ButtonVarianTypes = "default" | "primary" | "light";
type TypeButton = "button" | "submit" | "reset" | undefined;
interface ButtonVariant {
  styleType: ButtonVarianTypes;
  className?: string;
}

const buttonVariants: ButtonVariant[] = [
  {
    styleType: "default",
    className:
      "bg-white text-black border  border-[#DEE1E6] hover:bg-gray-100 data-[disabled=true]:bg-blue-100",
  },
  {
    styleType: "primary",
    className:
      "bg-[#006CE6] text-white hover:bg-blue-600 data-[disabled=true]:opacity-50",
  },
  {
    styleType: "light",
    className:
      "bg-transparent text-[#53677A] hover:bg-gray-200 data-[disabled=true]:opacity-50",
  },
];

interface ButtonCustomProps {
  styleType?: ButtonVarianTypes;
  label: string;
  onClick?: () => void;
  className?: string;
  isDisabled?: boolean;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  isLoading?: boolean;
  form?: string;
  type?: TypeButton;
}
export const ButtonCustom = ({
  label,
  onClick,
  isDisabled,
  className,
  startContent,
  endContent,
  styleType,
  isLoading,
  form,
  type = undefined,
}: ButtonCustomProps) => {
  return (
    <Button
      type={type}
      form={form}
      isLoading={isLoading}
      onPress={onClick}
      className={`w-full h-10 rounded-xl font-bold text-base data-[disabled=true]:opacity-100 ${
        buttonVariants.find(
          (variant) => variant.styleType === (styleType ? styleType : "default")
        )?.className
      } ${className}`}
      isDisabled={isDisabled}
      startContent={startContent}
      endContent={endContent}
    >
      {label}
    </Button>
  );
};
