import { Textarea, TextAreaProps } from "@heroui/react";

export const TextAreaCustom = (props: TextAreaProps) => {
  return (
    <Textarea
      labelPlacement="outside-top"
      variant="bordered"
      radius="lg"
      minRows={2}
      classNames={{
        label: "font-bold text-base pb-3",
        input: "text-base",
        // inputWrapper: "px-4 py-2 ",
        inputWrapper:
          "opacity-100 w-full min-h-12 data-[hover=true]:border-default-500 px-4 py-2",
      }}
      {...props}
    />
  );
};
