"use client";

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Anchor,
  LayoutGrid,
  AlertCircle,
  Users,
  FileText,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  LogOut,
  User,
} from "lucide-react";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/api";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  toggleCollapse: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed, toggleCollapse }}>
      {children}
    </SidebarContext.Provider>
  );
}

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/" },
  { name: "Vessels", icon: Anchor, href: "/vessels" },
  { name: "Forms", icon: LayoutGrid, href: "/forms" },
  { name: "Defects", icon: AlertCircle, href: "/defects" },
  { name: "Users", icon: Users, href: "/users" },
  { name: "Inspection", icon: FileText, href: "/inspection" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed, toggleCollapse, setIsCollapsed } = useSidebar();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const { firstName, lastName, email, setUserDetails, logout } = useAuthStore();

  useEffect(() => {
    function handleSidebarClickOutside(event: MouseEvent) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        !isCollapsed
      ) {
        setIsCollapsed(true);
      }
    }

    document.addEventListener("mousedown", handleSidebarClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleSidebarClickOutside);
    };
  }, [isCollapsed, setIsCollapsed]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await authApi.getProfile();
        if (response.success) {
          setUserDetails({
            firstName: response.data.first_name,
            lastName: response.data.last_name,
            email: response.data.email,
          });
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };

    fetchUserProfile();
  }, [setUserDetails]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const userInitial = firstName ? firstName.charAt(0).toUpperCase() : "U";
  const displayName = firstName && lastName ? `${firstName} ${lastName}` : "User";

  return (
    <div
      ref={sidebarRef}
      className={cn(
        "flex flex-col h-screen bg-white border-r border-gray-100 sticky top-0 left-0 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className={cn(
        "p-4 flex items-center",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {!isCollapsed && (
          <Image
            src="/logo.png"
            alt="SailMind"
            width={130}
            height={40}
            priority
            className="transition-opacity duration-300"
          />
        )}
        <button
          onClick={toggleCollapse}
          className={cn(
            "p-2 rounded-lg hover:bg-gray-100 transition-colors group",
            isCollapsed && "mx-auto"
          )}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <PanelLeft className="w-5 h-5 text-gray-500 group-hover:text-[#1F9EBD] transition-colors" />
          ) : (
            <PanelLeftClose className="w-5 h-5 text-gray-500 group-hover:text-[#1F9EBD] transition-colors" />
          )}
        </button>
      </div>

      <nav className={cn(
        "flex-1 space-y-2 mt-4",
        isCollapsed ? "px-2" : "px-4"
      )}>
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center rounded-lg text-sm font-medium transition-all duration-200",
                isCollapsed
                  ? "justify-center p-3"
                  : "gap-3 px-4 py-3",
                isActive
                  ? "text-white shadow-md"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}
              style={
                isActive
                  ? {
                    background:
                      "linear-gradient(90deg, #1B6486 0%, #1F9EBD 100%)",
                  }
                  : {}
              }
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className={cn(
                "flex-shrink-0 transition-all duration-200",
                isCollapsed ? "w-6 h-6" : "w-5 h-5"
              )} />
              {!isCollapsed && (
                <span className="whitespace-nowrap overflow-hidden transition-all duration-300">
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 relative" ref={menuRef}>
        <div
          className={cn(
            "flex items-center rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200",
            isCollapsed ? "justify-center p-2" : "gap-3 p-2"
          )}
          onClick={() => setShowUserMenu(!showUserMenu)}
        >
          <div className="w-10 h-10 rounded-full bg-[#1F9EBD] flex items-center justify-center text-white font-bold flex-shrink-0">
            {userInitial}
          </div>
          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">Welcome 👋</p>
                <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </>
          )}
        </div>

        {showUserMenu && (
          <div className={cn(
            "absolute bottom-full mb-2 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50",
            isCollapsed ? "left-4 w-48" : "left-4 right-4"
          )}>
            <div className="px-4 py-2 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1F9EBD] flex items-center justify-center text-white font-bold flex-shrink-0">
                  {userInitial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                  <p className="text-xs text-gray-500 truncate">{email || "No email"}</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
