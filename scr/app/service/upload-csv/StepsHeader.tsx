import { Button, Card, CardBody } from "@heroui/react";
import { IconCheck, IconChecks, IconEdit, IconUpload } from "@tabler/icons-react";
import Link from "next/link";

type Step = 1 | 2 | 3;
type StepsHeaderProps = {
  step: Step;
};
const steps = [
  {
    key: 1,
    label: "Tải lên file CSV",
    icon: IconUpload,
  },
  {
    key: 2,
    label: "Chỉnh sửa",
    icon: IconEdit,
  },
  {
    key: 3,
    label: "Xác nhận",
    icon: IconCheck,
  },
] as const;
export const StepsHeader = ({ step }: StepsHeaderProps) => (
  <Card shadow="sm">
    <CardBody className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          {steps.map((item, index) => {
            const Icon = item.icon;
            const isActive = step === item.key;
            const isCompleted = step > item.key;

            return (
              <div key={item.key} className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center
          ${
            isCompleted
              ? "bg-green-600 text-white"
              : isActive
                ? "bg-blue-600 text-white"
                : "border border-slate-300 text-slate-400"
          }`}
                >
                  {isCompleted ? (
                    <IconChecks size={22} />
                  ) : (
                    <Icon size={20} />
                  )}
                </div>

                <div
                  className={`font-semibold whitespace-nowrap
          ${
            isActive
              ? "text-blue-700"
              : isCompleted
                ? "text-green-700"
                : "text-slate-600"
          }`}
                >
                  {item.label}
                </div>

                {index < steps.length - 1 && (
                  <div className="h-px w-10 bg-slate-300" />
                )}
              </div>
            );
          })}
        </div>

        <Button as={Link} href="/service" variant="light">
          Đóng
        </Button>
      </div>
    </CardBody>
  </Card>
);