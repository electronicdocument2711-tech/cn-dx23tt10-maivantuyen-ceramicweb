import { useEffect } from "react";

export const useLeaveGuard = (
  isDirty: boolean,
  message: string = "Dữ liệu chưa lưu. Bạn có chắc muốn rời đi không?",
  bypassPath: string[] = []
) => {
  useEffect(() => {
    // const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    //   if (isDirty) {
    //     e.preventDefault();
    //     e.returnValue = "";
    //   }
    // };

    const handleInternalNavigation = (e: MouseEvent) => {
      if (!isDirty) return;

      const target = (e.target as HTMLElement).closest(
        "a, button, [role='button']"
      );
      if (!target) return;

      const targetHref = (target as HTMLAnchorElement).href;

      if (
        !targetHref ||
        targetHref === window.location.href ||
        targetHref.startsWith(window.location.href + "#") ||
        bypassPath.some((path) => targetHref.includes(path))
      ) {
        return;
      }

      if (targetHref.startsWith(window.location.origin)) {
        const confirmLeave = window.confirm(message);
        if (!confirmLeave) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    // window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleInternalNavigation, true);

    return () => {
      // window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleInternalNavigation, true);
    };
  }, [isDirty, message, bypassPath]);
};
