"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Folder,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import {
  getLiassesBySerie,
  deleteLiasse,
  toggleLiasseStatus,
  LiasseWithSerie,
} from "./actions";
import LiasseModal from "./LiasseModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import useNotification from "@/app/hooks/useNotifications";
import Notification from "@/components/ui/notifications";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon, Edit03Icon } from "@hugeicons/core-free-icons";

interface LiassesManagerProps {
  serieId: number;
  serieName: string;
}

const LiassesManager: React.FC<LiassesManagerProps> = ({
  serieId,
  serieName,
}) => {
  const [liasses, setLiasses] = useState<LiasseWithSerie[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLiasse, setSelectedLiasse] = useState<LiasseWithSerie | null>(
    null
  );
  const [liasseToDelete, setLiasseToDelete] = useState<LiasseWithSerie | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<boolean | null>(null);

  const { notification, showNotification, hideNotification } =
    useNotification();

  // Charger les liasses
  const loadLiasses = async () => {
    try {
      setLoading(true);
      const result = await getLiassesBySerie(serieId);

      if (result.success && result.data) {
        setLiasses(result.data);
      } else {
        showNotification(result.error || "Erreur lors du chargement", "error");
      }
    } catch (error) {
      console.error("Erreur lors du chargement des liasses:", error);
      showNotification("Erreur lors du chargement des liasses", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLiasses();
  }, [serieId]);

  // Filtrer les liasses
  const filteredLiasses = liasses.filter((liasse) => {
    const matchesSearch =
      liasse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (liasse.description &&
        liasse.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter =
      filterActive === null || liasse.isActive === filterActive;
    return matchesSearch && matchesFilter;
  });

  // Gestion des modals
  const handleOpenModal = (liasse?: LiasseWithSerie) => {
    setSelectedLiasse(liasse || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLiasse(null);
  };

  const handleOpenDeleteModal = (liasse: LiasseWithSerie) => {
    setLiasseToDelete(liasse);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setLiasseToDelete(null);
  };

  // Actions CRUD
  const handleCreate = () => {
    handleOpenModal();
  };

  const handleEdit = (liasse: LiasseWithSerie) => {
    handleOpenModal(liasse);
  };

  const handleDelete = async () => {
    if (!liasseToDelete) return;

    try {
      setIsDeleting(true);
      const result = await deleteLiasse(liasseToDelete.id);

      if (result.success) {
        showNotification("Liasse supprimée avec succès", "success");
        await loadLiasses();
        handleCloseDeleteModal();
      } else {
        showNotification(
          result.error || "Erreur lors de la suppression",
          "error"
        );
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      showNotification("Erreur lors de la suppression", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (liasse: LiasseWithSerie) => {
    try {
      const result = await toggleLiasseStatus(liasse.id);

      if (result.success) {
        showNotification(
          `Liasse ${liasse.isActive ? "désactivée" : "activée"} avec succès`,
          "success"
        );
        await loadLiasses();
      } else {
        showNotification(
          result.error || "Erreur lors du changement de statut",
          "error"
        );
      }
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
      showNotification("Erreur lors du changement de statut", "error");
    }
  };

  const handleModalSuccess = () => {
    loadLiasses();
    showNotification(
      selectedLiasse
        ? "Liasse modifiée avec succès"
        : "Liasse créée avec succès",
      "success"
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">
          Chargement des liasses...
        </span>
      </div>
    );
  }

  return (
    <>
      {notification.visible && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
        />
      )}

      {/* Header avec actions */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Gestion des liasses
          </h3>
          <button
            onClick={handleCreate}
            className="inline-flex items-center px-4 py-2 btn-primary hover:btn-primary text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus size={16} className="mr-2" />
          </button>
        </div>

        {/* Filtres et recherche */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher une liasse..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterActive(null)}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                filterActive === null
                  ? "btn-primary text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setFilterActive(true)}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                filterActive === true
                  ? "btn-primary text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              Actives
            </button>
            <button
              onClick={() => setFilterActive(false)}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                filterActive === false
                  ? "btn-primary text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              Inactives
            </button>
          </div>
        </div>
      </div>

      {/* Liste des liasses */}
      {filteredLiasses.length === 0 ? (
        <div className="text-center py-8">
          <Folder size={48} className="mx-auto text-gray-400 mb-4" />
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {liasses.length === 0 ? "Aucune liasse" : "Aucune liasse trouvée"}
          </h4>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {liasses.length === 0
              ? "Commencez par créer votre première liasse pour cette série."
              : "Essayez de modifier vos critères de recherche."}
          </p>
          {liasses.length === 0 && (
            <button
              onClick={handleCreate}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus size={16} className="mr-2" />
              Créer la première liasse
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredLiasses.map((liasse) => (
            <div
              key={liasse.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      {liasse.name}
                    </h4>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        liasse.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                      }`}
                    >
                      {liasse.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {liasse.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {liasse.description}
                    </p>
                  )}
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Créée le{" "}
                    {new Date(liasse.createdAt).toLocaleDateString("fr-FR")}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(liasse)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    title={liasse.isActive ? "Désactiver" : "Activer"}
                  >
                    {liasse.isActive ? (
                      <ToggleRight size={20} />
                    ) : (
                      <ToggleLeft size={20} />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(liasse)}
                    className="p-2 btn-action btn-action-edit hover:btn-action btn-action-edit transition-colors"
                    title="Modifier"
                  >
                    <HugeiconsIcon icon={Edit03Icon} size={25} />
                  </button>
                  <button
                    onClick={() => handleOpenDeleteModal(liasse)}
                    className="p-2 btn-action btn-action-delete hover:btn-action btn-action-delete transition-colors"
                    title="Supprimer"
                  >
                    <HugeiconsIcon icon={Delete02Icon} size={25} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <LiasseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        serieId={serieId}
        serieName={serieName}
        liasse={selectedLiasse}
        onSuccess={handleModalSuccess}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDelete}
        liasseName={liasseToDelete?.name || ""}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default LiassesManager;
