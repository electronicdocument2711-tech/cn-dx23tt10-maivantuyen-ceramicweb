import React from "react";

interface ProgressIndicatorProps {
  currentStep: number;
  steps: string[];
  className?: string;
}

export default function ProgressIndicator({
  currentStep,
  steps,
}: ProgressIndicatorProps) {
  return (
    <div className={`container w-full flex flex-1 space-x-20`}>
      {steps.map((step, idx) => {
        const stepNumber = idx + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <div key={idx} className="flex items-center">
            {/*  */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                isActive
                  ? "bg-white border-1 border-blue-600 rounded-b-full text-blue-600"
                  : isCompleted
                  ? "bg-white border-1 border-blue-600 rounded-b-full text-slate-500"
                  : "bg-white border-1 border-slate-500 rounded-b-full text-blue-600"
              }`}
            >
              {stepNumber}
            </div>

            <span
              className={`ml-2 text-base font-bold ${
                isActive
                  ? "text-blue-600 text-xl"
                  : isCompleted
                  ? "hidden lg:flex text-blue-600 text-xl"
                  : "hidden lg:flex text-slate-500 text-xl"
              }`}
            >
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}
