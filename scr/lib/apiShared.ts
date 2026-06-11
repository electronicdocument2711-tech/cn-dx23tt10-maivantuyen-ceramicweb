import { Province } from "@/types/widget";
import rest from "@/lib/rest";
import { provinceData } from "../data/province";
import { Ward } from "../types/define.d";

export const fetchAllProvince = async (
  setter: React.Dispatch<React.SetStateAction<Partial<Province>[]>>,
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>,
  onSucess?: (d: Partial<Province>[]) => void,
) => {
  try {
    if (Array.isArray(provinceData) && provinceData.length > 0) {
      setter(provinceData);
      onSucess?.(provinceData);
      return;
    }
    setLoading?.(true);
    const res = await rest.get("/address/provinces");
    const data = res.data;
    console.log("provices:", data);
    if (!data) throw new Error("provinces data null");
    setter(data);
    onSucess?.(data);
  } catch (error: any) {
    setter([]);
    void error;
  } finally {
    setLoading?.(false);
  }
};

export const fetchWardbyProvince = async (
  VnProvinceId: string,
  setter: React.Dispatch<React.SetStateAction<Ward[]>>,
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>,
  onSuccess?: (d: Ward[]) => void,
) => {
  try {
    setLoading?.(true);
    if (!VnProvinceId || VnProvinceId === "") throw new Error("id null");
    const res = await rest.get("/address/wards", {
      params: { VnProvinceId },
    });
    const data = res.data as Ward[];
    if (!data) throw new Error("ward data null");
    setter(data);
    onSuccess?.(data);
  } catch (error) {
    setter([]);
    void error;
  } finally {
    setLoading?.(false);
  }
};
