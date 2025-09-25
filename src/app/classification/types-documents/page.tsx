"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/app/adminLayout";
import AdminHeaders from "@/app/components/adminHeader";
import useNotification from "@/app/hooks/useNotifications";
import Notification from "@/components/ui/notifications";
import MySpinner from "@/components/ui/my-spinner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01FreeIcons } from "@hugeicons/core-free-icons";
import { Delete02Icon, Edit03Icon } from "@hugeicons/core-free-icons";
import ConfirmationDialog from "@/components/ui/confirmationDialog";
import {
  getTypeDocuments,
  deleteTypeDocument,
  toggleTypeDocumentStatus,
  TypeDocumentItem,
} from "./actions";

const TypeDocumentsPage: React.FC = () => {
  const [items, setItems] = useState<TypeDocumentItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<number | null>(null);
  const router = useRouter();
  const { notification, showNotification, hideNotification } =
    useNotification();

  useEffect(() => {
    const start = Date.now();
    const fetchData = async () => {
      try {
        const result = await getTypeDocuments();
        const elapsed = Date.now() - start;
        if (result.success && result.data) {
          setItems(result.data);
        } else {
          showNotification(
            result.error || "Erreur lors du chargement",
            "error"
          );
        }
        const minLoadingTime = 800;
        const remaining = minLoadingTime - elapsed;
        if (remaining > 0) setTimeout(() => setLoading(false), remaining);
        else setLoading(false);
      } catch (e) {
        showNotification("Erreur lors du chargement", "error");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreate = () => router.push("/classification/types-documents/new");
  const handleEdit = (id: number) =>
    router.push(`/classification/types-documents/edit/${id}`);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchTerm(e.target.value);

  const handleDelete = (id: number) => {
    setItemToDeleteId(id);
    setShowDialog(true);
  };
  const handleConfirmDelete = async () => {
    if (itemToDeleteId == null) return;
    const result = await deleteTypeDocument(itemToDeleteId);
    if (result.success) {
      const refreshed = await getTypeDocuments();
      if (refreshed.success && refreshed.data) setItems(refreshed.data);
      showNotification("Type de document supprimé avec succès !", "success");
    } else {
      showNotification(
        result.error || "Erreur lors de la suppression",
        "error"
      );
    }
    setShowDialog(false);
    setItemToDeleteId(null);
  };
  const handleCancelDelete = () => {
    setShowDialog(false);
    setItemToDeleteId(null);
  };

  const handleToggleStatus = async (id: number) => {
    const result = await toggleTypeDocumentStatus(id);
    if (result.success) {
      const refreshed = await getTypeDocuments();
      if (refreshed.success && refreshed.data) setItems(refreshed.data);
      showNotification("Statut modifié avec succès !", "success");
    } else {
      showNotification(
        result.error || "Erreur lors de la modification",
        "error"
      );
    }
  };

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <AdminLayout>
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <MySpinner size="lg" color="primary" />
            <p className="mt-4 text-gray-600 font-medium">Chargement ...</p>
          </div>
        ) : (
          <>
            <AdminHeaders
              title="Types de documents"
              desc="Gérez les catégories de type pour les documents"
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
                  id="search"
                  type="text"
                  placeholder="Rechercher par nom..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="input-search"
                />
              </div>
              <button onClick={handleCreate} className="btn-primary">
                <HugeiconsIcon icon={Add01FreeIcons} size={25} />
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                {filtered.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      {searchTerm
                        ? "Aucun type ne correspond à votre recherche"
                        : "Aucun type de document trouvé"}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700/40">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nom
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Statut
                          </th>
                          <th className="px-4 py-3" />
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filtered.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                              {item.name}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleToggleStatus(item.id)}
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  item.status === "ACTIVE"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                }`}
                              >
                                {item.status === "ACTIVE" ? "Actif" : "Archivé"}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => handleEdit(item.id)}
                                  className="btn-action btn-action-edit"
                                >
                                  <HugeiconsIcon icon={Edit03Icon} size={20} />
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="btn-action btn-action-delete"
                                >
                                  <HugeiconsIcon
                                    icon={Delete02Icon}
                                    size={20}
                                  />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {showDialog && (
              <ConfirmationDialog
                title="Confirmation de suppression"
                message="Voulez-vous vraiment supprimer ce type de document ? Cette action est irréversible."
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

export default TypeDocumentsPage;
