"use client";

import { Suspense } from "react";
import NewHeader from "@/com/register/Header";
import CreateClinic from "@/com/register/clinic/CreateClinic";
// import { Button, Form, Input } from "@heroui/react";

export default function CreateClinicPage() {
  return (
    <div className="min-h-screen bg-white">
      <NewHeader currentStep={1} />

      <main>
        <Suspense
          fallback={
            <div className="w-full min-h-screen flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            </div>
          }
        >
          <CreateClinic />
        </Suspense>
      </main>
    </div>
  );
}
