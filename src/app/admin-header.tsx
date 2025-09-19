"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Bell,
  User,
  Menu,
  LogOut,
  Settings,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import React from "react";

interface AdminHeaderProps {
  onMenuToggle: () => void;
}

const AdminHeader = ({ onMenuToggle }: AdminHeaderProps) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const pathname = usePathname();

  // Fonction pour générer les éléments du fil d'Ariane
  const generateBreadcrumbs = (path: string) => {
    const pathSegments = path.split("/").filter((segment) => segment);

    if (pathSegments.length === 0) {
      return <span className="text-gray-900 font-medium">Tableau de bord</span>;
    }

    return pathSegments.map((segment, index) => {
      const isLast = index === pathSegments.length - 1;
      const href = "/" + pathSegments.slice(0, index + 1).join("/");
      const label = segment.replace(/-/g, " ");

      return (
        <React.Fragment key={href}>
          {index > 0 && <span>/</span>}
          <Link
            href={href}
            className={`hover:text-primary transition-colors ${
              isLast ? "text-gray-900 font-medium" : "text-gray-600"
            }`}
          >
            {label.charAt(0).toUpperCase() + label.slice(1)}
          </Link>
        </React.Fragment>
      );
    });
  };



  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6">
      {/* Left Side */}
      <div className="flex items-center space-x-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuToggle}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Breadcrumb */}
        <nav className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
          {generateBreadcrumbs(pathname)}
        </nav>
      </div>

      {/* Center - Search */}
      {/* <div className="flex-1 max-w-lg mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher des documents, utilisateurs..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div> */}

      {/* Right Side */}
      <div className="flex items-center space-x-4">
        {/* View Site Button */}
        <Link href="/" target="_blank">
          {/* <Button
            variant="outline"
            size="sm"
            className="hidden md:flex items-center space-x-2"
          >
            <Globe className="h-4 w-4" />
            <span>Voir le site</span>
          </Button> */}
        </Link>

    
        {/* User Menu */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <span className="hidden md:block text-sm font-medium">Admin</span>
          </Button>

          {/* User Dropdown */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
              <div className="p-4 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-900">Admin SGG</p>
                <p className="text-xs text-gray-500">admin@sgg.gouv.td</p>
              </div>
              <div className="py-2">
                <Link
                  href="/admin/profile"
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <User className="h-4 w-4" />
                  <span>Mon profil</span>
                </Link>
                <Link
                  href="/admin/settings"
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Settings className="h-4 w-4" />
                  <span>Paramètres</span>
                </Link>
                <hr className="my-2" />
                <button
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                  onClick={() => {
                    // Handle logout
                    console.log("Logging out...");
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(isUserMenuOpen || isNotificationOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsUserMenuOpen(false);
            setIsNotificationOpen(false);
          }}
        />
      )}
    </header>
  );
};

export default AdminHeader;
