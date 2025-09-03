// "use client";

// import { useState } from "react";
// import AdminSidebar from "@/components/admin/admin-sidebar";
// import AdminHeader from "@/components/admin/admin-header";

// export default function AdminLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   const toggleSidebar = () => {
//     setSidebarOpen(!sidebarOpen);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex">
//       {/* Sidebar */}
//       <AdminSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

//       <div
//         className={`lg:ml-64 w-full transition-all duration-300 ease-in-out ${
//           sidebarOpen ? "ml-0" : ""
//         }`}
//       >
//         {/* Header */}
//         <AdminHeader onMenuToggle={toggleSidebar} />

//         {/* Main Content */}
//         <main className="p-4 lg:p-6">{children}</main>
//       </div>
//     </div>
//   );
// }
"use client";

import { useState } from "react";
import AdminSidebar from "./admin-sidebar";
import AdminHeader from "./admin-header";

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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      {/* Content wrapper */}
      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
        {/* Header */}
        <div className="sticky top-0 z-20">
          <AdminHeader onMenuToggle={toggleSidebar} />
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
