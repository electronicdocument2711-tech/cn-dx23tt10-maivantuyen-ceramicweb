export const COOKIE_KEY = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  EXPIRE_TIME: 60 * 60 * 24, //time expire 1 day
};

export const LOCAL_KEY = {
  DASHBOARD_FILTER_KEY: "dashboard-filter-key",
  SELECTED_BRANCH: "selected_branch",
  SELECTED_BRANCHES: "selected_branches",
};

export const REGEX = {
  BRANCH_CODE: /^[\p{L}\p{N}\s.\-_]{3,}$/u,
  BRANCH_NAME: /^[\p{L}\p{N}\s.\-_]{5,}$/u,
  // +84/0xxx-xxx-xxx
  PHONE: /^(?:0|\+84)(?:\d){3}[-. ]?(?:\d){3}[-. ]?(?:\d){3}$/,
  ADDRESS: /^[\p{L}\p{N}\s.\-_,]{5,}$/u,
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  LICENSE_CODE: /^[A-Za-z0-9.-\/]{3,}$/,
  LICENSE_NAME: /^[A-Za-z0-9.-\/\s]{3,}$/,
  DOCUMENT_ID: /^[A-Za-z0-9.-\/]+$/,
  CHAIR_CODE: /^[A-Za-z0-9\s.\/\-_]+$/,
};

export const LICENSE_FILE_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "png",
  "jpg",
  "jpeg",
];

export const MAX_LICENSE_FILE_SIZE = 5 * 1024 * 1024;

