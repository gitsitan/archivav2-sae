"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Search, Bell, User, Menu, LogOut, Settings, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminHeaderProps {
  onMenuToggle: () => void;
}

const AdminHeader = ({ onMenuToggle }: AdminHeaderProps) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const notifications = [
    {
      id: 1,
      title: "Nouveau document publié",
      message: "Arrêt n°2025-09/CC du 25 août 2025",
      time: "Il y a 5 minutes",
      unread: true
    },
    {
      id: 2,
      title: "Journal Officiel mis à jour",
      message: "JO n°2025-11 spécial du 27/08/2025",
      time: "Il y a 1 heure",
      unread: true
    },
    {
      id: 3,
      title: "Nouveau communiqué",
      message: "Communiqué du Conseil des Ministres",
      time: "Il y a 3 heures",
      unread: false
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

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
          <Link href="/admin" className="hover:text-primary transition-colors">
            Administration
          </Link>
          <span>/</span>
          <span className="text-gray-900">Tableau de bord</span>
        </nav>
      </div>

      {/* Center - Search */}
      <div className="flex-1 max-w-lg mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher des documents, utilisateurs..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center space-x-4">
        {/* View Site Button */}
        <Link href="/" target="_blank">
          <Button variant="outline" size="sm" className="hidden md:flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>Voir le site</span>
          </Button>
        </Link>

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="relative"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Button>

          {/* Notifications Dropdown */}
          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 z-50">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Notifications</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer ${
                      notification.unread ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        notification.unread ? 'bg-blue-500' : 'bg-gray-300'
                      }`} />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-200">
                <Link href="/admin/notifications">
                  <Button variant="outline" size="sm" className="w-full">
                    Voir toutes les notifications
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>

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
                <p className="text-xs text-gray-500">admin@sgg-mali.ml</p>
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
                    console.log('Logging out...');
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
