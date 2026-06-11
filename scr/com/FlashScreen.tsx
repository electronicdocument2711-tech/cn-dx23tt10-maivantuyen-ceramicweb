import { Spinner } from "@heroui/spinner";

const FlashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 flex gap-3 items-center justify-center bg-white z-50 transition-all">
      <Spinner size="md" />
      <p className="text-gray-500 font-medium">Loading...</p>
    </div>
  );
};

export default FlashScreen;
