import { Button } from "@heroui/react";
import Link from "next/link";

interface SuccessToastContentProps {
  customerId?: string;
  description?: string;
}

const SuccessToastContent: React.FC<SuccessToastContentProps> = ({
  customerId,
  description = "Cập nhật lịch hẹn thành công",
}) => {
  return (
    <div className="flex flex-col gap-4">
      <p>{description}</p>
      <div className="flex justify-start">
        <Link
          href={`/customer/${customerId}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button size="sm" color="primary">
            Đi tới khách hàng
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default SuccessToastContent;
