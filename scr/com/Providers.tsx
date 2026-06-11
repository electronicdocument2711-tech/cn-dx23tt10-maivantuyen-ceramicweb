"use client";

import { AppContextProvider, UserProvider, useAppContext } from "@/context";
import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { useEffect } from "react";
import ConfirmProvider from "./ConfirmProvider";
import rest from "@/lib/rest";
import { prop } from "remeda";
import { useLocal } from "@/hook";
import { LOCAL_KEY } from "@/const/global";
import { get } from "@/lib/cookie";
import { useRouter } from "next/navigation";
import { IconX } from "@tabler/icons-react";
import { LayoutProvider } from "@/context/LayoutContext";
import { addToast } from "@heroui/react";
import { removeAccessToken } from "@/lib/auth";

type ProvidersProps = React.PropsWithChildren & { isFull?: boolean };

// Lấy dữ liệu cần thiết khi app khởi động, ví dụ: thông tin user, cấu hình, dữ liệu chung,...
const AppBootstrap = ({ children }: React.PropsWithChildren) => {
  const {
    fetchStaffs,
    setBranches,
    setBusiness,
    setMe,
    triggerRefresh,
    setBranch,
  } = useAppContext();
  const route = useRouter();

  const [_, setDashboardFilterKey] = useLocal(
    LOCAL_KEY.DASHBOARD_FILTER_KEY,
    "7",
  );
  const [__, setSelectedBranch] = useLocal(LOCAL_KEY.SELECTED_BRANCH, null);
  const [___, setSelectedBranches] = useLocal<string[] | null>(
    LOCAL_KEY.SELECTED_BRANCHES,
    null,
  );

  const fetchBranches = async () => {
    const res = await rest.get("/branch", {
      params: {
        limit: -1,
      },
    });

    setBranches(prop(res, ...["data", "data"]) ?? []);
  };

  const fetchMe = async () => {
    try {
      // CHECK nếu token không hợp lệt thì thôi không làm gì cả
      if (!(await get("access_token"))) {
        setBusiness(null);
        setBranches([]);
        setDashboardFilterKey("7");
        setSelectedBranch(null);
        setSelectedBranches(null);
        setMe(null);
        setBranch(null);
        return;
      }

      const me = await rest.get("/me");
      setMe(me?.data);
      setBusiness(prop(me, ...["data", "user_info", "business"]));
      fetchBranches();
      fetchStaffs(true);

      if (me?.data?.is_owner && !me?.data?.subscription) {
        // take user to upgrade page if they are not subscriber
        route.push("/upgrade");

        addToast({
          title: "Hoàn tất đăng ký",
          description:
            "Chọn gói đăng ký phù hợp để bắt đầu sử dụng DentalX và tận hưởng những tính năng tuyệt vời mà chúng tôi mang lại!",
          color: "primary",
        });
      }
    } catch (error: any) {
      if (error?.status === 401) {
        // remove("access_token");
        removeAccessToken();
        setBusiness(null);
        setBranches([]);
        setDashboardFilterKey("7");
        setSelectedBranch(null);
        setSelectedBranches(null);
        setBranch(null);
        setMe(null);
        route.push("/auth/signin");
      }

      // TODO: làm gì đó nếu lỗi khác xảy ra không phải 401
    }
  };

  useEffect(() => {
    fetchMe();
  }, [triggerRefresh]);

  return <>{children}</>;
};

const Providers: React.FC<ProvidersProps> = ({ children, isFull = true }) => {
  return (
    <HeroUIProvider locale="vi-VN">
      <AppContextProvider>
        <LayoutProvider isFull={isFull}>
          <AppBootstrap>
            <UserProvider>
              <ConfirmProvider>
                <ToastProvider
                  placement="top-right"
                  toastOffset={68}
                  toastProps={{
                    classNames: {
                      base: "rounded-md border border-l-8 shadow-xs rounded-l-sm",
                      title: "text-md",
                      closeButton:
                        "opacity-100 absolute right-1 top-1 text-gray-700 hover:text-gray-900",
                    },
                    closeIcon: <IconX size={20} />,
                  }}
                  regionProps={{ classNames: { base: "z-200" } }}
                />
                {children}
              </ConfirmProvider>
            </UserProvider>
          </AppBootstrap>
        </LayoutProvider>
      </AppContextProvider>
    </HeroUIProvider>
  );
};

export default Providers;
