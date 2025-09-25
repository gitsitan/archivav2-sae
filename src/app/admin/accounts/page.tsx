"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01FreeIcons,
  Delete02Icon,
  Edit03Icon,
} from "@hugeicons/core-free-icons";
import ConfirmationDialog from "@/components/ui/confirmationDialog";

import useNotification from "@/app/hooks/useNotifications";
import Notification from "@/components/ui/notifications";
import AdminLayout from "@/app/adminLayout";
import { getUsers, deleteUser, toggleUserStatus } from "./actions";
import { UserRole } from "@prisma/client";
import AdminHeaders from "@/app/components/adminHeader";
import MySpinner from "@/components/ui/my-spinner";

interface User {
  id: number;
  email: string;
  name: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  groupIds: number[];
  groupNames: string[];
}

const SortIcon: React.FC = () => (
  <svg
    className="w-4 h-4 ms-1"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="m8 15 4 4 4-4m0-6-4-4-4 4"
    />
  </svg>
);

const getRoleLabel = (role: UserRole): string => {
  const labels = {
    ADMIN: "Administrateur",
    MANAGER: "Gestionnaire",
    USER: "Utilisateur",
    VIEWER: "Observateur",
  };
  return labels[role] || role;
};

const getRoleBadgeClass = (role: UserRole): string => {
  const classes = {
    ADMIN: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    MANAGER: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
    USER: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    VIEWER: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300",
  };
  return classes[role] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
};

const AccountsPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState<keyof User | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const { notification, showNotification, hideNotification } =
    useNotification();

  useEffect(() => {
    const fetchData = async () => {
      const start = Date.now();
      try {
        const result = await getUsers();
        const elapsed = Date.now() - start;
        
        if (result.success && result.data) {
          setUsers(result.data);
        } else {
          console.error("Erreur de l'API:", result.error);
          showNotification(result.error || "Erreur lors du chargement", "error");
        }
        
        // Ajuster le loading en fonction de la durée réelle
        const minLoadingTime = 800; // Temps minimum réduit
        const remaining = minLoadingTime - elapsed;
        
        if (remaining > 0) {
          setTimeout(() => setLoading(false), remaining);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des utilisateurs:", error);
        showNotification("Erreur lors du chargement des utilisateurs", "error");
        setLoading(false); // Arrêter le loading immédiatement en cas d'erreur
      }
    };
    fetchData();
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const filteredUsers = users.filter((user) =>
    Object.values(user).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!sortColumn) return 0;
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    if (aValue == null || bValue == null) return 0;
    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = sortedUsers.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleCreate = () => {
    router.push("/admin/accounts/new");
  };

  const handleEdit = (id: number) => {
    router.push(`/admin/accounts/edit/${id}`);
  };

  const handleDelete = async (id: number) => {
    setItemToDeleteId(id);
    setShowDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDeleteId !== null) {
      try {
        const result = await deleteUser(itemToDeleteId);

        if (result.success) {
          setUsers((prevUsers) =>
            prevUsers.filter((user) => user.id !== itemToDeleteId)
          );
          showNotification("Utilisateur supprimé avec succès !", "success");
        } else {
          showNotification(
            result.error || "Erreur lors de la suppression.",
            "error"
          );
        }
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        showNotification(
          "Une erreur inattendue est survenue. Veuillez réessayer.",
          "error"
        );
      }
      setShowDialog(false);
      setItemToDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDialog(false);
    setItemToDeleteId(null);
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const result = await toggleUserStatus(id);
      if (result.success) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === id
              ? { ...user, isActive: !user.isActive }
              : user
          )
        );
        showNotification("Statut modifié avec succès !", "success");
      } else {
        showNotification(result.error || "Erreur lors de la modification", "error");
      }
    } catch (error) {
      console.error("Erreur lors de la modification du statut:", error);
      showNotification("Erreur lors de la modification du statut", "error");
    }
  };

  const handleSort = (column: keyof User) => {
    if (sortColumn === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  return (
    <>
      <AdminLayout>
        {loading ? (
         <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
          <MySpinner size="lg" color="primary" />
          <p className="mt-4 text-gray-600 font-medium">
            Chargement ...
          </p>
        </div>
        ) : (
          <>
            <AdminHeaders
              title="Liste des utilisateurs"
              desc="Gérez les comptes utilisateurs du système d'archivage"
            />
            {notification.visible && (
              <Notification
                message={notification.message}
                type={notification.type}
                onClose={hideNotification}
              />
            )}

            <div className="flex-container">
              <div className="search-container">
                <label htmlFor="search" className="sr-only">
                  Rechercher
                </label>
                <input
                  type="text"
                  id="search"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="input-search"
                />
              </div>

              <button onClick={handleCreate} className="btn-primary">
                <HugeiconsIcon icon={Add01FreeIcons} size={25} />
              </button>
            </div>

            <div className="tableContainer">
              <table className="table-main">
                <thead className="table-header">
                  <tr className="table-row">

                  <th
                      className="table-header-cell" style={{ width: "250px" }}
                      onClick={() => handleSort("email")}
                    >
                      <span>
                        Email
                        <SortIcon />
                      </span>
                    </th>
                  <th
                      className="table-header-cell" 
                      onClick={() => handleSort("name")}
                    >
                      <span>
                        Nom
                        <SortIcon />
                      </span>
                    </th>
            
                 
                 
                    <th
                      className="table-header-cell" style={{ width: "250px" }}
                    >
                      <span>
                        Groupes
                      </span>
                    </th>
                    <th
                      className="table-header-cell"
                        style={{ width: "120px" }}
                      onClick={() => handleSort("isActive")}
                    >
                      <span>
                        Statut
                        <SortIcon />
                      </span>
                    </th>
                    <th className="table-header-cell" style={{ width: "100px" }}>
                      <span>Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody key={currentPage} className="table-body">
                  {currentUsers.map((user) => (
                    <tr key={user.id} className="table-row">

                      <td className="table-body-cell table-body-cell-bold">
                        {user.email}
                      </td>
                      <td className="table-body-cell table-body-cell-bold">
                        {user.name || "-"}
                      </td>
              
                     
                   
                      <td className="table-body-cell">
                        <div className="flex flex-wrap gap-1">
                          {user.groupNames.length > 0 ? (
                            user.groupNames.map((groupName, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                              >
                                {groupName}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500 text-xs">Aucun groupe</span>
                          )}
                        </div>
                      </td>
                      <td className="table-body-cell">
                        <button
                          onClick={() => handleToggleStatus(user.id)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.isActive
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                          }`}
                        >
                          {user.isActive ? "Actif" : "Inactif"}
                        </button>
                      </td>
                      <td className="table-body-cell">
                        <button
                          onClick={() => handleEdit(user.id)}
                          className="btn-action btn-action-edit"
                        >
                          <HugeiconsIcon icon={Edit03Icon} size={25} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="btn-action btn-action-delete"
                        >
                          <HugeiconsIcon icon={Delete02Icon} size={25} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-b-lg">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Précédent
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Suivant
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-400">
                    Affichage de{" "}
                    <span className="font-medium">{startIndex + 1}</span> à{" "}
                    <span className="font-medium">
                      {Math.min(endIndex, users.length)}
                    </span>{" "}
                    sur <span className="font-medium">{users.length}</span>{" "}
                    résultats
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <span className="sr-only">Précédent</span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => handlePageChange(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === i + 1
                            ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600 dark:bg-indigo-900 dark:border-indigo-700 dark:text-indigo-400"
                            : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <span className="sr-only">Suivant</span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>

            {showDialog && (
              <ConfirmationDialog
                title="Confirmation de suppression"
                message="Voulez-vous vraiment supprimer cet utilisateur ?"
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
              />
            )}
          </>
        )}
      </AdminLayout>
    </>
  );
};

export default AccountsPage;
