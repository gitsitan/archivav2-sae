"use client";

import { useState } from 'react';
import AdminSidebar from '@/components/admin/admin-sidebar';
import AdminHeader from '@/components/admin/admin-header';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      <div className="lg:ml-64">
        <AdminHeader onMenuToggle={toggleSidebar} />

        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
