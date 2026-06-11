import { useEffect, useState } from "react";
import rest from "../lib/rest";
import { WidgetEntry, WidgetMap } from "../types/widget";
import { useUser } from "../context";

export function useWidgets() {
  const { user } = useUser();
  const [widgets, setWidgets] = useState<WidgetMap>({});
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const normalizeWidgets = (widgets: WidgetEntry[]): WidgetMap => {
    if (!Array.isArray(widgets) || widgets.length === 0) return {};
    return widgets.reduce((acc, widget) => {
      acc[widget.name as keyof WidgetMap] = widget.data;
      return acc;
    }, {} as WidgetMap);
  };

  const fetchWidgets = async () => {
    setLoading(true);
    setError(null);
    try {
      //test with default data, props require not null (BE user-data props return null)
      const data = {
        CurrentWorkProfilePositionId: user?.org_work_profiles?.[0]
          ?.WorkProfilePositionId
          ? user?.org_work_profiles?.[0]?.WorkProfilePositionId
          : "448",
        CurrentStaffId: user?.UserId ? user?.UserId : "8",
        CurrentBranchId: user?.org_work_profiles?.[0]?.org?.BranchId
          ? user?.org_work_profiles?.[0]?.org?.BranchId
          : "1",
      };

      const res = await rest.post(`/widgets`, data);
      if (!res.data) {
        throw new Error("widget data null");
      }

      setWidgets(normalizeWidgets(res.data));
    } catch (error) {
      setError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWidgets();
  }, []);
  return { widgets, isLoading, error, refresh: fetchWidgets };
}
