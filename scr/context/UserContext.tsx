"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { set } from "@/lib/cookie";
import rest from "@/lib/rest";
import { addToast } from "@heroui/react";
import { User } from "../data";
import { useLocal } from "@/hook";
import { useAppContext } from "./AppContext";
import { removeAccessToken, setAccessToken } from "@/lib/auth";

interface UserContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: ({}: { email: string; password: string }) => Promise<boolean>;
  signUp: ({}: {
    name: string;
    email: string;
    password: string;
  }) => Promise<boolean>;
  getBusiness: ({}: { name: string }) => Promise<boolean>;
  logout: () => void;
  loading: boolean | null;
  setUser: (user: User | null) => void;
}

export const UserContext = createContext({
  user: null,
  isLoggedIn: false,
  loading: null,
} as UserContextType);

export function UserProvider({ children }: { children: ReactNode }) {
  /**
   * @deprecated - Không dùng state này nữa dùng me trong AppContext thay thế đi
   */
  const [user, setUser] = useLocal<User | null>("user-info", null);
  const [loading, setLoading] = useState<boolean | null>(null);
  const { onTriggerBootstrap } = useAppContext();

  const login = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<boolean> => {
    try {
      setLoading(true);
      const params = { email, password };
      const { status, data } = await rest.post("/auth/signin", params);

      if (status !== 200 || !data?.token)
        throw new Error(data?.message || `Login failed, status code ${status}`);

      setAccessToken(data?.token.replace("Bearer ", ""));
      // set user info
      setUser(data?.user);

      return true;
    } catch (err) {
      const description =
        err instanceof Error
          ? err.message
          : "Không thể đăng nhập, vui lòng thử lại";

      addToast({ title: "Thất bại", description, color: "danger" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async ({
    name,
    email,
    password,
  }: {
    name: string;
    email: string;
    password: string;
  }): Promise<boolean> => {
    try {
      setLoading(true);
      const params = { name, email, password };

      const { status, data } = await rest.post("/auth/signup", params);

      if (!(status === 201 || status === 200))
        throw new Error(
          data?.message || `SignUp failed, status code ${status}`,
        );

      console.log("data:", data);

      if (data?.token) {
        setAccessToken(data?.token.replace("Bearer ", ""));
        // set user info
        setUser(data?.user as User);

        set("user_email", data?.user.Email);
      }

      addToast({
        title: "Thành công",
        description: "Đăng ký tài khoản thành công",
        color: "success",
      });

      return true;
    } catch (err) {
      const description =
        err instanceof Error
          ? err.message
          : "Không thể đăng ký, vui lòng thử lại";

      addToast({ title: "Thất bại", description, color: "danger" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getBusiness = async ({ name }: { name: string }): Promise<boolean> => {
    try {
      setLoading(true);
      const userInfoRaw = localStorage.getItem("user-info");

      if (!userInfoRaw) {
        console.log("Không tìm thấy userInfoRaw");
      }

      let userInfo = null;
      if (userInfoRaw) {
        try {
          userInfo = JSON.parse(userInfoRaw);
        } catch (e) {
          console.log("Failed to parse userInfoRaw", e);
          userInfo = null;
        }
      }

      const params = { name, documentId: userInfo.info.documentId };

      const { status, data } = await rest.post("/auth/signup/clinic", params);

      if (!(status === 200 || status === 201))
        throw new Error(
          data?.message || `Tạo phòng khám thất bại, status code ${status}`,
        );

      if (data?.token) {
        // set User info
        setUser(data?.user as User);
      }

      console.log(
        "user email, user name, documentId:",
        userInfo.Email,
        userInfo.Name,
        userInfo.info.documentId,
      );

      const verificationResponse = await rest.post("/auth/send-verification", {
        email: userInfo.Email,
        name: userInfo.Name,
        documentId: userInfo.info.documentId,
      });

      console.log("verificationResponse:", verificationResponse);

      addToast({
        title: "Thành công",
        description: "tạo phòng khám thành công",
        color: "success",
      });

      return true;
    } catch (err) {
      const description =
        err instanceof Error
          ? err.message
          : "Không thể đăng ký, vui lòng thử lại";

      addToast({ title: "Thất bại", description, color: "danger" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // setUser(null);
    // remove("access_token");
    removeAccessToken();
    onTriggerBootstrap();
  };

  const isLoggedIn = user !== null && !!user?.UserId;
  const value = {
    user,
    setUser,
    isLoggedIn,
    login,
    signUp,
    getBusiness,
    logout,
    loading,
  };
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }

  const currentProfile = context.user?.org_work_profiles?.[0];
  const workProfilePositionId = currentProfile?.WorkProfilePositionId ?? "448";
  const staffId = context.user?.UserId ?? "8";
  const branchId = currentProfile?.org?.BranchId ?? "1";

  return { ...context, workProfilePositionId, staffId, branchId };
}
