import Search from "@/com/nav/Search";
import ProfileDropdown from "@/com/nav/ProfileDropdown";
import BranchDropdown from "@/com/nav/BranchDropdown";
// import NotiDropdown from "@/com/nav/NotiDropdown";

// import { get } from "@/lib/cookie";

const Navbar: React.FC = async () => {
  // const isFluid = (await get("fluid-layout")) !== "false";
  return (
    <nav className="bg-white border-b border-b-slate-200 sticky top-0 left-0 right-0 z-20">
      <div className="max-w-7xl mx-auto py-3 px-6">
        <div className="flex justify-between gap-6">
          <div className="min-w-80">
            <Search />
          </div>
          <div className="flex-1 flex justify-end gap-3 items-center">
            {/* <NotiDropdown /> */}
            <BranchDropdown />
            {/* <ProfileDropdown isFluid={isFluid} /> */}
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
