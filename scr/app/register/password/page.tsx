//
import React from "react";

import NewHeader from "@/com/Header";
import PasswordRegisterContain from "@/com/register/password/PasswordRegisterContain";

const page = () => {
  return (
    <div className="bg-white">
      <NewHeader />

      <main>
        <PasswordRegisterContain />
      </main>
    </div>
  );
};

export default page;
