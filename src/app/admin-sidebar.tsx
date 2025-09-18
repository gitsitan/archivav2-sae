"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Users, Shield, X, BookOpen } from "lucide-react";
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
    href: "/",
    icon: <Home className="h-5 w-5" />,
  },
    {
    title: "Recherches avancées",
    href: "/search",
    icon: <FileText className="h-5 w-5" />,
  },
    {
    title: "Dossiers",
    href: "/folders",
    icon: <FileText className="h-5 w-5" />,
    submenu: [
      { title: "Nouveau dossier", href: "/folders/nouveau-dossier" },
      { title: "Gestion des dossiers", href: "/folders/gestion-dossiers" },
      { title: "Gestion des prêts", href: "/folders/gestion-prets" },
      { title: "Gestion des versements", href: "/folders/gestion-versements" },
      { title: "Gestion des destructions", href: "/folders/gestion-destructions" }
    ],
  },
  {
    title: "Etats",
    href: "/reports",
    icon: <FileText className="h-5 w-5" />,
    submenu: [
      { title: "Rapport1", href: "/actualites" },

    ],
  },
  {
    title: "Plan de classement",
    href: "/classification",
    icon: <FileText className="h-5 w-5" />,
    submenu: [
      { title: "Series", href: "/classification/series" },
      { title: "Nature documents", href: "/classification/nature-documents" },
      { title: "Adressage", href: "/classification/adressage" },
    ],
  },
  {
    title: "Paramètres",
    href: "/parameters",
    icon: <BookOpen className="h-5 w-5" />,
    submenu: [
      { title: "Organisation", href: "/parameters/organisation" },
      { title: "Structures", href: "/parameters/structures" },
      { title: "Bénéficiaires", href: "/parameters/beneficiaires" },
      { title: "Paramètres géneraux", href: "/parameters/generaux" },
    ],
  },
  {
    title: "Administration",
    href: "/admin",
    icon: <Users className="h-5 w-5" />,
    submenu: [
      { title: "Gestion des comptes", href: "/admin/accounts" },
      { title: "Permissions", href: "/admin/permissions" },
      { title: "Groupes", href: "/admin/groups" },
      { title: "Piste d'audit", href: "/admin/audit" },
    ],
  },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const AdminSidebar = ({ isOpen, onToggle }: AdminSidebarProps) => {
  const pathname = usePathname();

  // État pour gérer l'ouverture/fermeture des sous-menus
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  // État pour gérer la surbrillance basée sur le dernier clic
  const [activeItem, setActiveItem] = useState<string | null>(pathname);

  const toggleSubmenu = (href: string) => {
    setExpandedItem((prev) => (prev === href ? null : href));
    setActiveItem(href);
  };

  const handleDirectLinkClick = (href: string) => {
    setActiveItem(href);
    setExpandedItem(null); // Ferme les sous-menus ouverts
    onToggle();
  };

  const handleSublinkClick = (href: string) => {
    setActiveItem(href);
    onToggle();
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
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">ARCHIVA SAE</h2>
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
                          activeItem === item.href ||
                          item.submenu.some((sub) => sub.href === activeItem)
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
                          expandedItem === item.href ? "rotate-180" : ""
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
                          activeItem === item.href
                            ? "bg-primary text-primary-foreground"
                            : "text-gray-700 hover:bg-gray-100"
                        }
                      `}
                      onClick={() => handleDirectLinkClick(item.href)}
                    >
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                  )}
                </div>

                {/* Affiche le sous-menu si expandedItem correspond */}
                {item.submenu && expandedItem === item.href && (
                  <ul className="mt-1 ml-6 space-y-1">
                    {item.submenu.map((subItem) => (
                      <li key={subItem.href}>
                        <Link
                          href={subItem.href}
                          className={`
                            block px-3 py-2 text-sm rounded-md transition-colors duration-200
                            ${
                              pathname === subItem.href
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-gray-600 hover:bg-gray-50"
                            }
                          `}
                          onClick={() => handleSublinkClick(subItem.href)}
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
