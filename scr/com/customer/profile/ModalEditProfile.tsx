import { Button } from "@heroui/react";
import { IconPencil } from "@tabler/icons-react";
import React, { useState } from "react";
import ModalAddCustomer from "../ModalAddCustomer";

const ModalEditProfile = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="faded"
        className="hover:bg-blue-50 bg-white font-medium shadow-xs px-4 min-w-0"
        startContent={<IconPencil size={24} />}
        onPress={() => setOpen(true)}
      >
        Sửa
      </Button>
      <ModalAddCustomer isOpen={open} setOpen={setOpen} inputMode="edit" />
    </>
  );
};

export default ModalEditProfile;
