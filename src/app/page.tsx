"use client";
import AdminHeader from "./admin-header";
import AdminSidebar from "./admin-sidebar";
import { useState } from "react";
import AdminDashboard from "./adminDashboard";

export default function Home({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  return (
    <>
      <div className="h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <AdminSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

        {/* Content wrapper */}
        <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
          {/* Header */}
          <div className="sticky top-0 z-20">
            <AdminHeader onMenuToggle={toggleSidebar} />
          </div>

          {/* Main Content */}
          <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
            <AdminDashboard />
          </main>
        </div>
      </div>
    </>
  );
}
