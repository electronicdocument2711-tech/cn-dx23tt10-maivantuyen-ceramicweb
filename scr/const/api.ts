export const api = {
  page: {
    auth: {
      signup: "/auth/signup",
      social: "/auth/social/",
      clinic: "/auth/signup/clinic",
    },
    home: "/",
  },
  nextApi: {
    signup: "/auth/signup",
    services: `/service`,
    clinic: "/auth/signup/clinic",
  },
  cms: {
    signup: "/api/auth/signup",
    userProfile: `/user-profiles`,
    services: `/pos/services`,
    clinic: "/api/authen",
  },
};

export const MULTIPART_HEADERS = {
  headers: { "Content-Type": "multipart/form-data" },
};
