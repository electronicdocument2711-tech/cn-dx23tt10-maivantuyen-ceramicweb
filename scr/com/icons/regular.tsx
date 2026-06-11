import { IconSvgProps } from "@/types/svg";

export const IconGoogleBrand: React.FC<IconSvgProps> = ({
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
    fill={fill}
    viewBox="0 0 24 24"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M12 2a9.96 9.96 0 0 1 6.29 2.226a1 1 0 0 1 .04 1.52l-1.51 1.362a1 1 0 0 1 -1.265 .06a6 6 0 1 0 2.103 6.836l.001 -.004h-3.66a1 1 0 0 1 -.992 -.883l-.007 -.117v-2a1 1 0 0 1 1 -1h6.945a1 1 0 0 1 .994 .89c.04 .367 .061 .737 .061 1.11c0 5.523 -4.477 10 -10 10s-10 -4.477 -10 -10s4.477 -10 10 -10z" />
  </svg>
);

export const IconInfoCircle: React.FC<IconSvgProps> = ({
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
    fill="none"
    stroke={fill}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
    <path d="M12 9h.01" />
    <path d="M11 12h1v4h1" />
  </svg>
);

export const IconHelpCircle: React.FC<IconSvgProps> = ({
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
    fill="none"
    stroke={fill}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
    <path d="M12 17l0 .01" />
    <path d="M12 13.5a1.5 1.5 0 0 1 1 -1.5a2.6 2.6 0 1 0 -3 -4" />
  </svg>
);

export const IconCheck: React.FC<IconSvgProps> = ({
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
    fill="none"
    stroke={fill}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M5 12l5 5l10 -10" />
  </svg>
);

export const IconUncheck: React.FC<IconSvgProps> = ({
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
    fill="none"
    stroke={fill}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M18 6l-12 12" />
    <path d="M6 6l12 12" />
  </svg>
);

export const IconVnd: React.FC<IconSvgProps> = ({
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
    fill="none"
    stroke={fill}
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M6 19h12" />
    <path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
    <path d="M16 16v-12" />
    <path d="M17 5h-4" />
  </svg>
);

export const IconChevronDown: React.FC<IconSvgProps> = ({
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
    fill="none"
    stroke={fill}
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M6 9l6 6l6 -6" />
  </svg>
);

// Dashboard Icon
export const IconHome: React.FC<IconSvgProps> = ({
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
    fill={fill}
    viewBox="0 0 24 24"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M12.707 2.293l9 9c.63 .63 .184 1.707 -.707 1.707h-1v6a3 3 0 0 1 -3 3h-1v-7a3 3 0 0 0 -2.824 -2.995l-.176 -.005h-2a3 3 0 0 0 -3 3v7h-1a3 3 0 0 1 -3 -3v-6h-1c-.89 0 -1.337 -1.077 -.707 -1.707l9 -9a1 1 0 0 1 1.414 0m.293 11.707a1 1 0 0 1 1 1v7h-4v-7a1 1 0 0 1 .883 -.993l.117 -.007z" />
  </svg>
);

export const IconClockPause: React.FC<IconSvgProps> = ({
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
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path
      d="M16.5 22V17C16.5 16.4477 16.9477 16 17.5 16C18.0523 16 18.5 16.4477 18.5 17V22C18.5 22.5523 18.0523 23 17.5 23C16.9477 23 16.5 22.5523 16.5 22ZM20.5 22V17C20.5 16.4477 20.9477 16 21.5 16C22.0523 16 22.5 16.4477 22.5 17V22C22.5 22.5523 22.0523 23 21.5 23C20.9477 23 20.5 22.5523 20.5 22Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12.0811 1.99995C13.8089 2.014 15.5036 2.47583 17 3.3398C18.5201 4.21744 19.7825 5.47986 20.6602 6.99995C21.5378 8.52007 22 10.2447 22 12C22 12.8501 21.8902 13.6928 21.6787 14.5087C21.6196 14.5046 21.5601 14.5 21.5 14.5C20.6805 14.5 19.9559 14.8965 19.5 15.5058C19.0441 14.8965 18.3195 14.5 17.5 14.5C16.1193 14.5 15 15.6193 15 17V21.538C14.0331 21.8421 13.022 22 12 22C10.2446 21.9999 8.52018 21.5378 7 20.6601C5.47983 19.7824 4.2175 18.5202 3.33984 17C2.46219 15.4797 1.99996 13.7553 2 12L2.00488 11.6757C2.06092 9.9488 2.56381 8.26588 3.46387 6.79097C4.36392 5.31609 5.63048 4.09927 7.14062 3.25972C8.65086 2.42015 10.3532 1.98591 12.0811 1.99995ZM12 5.99995C11.7348 5.99995 11.4805 6.10539 11.293 6.29292C11.1054 6.48046 11 6.73474 11 6.99995V12.0224L11.0029 12.0761L11.0234 12.2109L11.0283 12.2363C11.0421 12.2927 11.0606 12.3482 11.084 12.4013L11.124 12.4834L11.1641 12.5478L13.168 15.5546C13.2408 15.6638 13.3343 15.758 13.4434 15.831C13.5524 15.904 13.6751 15.9547 13.8037 15.9804C13.9325 16.0061 14.0655 16.0069 14.1943 15.9814C14.3231 15.9559 14.4455 15.9048 14.5547 15.832C14.6638 15.7592 14.758 15.6656 14.8311 15.5566C14.904 15.4476 14.9547 15.3249 14.9805 15.1962C15.0062 15.0675 15.0069 14.9344 14.9814 14.8056C14.9559 14.6769 14.9048 14.5545 14.832 14.4453L13 11.6972V6.99995C13 6.75505 12.9098 6.51892 12.7471 6.33589C12.5843 6.1529 12.3604 6.03548 12.1172 6.00679L12 5.99995Z"
      fill={fill}
    />
  </svg>
);

export const IconCalendarWeek: React.FC<IconSvgProps> = ({
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
    fill={fill}
    viewBox="0 0 24 24"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M16 2c.183 0 .355 .05 .502 .135l.033 .02c.28 .177 .465 .49 .465 .845v1h1a3 3 0 0 1 2.995 2.824l.005 .176v12a3 3 0 0 1 -2.824 2.995l-.176 .005h-12a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-12a3 3 0 0 1 2.824 -2.995l.176 -.005h1v-1a1 1 0 0 1 .514 -.874l.093 -.046l.066 -.025l.1 -.029l.107 -.019l.12 -.007q .083 0 .161 .013l.122 .029l.04 .012l.06 .023c.328 .135 .568 .44 .61 .806l.007 .117v1h6v-1a1 1 0 0 1 1 -1m3 7h-14v9.625c0 .705 .386 1.286 .883 1.366l.117 .009h12c.513 0 .936 -.53 .993 -1.215l.007 -.16z" />
    <path d="M9.015 13a1 1 0 0 1 -1 1a1.001 1.001 0 1 1 -.005 -2c.557 0 1.005 .448 1.005 1" />
    <path d="M13.015 13a1 1 0 0 1 -1 1a1.001 1.001 0 1 1 -.005 -2c.557 0 1.005 .448 1.005 1" />
    <path d="M17.02 13a1 1 0 0 1 -1 1a1.001 1.001 0 1 1 -.005 -2c.557 0 1.005 .448 1.005 1" />
    <path d="M12.02 15a1 1 0 0 1 0 2a1.001 1.001 0 1 1 -.005 -2z" />
    <path d="M9.015 16a1 1 0 0 1 -1 1a1.001 1.001 0 1 1 -.005 -2c.557 0 1.005 .448 1.005 1" />
  </svg>
);

export const IconStar: React.FC<IconSvgProps> = ({
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
    fill={fill}
    viewBox="0 0 24 24"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M8.243 7.34l-6.38 .925l-.113 .023a1 1 0 0 0 -.44 1.684l4.622 4.499l-1.09 6.355l-.013 .11a1 1 0 0 0 1.464 .944l5.706 -3l5.693 3l.1 .046a1 1 0 0 0 1.352 -1.1l-1.091 -6.355l4.624 -4.5l.078 -.085a1 1 0 0 0 -.633 -1.62l-6.38 -.926l-2.852 -5.78a1 1 0 0 0 -1.794 0l-2.853 5.78z" />
  </svg>
);

export const IconHeadset: React.FC<IconSvgProps> = ({
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
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      d="M4 14V11C4 8.87827 4.84285 6.84344 6.34315 5.34315C7.84344 3.84285 9.87827 3 12 3C14.1217 3 16.1566 3.84285 17.6569 5.34315C19.1571 6.84344 20 8.87827 20 11V14"
      stroke={fill}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18 19C18 20.657 15.314 22 12 22"
      stroke={fill}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 14C4 13.4696 4.21071 12.9609 4.58579 12.5858C4.96086 12.2107 5.46957 12 6 12H7C7.53043 12 8.03914 12.2107 8.41421 12.5858C8.78929 12.9609 9 13.4696 9 14V17C9 17.5304 8.78929 18.0391 8.41421 18.4142C8.03914 18.7893 7.53043 19 7 19H6C5.46957 19 4.96086 18.7893 4.58579 18.4142C4.21071 18.0391 4 17.5304 4 17V14Z"
      fill={fill}
      stroke={fill}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15 14C15 13.4696 15.2107 12.9609 15.5858 12.5858C15.9609 12.2107 16.4696 12 17 12H18C18.5304 12 19.0391 12.2107 19.4142 12.5858C19.7893 12.9609 20 13.4696 20 14V17C20 17.5304 19.7893 18.0391 19.4142 18.4142C19.0391 18.7893 18.5304 19 18 19H17C16.4696 19 15.9609 18.7893 15.5858 18.4142C15.2107 18.0391 15 17.5304 15 17V14Z"
      fill={fill}
      stroke={fill}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconDashboard: React.FC<IconSvgProps> = ({
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
    fill={fill}
    viewBox="0 0 24 24"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M12 2.954a10 10 0 0 1 6.222 17.829a1 1 0 0 1 -.622 .217h-11.2a1 1 0 0 1 -.622 -.217a10 10 0 0 1 6.222 -17.829m4.207 5.839a1 1 0 0 0 -1.414 0l-2.276 2.274a2.003 2.003 0 0 0 -2.514 1.815l-.003 .118a2 2 0 1 0 3.933 -.517l2.274 -2.276a1 1 0 0 0 0 -1.414" />
  </svg>
);

export const IconCoin: React.FC<IconSvgProps> = ({
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
    fill={fill}
    viewBox="0 0 24 24"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M17 3.34a10 10 0 1 1 -15 8.66l.005 -.324a10 10 0 0 1 14.995 -8.336zm-5 2.66a1 1 0 0 0 -1 1a3 3 0 1 0 0 6v2a1.024 1.024 0 0 1 -.866 -.398l-.068 -.101a1 1 0 0 0 -1.732 .998a3 3 0 0 0 2.505 1.5h.161a1 1 0 0 0 .883 .994l.117 .007a1 1 0 0 0 1 -1l.176 -.005a3 3 0 0 0 -.176 -5.995v-2c.358 -.012 .671 .14 .866 .398l.068 .101a1 1 0 0 0 1.732 -.998a3 3 0 0 0 -2.505 -1.501h-.161a1 1 0 0 0 -1 -1zm1 7a1 1 0 0 1 0 2v-2zm-2 -4v2a1 1 0 0 1 0 -2z" />
  </svg>
);

export const IconReport: React.FC<IconSvgProps> = ({
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
    fill={fill}
    viewBox="0 0 24 24"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M12 2l.117 .007a1 1 0 0 1 .876 .876l.007 .117v4l.005 .15a2 2 0 0 0 1.838 1.844l.157 .006h4l.117 .007a1 1 0 0 1 .876 .876l.007 .117v9a3 3 0 0 1 -2.824 2.995l-.176 .005h-10a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-14a3 3 0 0 1 2.824 -2.995l.176 -.005zm-3 10a1 1 0 0 0 -1 1v5a1 1 0 0 0 2 0v-5a1 1 0 0 0 -1 -1m3 4a1 1 0 0 0 -1 1v1a1 1 0 0 0 2 0v-1a1 1 0 0 0 -1 -1m3 -2a1 1 0 0 0 -1 1v3a1 1 0 0 0 2 0v-3a1 1 0 0 0 -1 -1" />
    <path d="M19 7h-4l-.001 -4.001z" />
  </svg>
);

export const IconBriefcase: React.FC<IconSvgProps> = ({
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
    fill={fill}
    viewBox="0 0 24 24"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M22 13.478v4.522a3 3 0 0 1 -3 3h-14a3 3 0 0 1 -3 -3v-4.522l.553 .277a20.999 20.999 0 0 0 18.897 -.002l.55 -.275zm-8 -11.478a3 3 0 0 1 3 3v1h2a3 3 0 0 1 3 3v2.242l-1.447 .724a19.002 19.002 0 0 1 -16.726 .186l-.647 -.32l-1.18 -.59v-2.242a3 3 0 0 1 3 -3h2v-1a3 3 0 0 1 3 -3h4zm-2 8a1 1 0 0 0 -1 1a1 1 0 1 0 2 .01c0 -.562 -.448 -1.01 -1 -1.01zm2 -6h-4a1 1 0 0 0 -1 1v1h6v-1a1 1 0 0 0 -1 -1z" />
  </svg>
);

export const IconDiamond: React.FC<IconSvgProps> = ({
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
    fill={fill}
    viewBox="0 0 24 24"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M18 4a1 1 0 0 1 .783 .378l.074 .108l3 5a1 1 0 0 1 -.032 1.078l-.08 .103l-8.53 9.533a1.7 1.7 0 0 1 -1.215 .51c-.4 0 -.785 -.14 -1.11 -.417l-.135 -.126l-8.5 -9.5a1 1 0 0 1 -.172 -1.067l.06 -.115l3.013 -5.022l.064 -.09a.982 .982 0 0 1 .155 -.154l.089 -.064l.088 -.05l.05 -.023l.06 -.025l.109 -.032l.112 -.02l.117 -.005h12zm-8.886 3.943a1 1 0 0 0 -1.371 .343l-.6 1l-.06 .116a1 1 0 0 0 .177 1.07l2 2.2l.09 .088a1 1 0 0 0 1.323 -.02l.087 -.09a1 1 0 0 0 -.02 -1.323l-1.501 -1.65l.218 -.363l.055 -.103a1 1 0 0 0 -.398 -1.268z" />
  </svg>
);

export const IconUserfill: React.FC<IconSvgProps> = ({
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
    fill={fill}
    viewBox="0 0 24 24"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M12 2a5 5 0 1 1 -5 5l.005 -.217a5 5 0 0 1 4.995 -4.783z" />
    <path d="M14 14a5 5 0 0 1 5 5v1a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-1a5 5 0 0 1 5 -5h4z" />
  </svg>
);

export const IconUser: React.FC<IconSvgProps> = ({
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
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
    <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
  </svg>
);

export const IconDental: React.FC<IconSvgProps> = ({
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
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M12 5.5c-1.074 -.586 -2.583 -1.5 -4 -1.5c-2.1 0 -4 1.247 -4 5c0 4.899 1.056 8.41 2.671 10.537c.573 .756 1.97 .521 2.567 -.236c.398 -.505 .819 -1.439 1.262 -2.801c.292 -.771 .892 -1.504 1.5 -1.5c.602 0 1.21 .737 1.5 1.5c.443 1.362 .864 2.295 1.262 2.8c.597 .759 2 .993 2.567 .237c1.615 -2.127 2.671 -5.637 2.671 -10.537c0 -3.74 -1.908 -5 -4 -5c-1.423 0 -2.92 .911 -4 1.5z" />
    <path d="M12 5.5l3 1.5" />
  </svg>
);

export const IconSearch: React.FC<IconSvgProps> = ({
  size,
  fill = "currentColor",
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || 24}
    height={size || 24}
    fill="none"
    viewBox="0 0 24 24"
    stroke={fill}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
    <path d="M21 21l-6 -6" />
  </svg>
);

export const IconUserCircle: React.FC<IconSvgProps> = ({
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
    <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
    <path d="M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
    <path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855" />
  </svg>
);

export const IconBelt: React.FC<IconSvgProps> = ({
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
    fill={fill}
    viewBox="0 0 24 24"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M14.235 19c.865 0 1.322 1.024 .745 1.668a3.992 3.992 0 0 1 -2.98 1.332a3.992 3.992 0 0 1 -2.98 -1.332c-.552 -.616 -.158 -1.579 .634 -1.661l.11 -.006h4.471z" />
    <path d="M12 2c1.358 0 2.506 .903 2.875 2.141l.046 .171l.008 .043a8.013 8.013 0 0 1 4.024 6.069l.028 .287l.019 .289v2.931l.021 .136a3 3 0 0 0 1.143 1.847l.167 .117l.162 .099c.86 .487 .56 1.766 -.377 1.864l-.116 .006h-16c-1.028 0 -1.387 -1.364 -.493 -1.87a3 3 0 0 0 1.472 -2.063l.021 -.143l.001 -2.97a8 8 0 0 1 3.821 -6.454l.248 -.146l.01 -.043a3.003 3.003 0 0 1 2.562 -2.29l.182 -.017l.176 -.004z" />
  </svg>
);

export const IconMap: React.FC<IconSvgProps> = ({
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
    viewBox="0 0 24 24"
    fill="none"
    stroke={fill}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M12 18.5l-3 -1.5l-6 3v-13l6 -3l6 3l6 -3v7.5" />
    <path d="M9 4v13" />
    <path d="M15 7v5.5" />
    <path d="M21.121 20.121a3 3 0 1 0 -4.242 0c.418 .419 1.125 1.045 2.121 1.879c1.051 -.89 1.759 -1.516 2.121 -1.879z" />
    <path d="M19 18v.01" />
  </svg>
);

export const IconLogo: React.FC<IconSvgProps> = ({ size, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={(parseInt(String(size)) * 128) / 37 || 128}
    height={size || 37}
    viewBox="0 0 128 37"
    fill="none"
    {...props}
  >
    <path
      d="M6.63172 7.85411C8.59023 7.85411 10.3084 8.23691 11.7862 9.00251C13.2817 9.76811 14.4301 10.8631 15.2313 12.2875C16.0504 13.694 16.4599 15.332 16.4599 17.2015C16.4599 19.071 16.0504 20.709 15.2313 22.1156C14.4301 23.5044 13.2817 24.5815 11.7862 25.3471C10.3084 26.1127 8.59023 26.4955 6.63172 26.4955H0.115234V7.85411H6.63172ZM6.49818 23.3174C8.45669 23.3174 9.97008 22.7833 11.0384 21.715C12.1066 20.6467 12.6408 19.1422 12.6408 17.2015C12.6408 15.2608 12.1066 13.7474 11.0384 12.6614C9.97008 11.5575 8.45669 11.0055 6.49818 11.0055H3.8542V23.3174H6.49818Z"
      fill="#1A4381"
    />
    <path
      d="M33.0127 18.7772C33.0127 19.3114 32.9771 19.7921 32.9059 20.2194H22.0896C22.1786 21.2877 22.5525 22.1245 23.2113 22.7299C23.8701 23.3352 24.6802 23.6379 25.6416 23.6379C27.0304 23.6379 28.0185 23.0414 28.6061 21.8485H32.6388C32.2115 23.2729 31.3925 24.448 30.1818 25.3738C28.9711 26.2819 27.4844 26.7359 25.7217 26.7359C24.2974 26.7359 23.0154 26.4243 21.8759 25.8012C20.7542 25.1602 19.8729 24.2611 19.232 23.1038C18.6088 21.9465 18.2972 20.6111 18.2972 19.0977C18.2972 17.5665 18.6088 16.2223 19.232 15.065C19.8551 13.9077 20.7275 13.0174 21.8492 12.3943C22.9709 11.7711 24.2618 11.4595 25.7217 11.4595C27.1283 11.4595 28.3835 11.7622 29.4874 12.3676C30.6091 12.9729 31.4726 13.8365 32.078 14.9581C32.7011 16.062 33.0127 17.3351 33.0127 18.7772ZM29.1402 17.709C29.1224 16.7475 28.7752 15.9819 28.0986 15.4122C27.4221 14.8246 26.5942 14.5308 25.6149 14.5308C24.6891 14.5308 23.9057 14.8157 23.2647 15.3855C22.6415 15.9374 22.2587 16.7119 22.1163 17.709H29.1402Z"
      fill="#1A4381"
    />
    <path
      d="M43.6738 11.4863C45.4364 11.4863 46.8608 12.0471 47.9469 13.1688C49.033 14.2727 49.576 15.8217 49.576 17.8158V26.4955H45.837V18.3232C45.837 17.1481 45.5433 16.249 44.9557 15.6258C44.3682 14.9849 43.567 14.6644 42.5521 14.6644C41.5194 14.6644 40.7004 14.9849 40.0951 15.6258C39.5075 16.249 39.2137 17.1481 39.2137 18.3232V26.4955H35.4748V11.6999H39.2137V13.5427C39.7123 12.9017 40.3443 12.4032 41.1099 12.0471C41.8933 11.6732 42.7479 11.4863 43.6738 11.4863Z"
      fill="#1A4381"
    />
    <path
      d="M57.4848 14.7712V21.9287C57.4848 22.4272 57.6005 22.7922 57.832 23.0236C58.0813 23.2373 58.4908 23.3441 59.0605 23.3441H60.7964V26.4955H58.4462C55.2948 26.4955 53.7191 24.9643 53.7191 21.9019V14.7712H51.9565V11.6999H53.7191V8.04106H57.4848V11.6999H60.7964V14.7712H57.4848Z"
      fill="#1A4381"
    />
    <path
      d="M62.5243 19.0443C62.5243 17.5487 62.818 16.2223 63.4056 15.065C64.0109 13.9077 64.8211 13.0174 65.8359 12.3943C66.8686 11.7711 68.017 11.4595 69.2811 11.4595C70.385 11.4595 71.3464 11.6821 72.1654 12.1272C73.0023 12.5723 73.6699 13.1332 74.1685 13.8098V11.6999H77.9341V26.4955H74.1685V24.3323C73.6877 25.0267 73.0201 25.6053 72.1654 26.0682C71.3286 26.5133 70.3583 26.7359 69.2544 26.7359C68.0081 26.7359 66.8686 26.4154 65.8359 25.7744C64.8211 25.1335 64.0109 24.2343 63.4056 23.077C62.818 21.9019 62.5243 20.5577 62.5243 19.0443ZM74.1685 19.0977C74.1685 18.1897 73.9904 17.4152 73.6343 16.7742C73.2782 16.1154 72.7975 15.6169 72.1922 15.2786C71.5868 14.9225 70.9369 14.7445 70.2426 14.7445C69.5482 14.7445 68.9072 14.9136 68.3197 15.2519C67.7321 15.5902 67.2514 16.0887 66.8775 16.7475C66.5214 17.3885 66.3433 18.1541 66.3433 19.0443C66.3433 19.9345 66.5214 20.7179 66.8775 21.3945C67.2514 22.0533 67.7321 22.5607 68.3197 22.9168C68.925 23.2729 69.566 23.4509 70.2426 23.4509C70.9369 23.4509 71.5868 23.2818 72.1922 22.9435C72.7975 22.5874 73.2782 22.0889 73.6343 21.4479C73.9904 20.7892 74.1685 20.0058 74.1685 19.0977Z"
      fill="#1A4381"
    />
    <path
      d="M85.0578 6.73242V26.4955H81.3188V6.73242H85.0578Z"
      fill="#1A4381"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M127.257 3.57617L109.172 18.9055C108.229 19.7052 106.846 19.7086 105.899 18.9135L94.1555 9.05807H100.58C101.881 9.05807 103.14 9.516 104.137 10.3516L106.795 12.5792C107.227 12.9411 107.857 12.9382 108.286 12.5723L117.267 4.90289C118.27 4.04661 119.545 3.57617 120.863 3.57617H127.257Z"
      fill="#006CE6"
    />
    <path
      d="M101.18 18.2099C101.351 18.0647 101.602 18.0637 101.774 18.208L105.451 21.2939C105.67 21.4773 105.672 21.8137 105.455 21.999L97.2734 28.9853C96.2709 29.8414 94.996 30.3123 93.6777 30.3125H86.9023L101.18 18.2099Z"
      fill="#006CE6"
    />
    <path
      d="M113.203 18.2421C113.376 18.0957 113.63 18.0964 113.802 18.2441L123.43 26.5107H116.703C115.354 26.5107 114.052 26.019 113.04 25.1269L109.539 22.039C109.328 21.8528 109.332 21.5226 109.547 21.3408L113.203 18.2421Z"
      fill="#006CE6"
    />
  </svg>
);

export const IconLogoX: React.FC<IconSvgProps> = ({ size, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={(parseInt(String(size)) * 64) / 64 || 64}
    height={size || 64}
    viewBox="86 3 42 28"
    fill="none"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M127.257 3.57617L109.172 18.9055C108.229 19.7052 106.846 19.7086 105.899 18.9135L94.1555 9.05807H100.58C101.881 9.05807 103.14 9.516 104.137 10.3516L106.795 12.5792C107.227 12.9411 107.857 12.9382 108.286 12.5723L117.267 4.90289C118.27 4.04661 119.545 3.57617 120.863 3.57617H127.257Z"
      fill="#006CE6"
    />
    <path
      d="M101.18 18.2099C101.351 18.0647 101.602 18.0637 101.774 18.208L105.451 21.2939C105.67 21.4773 105.672 21.8137 105.455 21.999L97.2734 28.9853C96.2709 29.8414 94.996 30.3123 93.6777 30.3125H86.9023L101.18 18.2099Z"
      fill="#006CE6"
    />
    <path
      d="M113.203 18.2421C113.376 18.0957 113.63 18.0964 113.802 18.2441L123.43 26.5107H116.703C115.354 26.5107 114.052 26.019 113.04 25.1269L109.539 22.039C109.328 21.8528 109.332 21.5226 109.547 21.3408L113.203 18.2421Z"
      fill="#006CE6"
    />
  </svg>
);

export const IconDiscountPercent: React.FC<IconSvgProps> = ({
  size,
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={(parseInt(String(size)) * 16) / 14 || 16}
    height={size || 14}
    viewBox="0 0 16 14"
    fill="none"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.6518 0.448308C8.80261 -0.0991203 6.59004 -0.198549 2.76147 0.450594C2.01404 0.576308 1.32833 0.871166 0.820898 1.35345C0.556572 1.60318 0.347111 1.90519 0.205841 2.24026C0.0645702 2.57534 -0.00541828 2.93614 0.000327143 3.29974V4.62888C0.000327143 4.85745 0.136327 5.06317 0.34547 5.15345C0.653014 5.28601 0.914999 5.50574 1.09907 5.78551C1.28314 6.06528 1.38123 6.39284 1.38123 6.72774C1.38123 7.06263 1.28314 7.39019 1.09907 7.66996C0.914999 7.94974 0.653014 8.16947 0.34547 8.30202C0.242827 8.34629 0.15542 8.41969 0.0940727 8.51313C0.0327254 8.60657 0.000131656 8.71596 0.000327143 8.82774V10.1569C0.000327143 11.7832 1.24261 12.8083 2.78318 13.0083C6.63233 13.5112 8.80375 13.5066 12.646 13.0083C13.43 12.9077 14.126 12.6095 14.6323 12.1135C15.1455 11.6106 15.4289 10.934 15.4289 10.1569V8.82659C15.4289 8.71501 15.3962 8.60587 15.3348 8.51265C15.2735 8.41943 15.1862 8.34621 15.0838 8.30202C14.7762 8.16947 14.5142 7.94974 14.3302 7.66996C14.1461 7.39019 14.048 7.06263 14.048 6.72774C14.048 6.39284 14.1461 6.06528 14.3302 5.78551C14.5142 5.50574 14.7762 5.28601 15.0838 5.15345C15.1862 5.10926 15.2735 5.03604 15.3348 4.94282C15.3962 4.8496 15.4289 4.74047 15.4289 4.62888V3.29974C15.4289 1.65859 14.0895 0.651737 12.6518 0.448308Z"
      fill="#8FBFFA"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.64014 5.56169C5.79015 5.56649 5.9396 5.54108 6.0796 5.48698C6.2196 5.43288 6.34731 5.3512 6.45512 5.24677C6.56293 5.14235 6.64865 5.01732 6.7072 4.87912C6.76574 4.74092 6.79591 4.59236 6.79591 4.44227C6.79591 4.29217 6.76574 4.14361 6.7072 4.00541C6.64865 3.86721 6.56293 3.74218 6.45512 3.63776C6.34731 3.53334 6.2196 3.45165 6.0796 3.39755C5.9396 3.34345 5.79015 3.31804 5.64014 3.32284C5.34309 3.32284 5.05822 3.44084 4.84818 3.65088C4.63813 3.86092 4.52014 4.14579 4.52014 4.44284C4.52014 4.73988 4.63813 5.02476 4.84818 5.2348C5.05822 5.44484 5.34309 5.56169 5.64014 5.56169ZM9.78413 10.156C9.93532 10.1628 10.0863 10.1389 10.228 10.0858C10.3697 10.0326 10.4992 9.95134 10.6086 9.84677C10.718 9.7422 10.8051 9.61654 10.8646 9.47739C10.924 9.33823 10.9547 9.18846 10.9547 9.03712C10.9547 8.88578 10.924 8.73601 10.8646 8.59686C10.8051 8.4577 10.718 8.33205 10.6086 8.22748C10.4992 8.12291 10.3697 8.0416 10.228 7.98845C10.0863 7.93531 9.93532 7.91143 9.78413 7.91827C9.49343 7.92756 9.21775 8.04957 9.0154 8.25848C8.81305 8.4674 8.69991 8.74685 8.69991 9.03769C8.69991 9.32854 8.81305 9.60798 9.0154 9.8169C9.21775 10.0258 9.49343 10.1467 9.78413 10.156ZM10.6527 4.55598C10.7718 4.40852 10.8275 4.21978 10.8074 4.03128C10.7874 3.84278 10.6933 3.66996 10.5458 3.55084C10.3984 3.43172 10.2096 3.37605 10.0211 3.39609C9.83265 3.41613 9.65983 3.51023 9.54071 3.65769C7.80356 5.81198 6.68128 6.92055 4.40014 8.79827C4.25885 8.92012 4.17084 9.09241 4.15494 9.27831C4.13904 9.4642 4.19651 9.64894 4.31505 9.79301C4.4336 9.93709 4.60381 10.0291 4.78928 10.0493C4.97476 10.0695 5.16078 10.0163 5.30756 9.90112C7.65499 7.96969 8.84699 6.79369 10.6527 4.55598Z"
      fill="#2859C5"
    />
  </svg>
);

export const IconStethoscopeOff: React.FC<IconSvgProps> = ({ size = 24 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M4.172 4.179a2 2 0 0 0 -1.172 1.821v3.5a5.5 5.5 0 0 0 9.856 3.358m1.144 -2.858v-4a2 2 0 0 0 -2 -2h-1" />
      <path d="M8 15a6 6 0 0 0 10.714 3.712m1.216 -2.798c.046 -.3 .07 -.605 .07 -.914v-3" />
      <path d="M11 3v2" />
      <path d="M18 10a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
      <path d="M3 3l18 18" />
    </svg>
  );
};

export const IconDownload: React.FC<IconSvgProps> = ({ size = 24 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
      <path d="M7 11l5 5l5 -5" />
      <path d="M12 4l0 12" />
    </svg>
  );
};
