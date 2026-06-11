//
import React from "react";
import NewHeader from "@/com/register/Header";
import ComboFeature from "@/com/register/combo/ComboFeature";
import PlanFeatures from "@/com/register/combo/PlanFeatures";

export default function Combo() {
  return (
    <div>
      <NewHeader currentStep={2} />

      <main>
        <ComboFeature />
        <PlanFeatures />
      </main>
    </div>
  );
}
