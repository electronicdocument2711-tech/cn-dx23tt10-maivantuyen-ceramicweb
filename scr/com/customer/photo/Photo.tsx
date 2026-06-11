const Photo: React.FC<{ photo: any; onClick?: () => void }> = ({
  photo,
  onClick,
}) => {
  const url = photo?.file?.formats?.thumbnail?.url || photo?.file?.url || "";
  return (
    <div
      className="w-36 h-44 rounded-xl border border-default-400 bg-white"
      onClick={onClick}
    >
      <div className="w-full h-36 p-1 border-dashed border-b border-default-400">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={photo?.file?.name || "Photo"}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
      <p className="text-sm text-gray-600 py-1 px-2 truncate line-clamp-1 max-w-full overflow-hidden">
        {photo?.file?.name}
      </p>
    </div>
  );
};

export default Photo;
