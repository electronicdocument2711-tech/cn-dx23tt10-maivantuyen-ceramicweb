export const UI_META = {
  Button: {
    primary: {
      classnames:
        "w-full h-10 px-2 rounded-xl font-bold text-base data-[disabled=true]:opacity-100 bg-[#006CE6] text-white hover:bg-blue-600 data-[disabled=true]:opacity-50",
    },
    default: {
      classnames:
        "w-full h-10 px-2 rounded-xl font-bold text-base data-[disabled=true]:opacity-100 bg-white text-black border  border-[#DEE1E6] hover:bg-gray-100 data-[disabled=true]:bg-blue-100",
    },
    light: {
      classnames:
        "w-full h-10 px-2 rounded-xl font-bold text-base data-[disabled=true]:opacity-100 bg-transparent text-[#53677A] hover:bg-gray-200 data-[disabled=true]:opacity-50",
    },
  },
  Input: {
    classNames: {
      base: "w-full",
      label: "font-medium text-base pl-1 pb-1",
      inputWrapper:
        "h-12 rounded-2xl border-default-400 data-[hover=true]:border-default-500",
      input: "text-base font-medium",
    },
  },
  Textarea: {
    labelPlacement: "outside-top",
    variant: "bordered",
    radius: "lg",
    minRows: 2,
    classNames: {
      label: "font-bold text-base pb-3",
      input: "text-base",
      inputWrapper:
        "opacity-100 w-full min-h-12 data-[hover=true]:border-default-500 px-4 py-2",
    },
  },
  Modal: {
    classnames: {
      closeButton:
        "bg-gray-50 flex items-center justify-center w-7 h-7 text-3xl my-2 mx-2 p-1",
      header:
        "h-13 py-0 px-4 border-b-[0.5px] border-gray-400 text-base font-bold flex justify-start items-center",
      body: "px-3 py-3",
      footer:
        "h-19 px-3 py-0 border-t-[0.5px] border-gray-400 text-base font-bold flex justify-center items-center",
    },
    isDismissable: false,
  },
  Select: {
    classNames: {
      value: "m-2 font-medium text-base",
      label: "font-medium text-base pl-1 pb-1 min-h-8 px-1",
      selectorIcon: "w-4 h-4 ",
      trigger:
        "h-12 w-full px-2 rounded-2xl bg-white border-default-400 data-[hover=true]:border-default-500 flex items-center justify-start gap-1",
    },
    listboxProps: {
      classNames: { list: "!gap-0" },
      itemClasses: {
        base: "px-3 rounded-xl hover:bg-blue-50 data-[selected=true]:bg-blue-100",
        title: "py-2 text-base font-normal leading-[1.3]",
        description: "text-base text-default-500",
      },
      hideSelectedIcon: true,
    },
  },
  Table: {
    flat: {
      classNames: {
        th: "bg-slate-100 border-b border-b-gray-400 text-sm font-medium text-default-500",
        tr: "border-slate-200 border-b hover:bg-gray-50",
        wrapper: "p-0 rounded-none",
        table: "p-0",
        td: "p-2.5 text-base ",
      },
    },
  },
};
