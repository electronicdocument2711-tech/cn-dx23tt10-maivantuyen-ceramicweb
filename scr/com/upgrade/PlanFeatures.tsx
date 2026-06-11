"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@heroui/react";
import { IconCheck, IconChevronDown } from "@tabler/icons-react";

import cn from "@/lib/cn";
import rest from "@/lib/rest";
import { PRODUCT_NAME_MAPPING } from "@/const";

const PLAN_ORDER = ["Free", "Starter", "Growth", "Chain"] as const;

type PlanCode = (typeof PLAN_ORDER)[number];

interface ProductFeature {
  name: string;
}

interface ProductPricing {
  price: number;
}

interface PlanDictionaryRowMeta {
  label: string;
  order: number;
  group: string;
}

interface PlanDictionary {
  version?: number;
  rowMeta?: Record<string, PlanDictionaryRowMeta>;
}

interface PlanTableRowValue {
  included: boolean;
  display?: string;
  value?: string | number;
  unit?: string;
}

interface PlanTableJson {
  version?: number;
  rows?: Record<string, PlanTableRowValue>;
}

interface MembershipPlan {
  documentId?: string;
  id?: number | string;
  months_per_interval: number;
  name: string;
  product_name?: string;
  price?: number;
  product: {
    name: string;
    description?: string | null;
    features?: string[] | string | null;
    product_features?: ProductFeature[];
    is_popular?: boolean;
    table_json?: PlanTableJson | null;
  };
  product_pricings: ProductPricing[];
}

interface ComparisonRow {
  key: string;
  label: string;
  group: string;
  order: number;
  values: Partial<Record<PlanCode, PlanTableRowValue>>;
}

const PLAN_HEADER_CLASS: Record<PlanCode, string> = {
  Free: "",
  Starter: "border-t-4 border-t-[#0A6AFF] bg-slate-200/70",
  Growth: "",
  Chain: "",
};

const FALLBACK_GROUP = "Khác";
const FALLBACK_ORDER = Number.MAX_SAFE_INTEGER;

const getRawPlanName = (plan: MembershipPlan) =>
  plan.product?.name?.trim() || plan.product_name?.trim() || plan.name.trim();

const getPlanCode = (plan: MembershipPlan): PlanCode | string => {
  const planName = getRawPlanName(plan);

  if (PLAN_ORDER.includes(planName as PlanCode)) {
    return planName;
  }

  const matchedCode = Object.entries(PRODUCT_NAME_MAPPING).find(
    ([, label]) => label === planName,
  )?.[0];

  return matchedCode ?? planName;
};

const humanizeRowKey = (key: string) =>
  key
    .split(".")
    .flatMap((part) => part.split("_"))
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");

const getFallbackLabel = (key: string, rowValue?: PlanTableRowValue) =>
  rowValue?.display?.trim() || humanizeRowKey(key);

const getRowTextValue = (rowValue?: PlanTableRowValue) => {
  if (!rowValue?.included) {
    return null;
  }

  const display = rowValue.display?.trim();

  if (display) {
    return display === "∞" ? "Không giới hạn" : display;
  }

  if (rowValue.value !== undefined && rowValue.value !== null) {
    const value = String(rowValue.value).trim();
    const unit = rowValue.unit?.trim();
    const textValue = unit ? `${value} ${unit}` : value;
    return textValue === "∞" ? "Không giới hạn" : textValue;
  }

  return null;
};

const formatCellContent = (rowValue?: PlanTableRowValue) => {
  if (!rowValue?.included) {
    return <span className="text-slate-400">-</span>;
  }

  const textValue = getRowTextValue(rowValue);

  if (textValue) {
    return <span className="text-slate-600">{textValue}</span>;
  }

  return <IconCheck className="mx-auto text-emerald-500" size={18} />;
};

const sortPlansByName = (plans: MembershipPlan[]) =>
  [...plans].sort((left, right) => {
    const leftCode = getPlanCode(left);
    const rightCode = getPlanCode(right);
    const leftIndex = PLAN_ORDER.indexOf(leftCode as PlanCode);
    const rightIndex = PLAN_ORDER.indexOf(rightCode as PlanCode);

    if (leftIndex === -1 || rightIndex === -1) {
      return getRawPlanName(left).localeCompare(getRawPlanName(right), "vi");
    }

    return leftIndex - rightIndex;
  });

const PlanFeatures = () => {
  const [showAllFeatures, setShowAllFeatures] = useState(true);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [dictionary, setDictionary] = useState<PlanDictionary>({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchPlans = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await rest.get("/plan", {
          signal: controller.signal,
        });
        const fetchedPlans = response.data?.plans as
          | MembershipPlan[]
          | undefined;

        if (!Array.isArray(fetchedPlans)) {
          throw new Error("Dữ liệu so sánh gói không hợp lệ.");
        }

        setPlans(fetchedPlans);
        setDictionary(response.data?.dictionary ?? {});
      } catch (error) {
        if ((error as Error).name === "CanceledError") {
          return;
        }

        setErrorMessage("Không thể tải dữ liệu so sánh gói.");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchPlans();

    return () => controller.abort();
  }, []);

  const monthlyPlans = useMemo(
    () =>
      sortPlansByName(plans.filter((plan) => plan.months_per_interval === 1)),
    [plans],
  );

  const monthlyPlanByName = useMemo(() => {
    const result = new Map<PlanCode, MembershipPlan>();

    monthlyPlans.forEach((plan) => {
      const planCode = getPlanCode(plan) as PlanCode;

      if (PLAN_ORDER.includes(planCode) && !result.has(planCode)) {
        result.set(planCode, plan);
      }
    });

    return result;
  }, [monthlyPlans]);

  const groupedRows = useMemo(() => {
    const rowsMap = new Map<string, ComparisonRow>();
    const dictionaryRowMeta = dictionary.rowMeta ?? {};

    PLAN_ORDER.forEach((planCode) => {
      const plan = monthlyPlanByName.get(planCode);
      const planRows = plan?.product?.table_json?.rows ?? {};

      Object.entries(planRows).forEach(([rowKey, rowValue]) => {
        const existing = rowsMap.get(rowKey);

        if (existing) {
          existing.values[planCode] = rowValue;
          return;
        }

        const meta = dictionaryRowMeta[rowKey];

        rowsMap.set(rowKey, {
          key: rowKey,
          label: meta?.label ?? getFallbackLabel(rowKey, rowValue),
          group: meta?.group ?? FALLBACK_GROUP,
          order: meta?.order ?? FALLBACK_ORDER,
          values: { [planCode]: rowValue },
        });
      });
    });

    const rows = Array.from(rowsMap.values()).sort((left, right) => {
      if (left.order !== right.order) {
        return left.order - right.order;
      }

      return left.label.localeCompare(right.label, "vi");
    });

    const grouped = rows.reduce<Record<string, ComparisonRow[]>>((acc, row) => {
      acc[row.group] ??= [];
      acc[row.group].push(row);
      return acc;
    }, {});

    const groupOrder = Object.entries(grouped)
      .map(([group, groupRows]) => ({
        group,
        order:
          group === FALLBACK_GROUP
            ? FALLBACK_ORDER
            : Math.min(...groupRows.map((row) => row.order)),
      }))
      .sort((left, right) => {
        if (left.order !== right.order) {
          return left.order - right.order;
        }

        return left.group.localeCompare(right.group, "vi");
      })
      .map((item) => item.group);

    return { grouped, groupOrder };
  }, [dictionary, monthlyPlanByName]);

  return (
    <section className="container mx-auto px-3 py-10 md:px-6">
      <div className="flex pb-8 md:pb-12">
        <Button
          onPress={() => setShowAllFeatures((prev) => !prev)}
          disableAnimation
          variant="bordered"
          className="mx-auto border-gray-400 px-5 py-6 text-lg md:text-xl"
        >
          <span className="flex items-center gap-2">
            So sánh tất cả tính năng
            <IconChevronDown
              size={24}
              className={cn(
                "transition-transform",
                showAllFeatures && "rotate-180",
              )}
            />
          </span>
        </Button>
      </div>

      {showAllFeatures && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <div className="min-w-[980px]">
            <div className="grid grid-cols-[2.2fr_1.3fr_1.3fr_1.3fr_1.3fr] border-b border-slate-200 bg-white">
              <div className="p-4 text-left text-lg font-bold text-[#0F2E5F]">
                Tính năng
              </div>
              {PLAN_ORDER.map((planCode) => (
                <div
                  key={planCode}
                  className={cn(
                    "border-l border-slate-200 p-4 text-center text-lg font-bold text-[#0F2E5F]",
                    PLAN_HEADER_CLASS[planCode],
                  )}
                >
                  {PRODUCT_NAME_MAPPING[planCode]}
                </div>
              ))}
            </div>

            {isLoading && (
              <div className="border-b border-slate-200 px-4 py-6 text-slate-500">
                Đang tải dữ liệu so sánh...
              </div>
            )}

            {!isLoading && errorMessage && (
              <div className="border-b border-slate-200 px-4 py-6 text-danger">
                {errorMessage}
              </div>
            )}

            {!isLoading &&
              !errorMessage &&
              groupedRows.groupOrder.map((group) => {
                const rows = groupedRows.grouped[group] ?? [];

                if (rows.length === 0) {
                  return null;
                }

                return (
                  <div
                    key={group}
                    className="border-b border-slate-200 last:border-b-0"
                  >
                    <div className="px-4 py-4">
                      <div className="text-start text-[28px] font-bold leading-tight text-[#153A73]">
                        {group}
                      </div>
                    </div>

                    {rows.map((row, rowIndex) => (
                      <div
                        key={row.key}
                        className={cn(
                          "grid grid-cols-[2.2fr_1.3fr_1.3fr_1.3fr_1.3fr] border-t border-slate-200",
                          rowIndex % 2 === 0 ? "bg-slate-100/60" : "bg-white",
                        )}
                      >
                        <div className="px-4 py-3 text-left text-base font-semibold text-[#1A3766]">
                          {row.label}
                        </div>

                        {PLAN_ORDER.map((planCode) => (
                          <div
                            key={`${row.key}-${planCode}`}
                            className={cn(
                              "border-l border-slate-200 px-4 py-3 text-center text-base font-medium",
                              planCode === "Starter" && "bg-slate-200/60",
                            )}
                          >
                            {formatCellContent(row.values[planCode])}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </section>
  );
};

export default PlanFeatures;
