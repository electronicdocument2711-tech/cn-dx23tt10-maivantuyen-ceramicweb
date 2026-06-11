"use client";
import React from "react";

import { IconCircleCheck, IconConfetti } from "@/com/icons/outline";
import { Button } from "@heroui/react";

const page = () => {
  return (
    <div className="bg-white">
      {/* <NewHeader /> */}

      <main>
        <div className="container mx-auto min-h-screen my-auto flex flex-col items-center justify-center">
          <IconCircleCheck size={120} className="text-blue-500" />

          <div className="flex items-center gap-1">
            <h1>Great Job</h1>
            <IconConfetti size={50} className="text-red-500" />
          </div>

          <h1>Your email is verified</h1>

          <p className="pt-3">Use it to log into Detal X</p>

          <Button
            color="primary"
            size="lg"
            className="font-semibold mt-12 text-xl"
          >
            Tiếp tục
          </Button>
        </div>
      </main>
    </div>
  );
};

export default page;
