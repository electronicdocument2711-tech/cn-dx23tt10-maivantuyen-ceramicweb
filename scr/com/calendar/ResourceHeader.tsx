interface ResourceHeaderProps {
  label: string;
  resource: {
    id: string;
    name?: string;
    specialty?: string;
    avatar?: string;
    color?: string;
  };
}

const ResourceHeader: React.FC<ResourceHeaderProps> = ({ resource }) => {
  if (!resource?.name) {
    return <div className="py-3 px-2 border-b border-gray-500 bg-gray-300" />;
  }

  return (
    <div className="h-full flex flex-col items-center justify-center gap-2 py-2 px-2 bg-slate-100">
      <div className="text-center">
        <div className="text-sm font-semibold text-gray-800">
          {resource?.name}
        </div>
      </div>
    </div>
  );
};

export default ResourceHeader;
