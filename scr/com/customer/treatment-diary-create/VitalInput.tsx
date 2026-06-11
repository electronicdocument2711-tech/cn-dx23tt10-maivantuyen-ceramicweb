interface VitalInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  unit: string;
  error?: string;
}

const VitalInput: React.FC<VitalInputProps> = ({
  value,
  onChange,
  placeholder,
  unit,
  error,
}) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex overflow-hidden rounded-xl border border-default-300 bg-white">
        <div className="flex flex-1 items-end px-3 py-2">
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className="max-w-20 border-b border-default-300 bg-transparent text-sm text-center font-medium text-foreground placeholder:text-[#7A8593] focus:outline-none"
          />
        </div>
        <div className="flex items-center justify-center border-l border-default-300 bg-[#F7F9FB] px-2">
          <span className="text-base font-medium text-default-600">{unit}</span>
        </div>
      </div>
      {error && (
        <span className="text-xs font-medium text-danger">{error}</span>
      )}
    </div>
  );
};

export default VitalInput;
