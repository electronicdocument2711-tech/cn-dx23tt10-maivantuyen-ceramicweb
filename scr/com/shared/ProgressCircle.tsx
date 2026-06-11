import { IconCloud } from "@tabler/icons-react";

type Props = {
  progress: number; // 0 -> 100
  isUnlimited?: boolean;
  reached?: boolean;
};

export default function ProgressCircle({
  progress,
  isUnlimited = false,
  reached = false,
}: Props) {
  const radius = 18;
  const stroke = 2;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  const strokeDashoffset =
    isUnlimited || reached
      ? 0
      : circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-10 h-10">
      {/* SVG progress */}
      <svg
        height={radius * 2}
        width={radius * 2}
        className="absolute rotate-[-90deg]"
      >
        {/* Background */}
        <circle
          stroke="#E6F2FB"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />

        {/* Progress */}
        <circle
          stroke={isUnlimited ? "#34D399" : reached ? "#E7E5E4" : "#3B82F6"}
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference + " " + circumference}
          style={{
            strokeDashoffset,
            transition: "stroke-dashoffset 0.35s",
          }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>

      {/* Inner content */}
      <div
        className={`flex items-center justify-center rounded-full w-8 h-8 ${isUnlimited ? "bg-green-50 text-green-500" : reached ? "bg-white text-gray-500" : "bg-white text-blue-700"}`}
      >
        <IconCloud size={16} />
      </div>
    </div>
  );
}
