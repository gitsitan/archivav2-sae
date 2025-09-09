"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  Users,
  Settings,
  Upload,
  BarChart3,
  Search,
  Bell,
  Calendar,
  BookOpen,
  MessageSquare,
  Globe,
  Shield,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  submenu?: { title: string; href: string }[];
}

const sidebarItems: SidebarItem[] = [
  {
    title: "Tableau de bord",
    href: "/admin",
    icon: <Home className="h-5 w-5" />,
  },
  {
    title: "Gestion des contenus",
    href: "/admin/content",
    icon: <FileText className="h-5 w-5" />,
    submenu: [
      { title: "Actualités", href: "/admin/content/actualites" },
      { title: "Documents officiels", href: "/admin/content/documents" },
      { title: "Communiqués", href: "/admin/content/communiques" },
      { title: "Journaux officiels", href: "/admin/content/journals" },
    ],
  },
  {
    title: "Bibliothèque",
    href: "/admin/library",
    icon: <BookOpen className="h-5 w-5" />,
    submenu: [
      { title: "Codes en vigueur", href: "/admin/library/codes" },
      { title: "Textes consolidés", href: "/admin/library/consolidated" },
      { title: "Droit régional", href: "/admin/library/regional" },
      { title: "Conventions", href: "/admin/library/conventions" },
    ],
  },

  {
    title: "Utilisateurs",
    href: "/admin/users",
    icon: <Users className="h-5 w-5" />,
    submenu: [
      { title: "Gestion des comptes", href: "/admin/users/accounts" },
      { title: "Permissions", href: "/admin/users/permissions" },
      { title: "Groupes", href: "/admin/users/groups" },
    ],
  },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const AdminSidebar = ({ isOpen, onToggle }: AdminSidebarProps) => {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleSubmenu = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href)
        ? prev.filter((item) => item !== href)
        : [...prev, href]
    );
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* Header */}
        <div className=" flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Admin SGG</h2>
              <p className="text-xs text-gray-500">Panel d'administration</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {sidebarItems.map((item) => (
              <li key={item.href}>
                <div>
                  {item.submenu ? (
                    <button
                      onClick={() => toggleSubmenu(item.href)}
                      className={`
                        w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                        ${
                          isActive(item.href)
                            ? "bg-primary text-primary-foreground"
                            : "text-gray-700 hover:bg-gray-100"
                        }
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        {item.icon}
                        <span>{item.title}</span>
                      </div>
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${
                          expandedItems.includes(item.href) ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={`
                        flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                        ${
                          isActive(item.href)
                            ? "bg-primary text-primary-foreground"
                            : "text-gray-700 hover:bg-gray-100"
                        }
                      `}
                      onClick={() => onToggle()}
                    >
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                  )}
                </div>

                {/* Submenu */}
                {item.submenu && expandedItems.includes(item.href) && (
                  <ul className="mt-1 ml-6 space-y-1">
                    {item.submenu.map((subItem) => (
                      <li key={subItem.href}>
                        <Link
                          href={subItem.href}
                          className={`
                            block px-3 py-2 text-sm rounded-md transition-colors duration-200
                            ${
                              isActive(subItem.href)
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-gray-600 hover:bg-gray-50"
                            }
                          `}
                          onClick={() => onToggle()}
                        >
                          {subItem.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3"></div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
