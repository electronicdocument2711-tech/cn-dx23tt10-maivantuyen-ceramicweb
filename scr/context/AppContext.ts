import React, {
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import rest from "@/lib/rest";
import { get } from "@/lib/cookie";
import useLocal from "@/hook/useLocal";
import { BusinessInfo } from "@/types/define.d";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

const STAFF_PAGE_SIZE = 100;
const DOCTOR_ROLE_ID = 2;
const NURSE_ROLE_ID = 3;
const ASSISTANT_ROLE_ID = 4;

interface BusinessRole {
  id: number;
  name?: string;
}

export interface Staff {
  id: string | number;
  name: string;
  business_role?: BusinessRole | null;
  users?: { id: string | number; name: string }[];
}

export interface Branch {
  BranchId: string;
  BranchCode: string;
  Name: string;
}

interface Limitation {
  doctor: string;
  branch: string;
  storage: string;
  photo_by_month: string;
}

interface AppContextTypes {
  authStatus: AuthStatus;
  triggerRefresh: number;
  onTriggerBootstrap: () => void;
  staffs: Staff[];
  doctors: Staff[];
  nurses: Staff[];
  assistants: Staff[];
  staffsLoading: boolean;
  staffsError: string | null;
  me: any;
  setMe: (me: any) => void;
  setAuthStatus: (status: AuthStatus) => void;
  fetchStaffs: (forceRefresh?: boolean) => Promise<Staff[]>;
  branches: Branch[];
  setBranches: (branches: Branch[]) => void;
  branch: Branch | null;
  setBranch: (branch: Branch | null) => void;
  business: BusinessInfo | null;
  setBusiness: (business: BusinessInfo | null) => void;
  limitation: Limitation;
  setLimitation: (limitation: Limitation) => void;
}

export type AppContextValue = AppContextTypes;

const AppContext = React.createContext<AppContextTypes | undefined>(undefined);

export const AppContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [me, setMe] = useState(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
  const [triggerRefresh, setTriggerRefreshState] = useState(0);
  const [staffs, setStaffs] = useState<Staff[]>([]);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [branch, setBranch] = useLocal<Branch | null>("current-branch", null);

  const [staffsLoading, setStaffsLoading] = useState(false);
  const [staffsError, setStaffsError] = useState<string | null>(null);
  const staffsLoadedRef = useRef(false);
  const staffsPromiseRef = useRef<Promise<Staff[]> | null>(null);
  const staffsRef = useRef<Staff[]>([]);
  const staffsAuthFailedRef = useRef(false);

  const [limitation, setLimitation] = useState<Limitation>(undefined as any);

  const [business, setBusiness] = useLocal<BusinessInfo | null>(
    "business-info",
    null,
  );
  const businessLoadedRef = useRef(false);

  const doctors = useMemo(
    () =>
      staffs.filter(
        (staff) => Number(staff?.business_role?.id) === DOCTOR_ROLE_ID,
      ),
    [staffs],
  );
  const nurses = useMemo(
    () =>
      staffs.filter(
        (staff) => Number(staff?.business_role?.id) === NURSE_ROLE_ID,
      ),
    [staffs],
  );
  const assistants = useMemo(
    () =>
      staffs.filter(
        (staff) => Number(staff?.business_role?.id) === ASSISTANT_ROLE_ID,
      ),
    [staffs],
  );

  const fetchStaffs = useCallback(async (forceRefresh: boolean = false) => {
    if (forceRefresh) {
      staffsAuthFailedRef.current = false;
    }

    if (!forceRefresh && staffsAuthFailedRef.current) {
      return staffsRef.current;
    }

    if (!forceRefresh && staffsLoadedRef.current) {
      return staffsRef.current;
    }
    // If there's an ongoing fetch,
    // return the same promise to avoid duplicate requests
    if (!forceRefresh && staffsPromiseRef.current) {
      return staffsPromiseRef.current;
    }

    const token = await get("access_token");

    if (!token && !forceRefresh) {
      staffsAuthFailedRef.current = true;
      return staffsRef.current;
    }

    const requestPromise = (async () => {
      setStaffsLoading(true);
      setStaffsError(null);

      try {
        let page = 1;
        let pageCount = 1;
        const nextStaffs: Staff[] = [];

        do {
          const response = await rest.get("/v2/doctor", {
            params: {
              page,
              pageSize: STAFF_PAGE_SIZE,
              roles: [2, 3, 4],
              active: 1,
            },
          });

          nextStaffs.push(...(response?.data?.data || []));
          pageCount = Number(response?.data?.meta?.pagination?.pageCount || 1);
          page += 1;
        } while (page <= pageCount);

        setStaffs(nextStaffs);
        staffsRef.current = nextStaffs;
        staffsLoadedRef.current = true;
        staffsAuthFailedRef.current = false;
        return nextStaffs;
      } catch (error: any) {
        const status = Number(error?.response?.status || 0);

        if (status === 401 || status === 403) {
          staffsAuthFailedRef.current = true;
        }

        const message = error?.message || "Đã có lỗi xảy ra";
        setStaffsError(message);
        return [];
      } finally {
        setStaffsLoading(false);
        staffsPromiseRef.current = null;
      }
    })();

    staffsPromiseRef.current = requestPromise;
    return requestPromise;
  }, []);

  return React.createElement(
    AppContext.Provider,
    {
      value: {
        me,
        setMe,
        authStatus,
        staffs,
        doctors,
        nurses,
        triggerRefresh,
        assistants,
        staffsLoading,
        staffsError,
        setAuthStatus,
        fetchStaffs,
        branches,
        setBranches,
        branch,
        setBranch,
        business,
        onTriggerBootstrap: () => setTriggerRefreshState((prev) => prev + 1),
        setBusiness: (b: BusinessInfo | null) => {
          if (b === null) businessLoadedRef.current = false;
          setBusiness(b);
        },
        limitation,
        setLimitation,
      },
    },
    children,
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);

  if (!context)
    throw new Error("useAppContext must be used within an AppContextProvider");

  return context;
};

export default AppContext;
