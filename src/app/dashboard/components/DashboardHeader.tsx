"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface DashboardHeaderProps {
  userName?: string;
  userAvatar?: string;
}

export default function DashboardHeader({ userName, userAvatar }: DashboardHeaderProps) {
  const pathname = usePathname();

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/progress", label: "Progress" },
    { href: "/dashboard/settings", label: "Settings" },
  ];

  // Check if a link is active (exact match for dashboard, startsWith for nested routes)
  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="w-full px-16 py-12 max-md:px-5 max-md:py-6">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="text-[55px] font-medium tracking-figma text-black max-md:text-3xl">
          pulse.
        </Link>

        {/* Navigation Links - Centered */}
        <nav className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-20 max-md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-[32px] font-medium tracking-figma transition-opacity hover:opacity-70 ${
                isActive(link.href) ? "text-black" : "text-black/70"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* User Avatar */}
        <div className="w-[133px] h-[133px] rounded-full overflow-hidden flex items-center justify-center max-md:w-16 max-md:h-16">
          <Image
            src={userAvatar || "/images/nerd-png-3.png"}
            alt={userName || "User"}
            width={133}
            height={133}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  );
}
