import { IconSvgProps } from "@/types/svg";

// Outline style icon (fill none, stroke currentColor)
export const IconEdit = ({
  size,
  width,
  height,
  fill = "none",
  ...props
}: IconSvgProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || width}
    height={size || height}
    fill={fill}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
    <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" />
    <path d="M16 5l3 3" />
  </svg>
);

export const IconTableImport = ({
  size,
  width,
  height,
  fill = "none", // outline mặc định
  ...props
}: IconSvgProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || width}
    height={size || height}
    viewBox="0 0 24 24"
    /* fill="currentColor" */
    fill={fill}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M12 21h-7a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v8" />
    <path d="M3 10h18" />
    <path d="M10 3v18" />
    <path d="M19 22v-6" />
    <path d="M22 19l-3 -3l-3 3" />
  </svg>
);

export const IconProgress = ({
  size,
  width,
  height,
  fill = "none",
  ...props
}: IconSvgProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || width}
    height={size || height}
    viewBox="0 0 24 24"
    /* fill="currentColor" */
    fill={fill}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M10 20.777a8.942 8.942 0 0 1 -2.48 -.969" />
    <path d="M14 3.223a9.003 9.003 0 0 1 0 17.554" />
    <path d="M4.579 17.093a8.961 8.961 0 0 1 -1.227 -2.592" />
    <path d="M3.124 10.5c.16 -.95 .468 -1.85 .9 -2.675l.169 -.305" />
    <path d="M6.907 4.579a8.954 8.954 0 0 1 3.093 -1.356" />
  </svg>
);

export const IconDotsVertical = ({
  size,
  width,
  height,
  fill = "none",
  ...props
}: IconSvgProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || width}
    height={size || height}
    viewBox="0 0 24 24"
    /* fill="currentColor" */
    fill={fill}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
    <path d="M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
    <path d="M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
  </svg>
);

export const IconTrash = ({
  size,
  width,
  height,
  fill = "none",
  ...props
}: IconSvgProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || width}
    height={size || height}
    viewBox="0 0 24 24"
    /* fill="currentColor" */
    fill={fill}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M4 7l16 0" />
    <path d="M10 11l0 6" />
    <path d="M14 11l0 6" />
    <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
    <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
  </svg>
);

export const IconMessageCircle: React.FC<IconSvgProps> = ({
  size,
  width,
  height,
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || width}
    height={size || height}
    fill="none"
    viewBox="0 0 24 24"
    // --------------------
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    // --------------------
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M3 20l1.3 -3.9c-2.324 -3.437 -1.426 -7.872 2.1 -10.374c3.526 -2.501 8.59 -2.296 11.845 .48c3.255 2.777 3.695 7.266 1.029 10.501c-2.666 3.235 -7.615 4.215 -11.574 2.293l-4.7 1" />
  </svg>
);

export const IconPlus: React.FC<IconSvgProps> = ({
  size = 22,
  width,
  height,
  fill = "currentColor",
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || width}
    height={size || height}
    // fill={fill}
    // --------------------
    fill="none"
    stroke={fill}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    // --------------------
    viewBox="0 0 24 24"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M12 5l0 14" />
    <path d="M5 12l14 0" />
  </svg>
);

export const IconCircleCheck: React.FC<IconSvgProps> = ({
  size,
  width,
  height,
  fill = "currentColor",
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || width}
    height={size || height}
    // fill={fill}
    // --------------------
    fill="none"
    stroke={fill}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    // --------------------
    viewBox="0 0 24 24"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
    <path d="M9 12l2 2l4 -4" />
  </svg>
);

export const IconConfetti: React.FC<IconSvgProps> = ({
  size,
  width,
  height,
  fill = "currentColor",
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || width}
    height={size || height}
    // fill={fill}
    // --------------------
    fill="none"
    stroke={fill}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    // --------------------
    viewBox="0 0 24 24"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M4 5h2" />
    <path d="M5 4v2" />
    <path d="M11.5 4l-.5 2" />
    <path d="M18 5h2" />
    <path d="M19 4v2" />
    <path d="M15 9l-1 1" />
    <path d="M18 13l2 -.5" />
    <path d="M18 19h2" />
    <path d="M19 18v2" />
    <path d="M14 16.518l-6.518 -6.518l-4.39 9.58a1 1 0 0 0 1.329 1.329l9.579 -4.39z" />
  </svg>
);

export const IconClinic: React.FC<IconSvgProps> = ({
  size,
  fill = "currentColor",
  ...props
}) => (
  <svg
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    stroke={fill}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M3 21l18 0" />
    <path d="M5 21v-16a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v16" />
    <path d="M9 21v-4a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v4" />
    <path d="M10 9l4 0" />
    <path d="M12 7l0 4" />
  </svg>
);

export const IconChevronLeft = ({ size, ...props }: IconSvgProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || 24}
    height={size || 24}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M15 6l-6 6l6 6" />
  </svg>
);

export const IconChevronRight = ({ size, ...props }: IconSvgProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || 24}
    height={size || 24}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M9 6l6 6l-6 6" />
  </svg>
);

export const IconEye: React.FC<IconSvgProps> = ({
  size,
  fill = "currentColor",
  ...props
}) => (
  <svg
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    stroke={fill}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
    <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" />
  </svg>
);

export const IconEyeOff: React.FC<IconSvgProps> = ({
  size,
  fill = "currentColor",
  ...props
}) => (
  <svg
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    stroke={fill}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M10.585 10.587a2 2 0 0 0 2.829 2.828" />
    <path d="M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87" />
    <path d="M3 3l18 18" />
  </svg>
);

export const IconCarretOpen: React.FC<IconSvgProps> = ({ size, ...props }) => (
  <svg
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g clipPath="url(#clip0_5457_4110)">
      <path
        d="M8 9L12 5L16 9"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 15L12 19L8 15"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_5457_4110">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export const IconCarretClose: React.FC<IconSvgProps> = ({ size, ...props }) => (
  <svg
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g clipPath="url(#clip0_5457_4109)">
      <path
        d="M8 5.5L12 9.5L16 5.5"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 18.5L12 14.5L8 18.5"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_5457_4109">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export const IconStethoscope: React.FC<IconSvgProps> = ({ size, ...props }) => (
  <svg
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M6 4h-1a2 2 0 0 0 -2 2v3.5h0a5.5 5.5 0 0 0 11 0v-3.5a2 2 0 0 0 -2 -2h-1" />
    <path d="M8 15a6 6 0 1 0 12 0v-3" />
    <path d="M11 3v2" />
    <path d="M6 3v2" />
    <path d="M20 10m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
  </svg>
);

export const IconUserPlus: React.FC<IconSvgProps> = ({ size, ...props }) => (
  <svg
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
    <path d="M16 19h6" />
    <path d="M19 16v6" />
    <path d="M6 21v-2a4 4 0 0 1 4 -4h4" />
  </svg>
);

export const IconCheck: React.FC<IconSvgProps> = ({ size, ...props }) => (
  <svg
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M5 12l5 5l10 -10" />
  </svg>
);

export const IconSend2: React.FC<IconSvgProps> = ({ size, ...props }) => (
  <svg
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M4.698 4.034l16.302 7.966l-16.302 7.966a.503 .503 0 0 1 -.546 -.124a.555 .555 0 0 1 -.12 -.568l2.468 -7.274l-2.468 -7.274a.555 .555 0 0 1 .12 -.568a.503 .503 0 0 1 .546 -.124z" />
    <path d="M6.5 12h14.5" />
  </svg>
);

export const IconBuildingPlus: React.FC<IconSvgProps> = ({
  size,
  ...props
}) => (
  <svg
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M3 21h9" />
    <path d="M9 8h1" />
    <path d="M9 12h1" />
    <path d="M9 16h1" />
    <path d="M14 8h1" />
    <path d="M14 12h1" />
    <path d="M5 21v-16c0 -.53 .211 -1.039 .586 -1.414c.375 -.375 .884 -.586 1.414 -.586h10c.53 0 1.039 .211 1.414 .586c.375 .375 .586 .884 .586 1.414v7" />
    <path d="M16 19h6" />
    <path d="M19 16v6" />
  </svg>
);

export const IconBrandFacebook: React.FC<IconSvgProps> = ({
  size,
  ...props
}) => (
  <svg
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M7 10v4h3v7h4v-7h3l1 -4h-4v-2a1 1 0 0 1 1 -1h3v-4h-3a5 5 0 0 0 -5 5v2h-3" />
  </svg>
);

export const IconBrandGoogle: React.FC<IconSvgProps> = ({ size, ...props }) => (
  <svg
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M20.945 11a9 9 0 1 1 -3.284 -5.997l-2.655 2.392a5.5 5.5 0 1 0 2.119 6.605h-4.125v-3h7.945z" />
  </svg>
);

export const IconBan: React.FC<IconSvgProps> = ({ size, ...props }) => (
  <svg
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
    <path d="M5.7 5.7l12.6 12.6" />
  </svg>
);

export const IconPencil: React.FC<IconSvgProps> = ({ size, ...props }) => (
  <svg
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
    <path d="M13.5 6.5l4 4" />
  </svg>
);

export const IconCirclePlus: React.FC<IconSvgProps> = ({ size, ...props }) => (
  <svg
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
    <path d="M9 12h6" />
    <path d="M12 9v6" />
  </svg>
);

export const IconCircleMinus: React.FC<IconSvgProps> = ({ size, ...props }) => (
  <svg
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
    <path d="M9 12l6 0" />
  </svg>
);

export const IconCheckFilled: React.FC<IconSvgProps> = ({ size, ...props }) => (
  <svg
    width={size || 100}
    height={size || 100}
    viewBox="0 0 100 100"
    fill="none"
    stroke="currentColor"
    strokeWidth="0"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M50 2.5C76.2335 2.5 97.5 23.7665 97.5 50C97.5 76.2335 76.2335 97.5 50 97.5C23.7665 97.5 2.5 76.2335 2.5 50C2.5 23.7665 23.7665 2.5 50 2.5Z"
      stroke="#006CE6"
      strokeOpacity="0.4"
      strokeWidth="5"
    />
    <g clipPath="url(#clip0_4244_6150)">
      <g clipPath="url(#clip1_4244_6150)">
        <path
          d="M33.5938 50.0001L45.3125 61.7188L68.75 38.2813"
          stroke="#006CE6"
          strokeWidth="7.8125"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </g>
    <defs>
      <clipPath id="clip0_4244_6150">
        <rect
          width="56.25"
          height="56.25"
          fill="white"
          transform="translate(21.875 21.875)"
        />
      </clipPath>
      <clipPath id="clip1_4244_6150">
        <rect
          width="56.25"
          height="56.25"
          fill="white"
          transform="translate(21.875 21.875)"
        />
      </clipPath>
    </defs>
  </svg>
);

export const IconSettingsPlay: React.FC<IconSvgProps> = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13 20.693C12.095 21.321 10.64 20.985 10.325 19.683C10.2611 19.4192 10.1358 19.1742 9.95929 18.968C9.7828 18.7618 9.56011 18.6001 9.30935 18.4963C9.05859 18.3924 8.78683 18.3491 8.51621 18.3701C8.24559 18.3911 7.98375 18.4757 7.752 18.617C6.209 19.557 4.442 17.791 5.382 16.247C5.5231 16.0153 5.60755 15.7537 5.62848 15.4832C5.64942 15.2128 5.60624 14.9412 5.50247 14.6906C5.3987 14.44 5.23726 14.2174 5.03127 14.0409C4.82529 13.8645 4.58056 13.7391 4.317 13.675C2.561 13.249 2.561 10.751 4.317 10.325C4.5808 10.2611 4.82578 10.1358 5.032 9.95929C5.23822 9.7828 5.39985 9.56011 5.50375 9.30935C5.60764 9.05859 5.65085 8.78683 5.62987 8.51621C5.60889 8.24559 5.5243 7.98375 5.383 7.752C4.443 6.209 6.209 4.442 7.753 5.382C8.753 5.99 10.049 5.452 10.325 4.317C10.751 2.561 13.249 2.561 13.675 4.317C13.7389 4.5808 13.8642 4.82578 14.0407 5.032C14.2172 5.23822 14.4399 5.39985 14.6907 5.50375C14.9414 5.60764 15.2132 5.65085 15.4838 5.62987C15.7544 5.60889 16.0162 5.5243 16.248 5.383C17.791 4.443 19.558 6.209 18.618 7.753C18.4769 7.98466 18.3924 8.24634 18.3715 8.51677C18.3506 8.78721 18.3938 9.05877 18.4975 9.30938C18.6013 9.55999 18.7627 9.78258 18.9687 9.95905C19.1747 10.1355 19.4194 10.2609 19.683 10.325C21.175 10.687 21.399 12.544 20.357 13.355M9 12C9 12.7956 9.31607 13.5587 9.87868 14.1213C10.4413 14.6839 11.2044 15 12 15C12.7956 15 13.5587 14.6839 14.1213 14.1213C14.6839 13.5587 15 12.7956 15 12C15 11.2044 14.6839 10.4413 14.1213 9.87868C13.5587 9.31607 12.7956 9 12 9C11.2044 9 10.4413 9.31607 9.87868 9.87868C9.31607 10.4413 9 11.2044 9 12ZM17 22L22 19L17 16V22Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconPaymentOutline: React.FC<IconSvgProps> = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14.8 7.99918C14.6188 7.68494 14.3557 7.42588 14.0386 7.24973C13.7215 7.07358 13.3625 6.98698 13 6.99918H11C10.4696 6.99918 9.96086 7.20989 9.58579 7.58497C9.21071 7.96004 9 8.46875 9 8.99918C9 9.52961 9.21071 10.0383 9.58579 10.4134C9.96086 10.7885 10.4696 10.9992 11 10.9992H13C13.5304 10.9992 14.0391 11.2099 14.4142 11.585C14.7893 11.96 15 12.4687 15 12.9992C15 13.5296 14.7893 14.0383 14.4142 14.4134C14.0391 14.7885 13.5304 14.9992 13 14.9992H11C10.6375 15.0114 10.2785 14.9248 9.96142 14.7486C9.64435 14.5725 9.38115 14.3134 9.2 13.9992M12 6V16M5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21L16 19L14 21L12 19L10 21L8 19L5 21Z"
      stroke="#042D60"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
