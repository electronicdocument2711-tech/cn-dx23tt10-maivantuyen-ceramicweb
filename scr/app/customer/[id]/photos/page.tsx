import PhotoList from "@/com/customer/photo/PhotoList";

const CustomerPhotosPage: React.FC = () => {
  return (
    <>
      <h2 className="text-foreground text-xl font-bold">Hình ảnh</h2>
      <div className="mt-8">
        <PhotoList />
      </div>
    </>
  );
};
export default CustomerPhotosPage;
