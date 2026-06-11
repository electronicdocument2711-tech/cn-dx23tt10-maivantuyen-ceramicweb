import { IconBrandFacebook, IconBrandGoogle } from "@/com/icons/outline";

export const PROVIDER_META = {
  facebook: {
    icon: <IconBrandFacebook className="h-6 w-6" />,
    label: "Facebook",
  },
  google: {
    icon: <IconBrandGoogle className="h-6 w-6" />,
    label: "Google",
  },
};

export type SocialProvider = keyof typeof PROVIDER_META;
export const SOCIAL_PROVIDERS = Object.keys(PROVIDER_META) as SocialProvider[];
