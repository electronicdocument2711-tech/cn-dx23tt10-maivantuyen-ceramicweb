import React from "react";
import Link from "next/link";
import { IconLogo } from "@/com/icons/regular";

interface HeaderProps {
  preventHomeLink?: boolean;
}

const Header: React.FC<HeaderProps> = ({ preventHomeLink }) => {
  return (
    <header className="max-w-7xl mx-auto p-3">
      <div className="mx-auto flex items-center justify-between">
        {!preventHomeLink ? (
          <Link href={process.env.NEXT_PUBLIC_LANDINGPAGE_URL ?? "/"}>
            <IconLogo size={48} />
          </Link>
        ) : (
          <IconLogo size={48} />
        )}
      </div>
    </header>
  );
};

export default Header;
