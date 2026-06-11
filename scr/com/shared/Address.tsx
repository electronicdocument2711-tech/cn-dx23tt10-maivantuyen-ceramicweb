import { useEffect, useMemo, useState } from "react";
// import { Province, Ward } from "@/types/widget";
import { useContainerSize } from "@/hook/useContainerSize";
import { Autocomplete, AutocompleteItem, Input } from "@heroui/react";
import { fetchAllProvince, fetchWardbyProvince } from "../../lib/apiShared";
import { Ward } from "../../types/define.d";
import { Province } from "../../types/widget";
import { provinceData } from "../../data/province";
import { UI_META } from "../../const/ui";

interface AddressProps {
  province: string;
  ward: string;
  address: string;
  setProvince: (val: string) => void;
  setWard: (val: string) => void;
  setAddress: (val: string) => void;
  onFullAddressChange?: (val: string) => void;
}
export const Address = ({
  province,
  ward,
  address,
  setProvince,
  setWard,
  setAddress,
  onFullAddressChange,
}: AddressProps) => {
  const { containerRef } = useContainerSize();
  const [provinces, setProvinces] = useState<Partial<Province>[]>(provinceData);
  const provinceLists = useMemo(() => {
    if (!provinces) return [];
    return provinces
      ?.map((p) => {
        const label = `${p.LabelVi} ${p.NameVi}`;
        return { id: p.VnProvinceId, label };
      })
      .sort((a, b) => a.label.localeCompare(b.label, "vi"));
  }, [provinces]);

  const [isLoadingWard, setIsLoadingWard] = useState(false);
  const [wards, setWards] = useState<Ward[]>([]);
  const wardLists = useMemo(() => {
    if (!wards) return [];
    return wards
      ?.map((p) => {
        const label = `${p.NameVi}`;
        return { id: p.VnWardId, label };
      })
      .sort((a, b) => a.label.localeCompare(b.label, "vi"));
  }, [wards]);

  const [wardFilter, setWardFilter] = useState("");
  const filteredWardLists = useMemo(() => {
    if (!wardFilter) return wardLists;
    return wardLists.filter((w) =>
      w.label.toLowerCase().includes(wardFilter.toLowerCase()),
    );
  }, [wardLists, wardFilter]);

  useEffect(() => {
    fetchAllProvince(setProvinces);
  }, []);

  useEffect(() => {
    if (!province) return;
    fetchWardbyProvince(province, setWards, setIsLoadingWard);
  }, [province]);

  useEffect(() => {
    if (!onFullAddressChange) return;
    const wardStr = wardLists.find((w) => w.id === ward)?.label || "";
    const provinceStr =
      provinceLists.find((p) => p.id === province)?.label || "";
    const fullAddress = `${address}${wardStr ? `, ${wardStr}` : ""}${provinceStr ? `, ${provinceStr}` : ""}`;

    onFullAddressChange(fullAddress);
  }, [province, ward, address, onFullAddressChange, provinceLists, wardLists]);

  return (
    <div ref={containerRef} className="@container w-full flex flex-col gap-3">
      <div>
        <p className="font-bold">Địa chỉ</p>
        <div className="w-full flex flex-col @md:flex-row gap-3 @md:gap-3">
          <Autocomplete
            isDisabled={!provinceLists || provinceLists.length === 0}
            size="lg"
            label=" "
            placeholder="Chọn tỉnh/thành"
            variant="bordered"
            labelPlacement="outside-top"
            className="w-full max-w-61"
            scrollShadowProps={{ isEnabled: false }}
            listboxProps={UI_META.Select.listboxProps}
            defaultItems={provinceLists}
            selectedKey={province || null}
            onSelectionChange={(key) => {
              setProvince(key as string);
              setWard("");
              setWardFilter("");
            }}
          >
            {(item) => (
              <AutocompleteItem
                key={String(item.id)}
                textValue={item.label}
                className="py-0"
              >
                {item.label}
              </AutocompleteItem>
            )}
          </Autocomplete>
          <Autocomplete
            isLoading={isLoadingWard}
            isDisabled={!wardLists || wardLists.length === 0}
            size="lg"
            label=" "
            placeholder="Chọn phường/xã"
            variant="bordered"
            labelPlacement="outside-top"
            className="w-full max-w-61"
            scrollShadowProps={{ isEnabled: false }}
            listboxProps={UI_META.Select.listboxProps}
            items={filteredWardLists}
            onInputChange={setWardFilter}
            selectedKey={ward || null}
            onSelectionChange={(key) => setWard(key as string)}
          >
            {(item) => (
              <AutocompleteItem
                key={String(item.id)}
                textValue={item.label}
                className="py-0"
              >
                {item.label}
              </AutocompleteItem>
            )}
          </Autocomplete>
        </div>
      </div>
      <Input
        size="lg"
        placeholder="Nhập số nhà, tên đường"
        variant="bordered"
        labelPlacement={"outside-top"}
        radius="lg"
        classNames={{
          base: "w-full",
          label: "!font-bold !text-base",
          inputWrapper:
            "h-12 rounded-2xl border-default-400 data-[hover=true]:border-default-500",
          input:
            "text-base font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
        }}
        value={address}
        onValueChange={(val) => setAddress(val)}
      />
    </div>
  );
};
