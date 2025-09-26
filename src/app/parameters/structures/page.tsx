"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01FreeIcons,
  Delete02Icon,
  Edit03Icon,
  Search01Icon,
  Building01Icon,
} from "@hugeicons/core-free-icons";
import ConfirmationDialog from "@/components/ui/confirmationDialog";

import useNotification from "@/app/hooks/useNotifications";
import Notification from "@/components/ui/notifications";
import AdminLayout from "@/app/adminLayout";
import { getStructures, deleteStructure, toggleStructureStatus } from "./actions";
import AdminHeaders from "@/app/components/adminHeader";
import MySpinner from "@/components/ui/my-spinner";

interface Structure {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}


const StructurePage: React.FC = () => {
  const [structures, setStructures] = useState<Structure[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const { notification, showNotification, hideNotification } =
    useNotification();

  useEffect(() => {
    const fetchData = async () => {
      const start = Date.now();
      try {
        const result = await getStructures();
        const elapsed = Date.now() - start;
        
        if (result.success && result.data) {
          setStructures(result.data);
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
        console.error("Erreur lors du chargement des structures:", error);
        showNotification("Erreur lors du chargement des structures", "error");
        setLoading(false); // Arrêter le loading immédiatement en cas d'erreur
      }
    };
    fetchData();
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredStructures = structures.filter((structure) =>
    Object.values(structure).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleCreate = () => {
    router.push("/parameters/structures/new");
  };

  const handleEdit = (id: number) => {
    router.push(`/parameters/structures/edit/${id}`);
  };

  const handleDelete = async (id: number) => {
    setItemToDeleteId(id);
    setShowDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDeleteId !== null) {
      try {
        const result = await deleteStructure(itemToDeleteId);

        if (result.success) {
          setStructures((prevStructures) =>
            prevStructures.filter((structure) => structure.id !== itemToDeleteId)
          );
          showNotification("Structure supprimée avec succès !", "success");
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
      const result = await toggleStructureStatus(id);
      if (result.success) {
        setStructures((prevStructures) =>
          prevStructures.map((structure) =>
            structure.id === id
              ? { ...structure, isActive: !structure.isActive }
              : structure
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


  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
          <MySpinner size="lg" color="primary" />
          <p className="mt-4 text-gray-600 font-medium">
            Chargement des structures...
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {notification.visible && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
        />
      )}

      <AdminHeaders
        title="Gestion des structures"
        desc="Gérez les structures du système d'archivage"
      />

      <div className="w-full mx-auto mt-8 px-4 sm:px-6 lg:px-0">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {/* Header avec actions */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Structures
              </h3>
              <button
                onClick={handleCreate}
                className="inline-flex items-center px-4 py-2 btn-primary hover:btn-primary text-white text-sm font-medium rounded-lg transition-colors"
              >
                <HugeiconsIcon icon={Add01FreeIcons} size={20} />
              </button>
            </div>

            {/* Filtres et recherche */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <HugeiconsIcon
                    icon={Search01Icon}
                    size={16}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Rechercher une structure..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Liste des structures */}
          <div className="px-6 py-4">
            {filteredStructures.length === 0 ? (
              <div className="text-center py-8">
                <HugeiconsIcon
                  icon={Building01Icon}
                  size={48}
                  className="mx-auto text-gray-400 mb-4"
                />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {structures.length === 0
                    ? "Aucune structure"
                    : "Aucune structure trouvée"}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {structures.length === 0
                    ? "Commencez par créer votre première structure."
                    : "Essayez de modifier vos critères de recherche."}
                </p>
                {structures.length === 0 && (
                  <button
                    onClick={handleCreate}
                    className="inline-flex items-center px-4 py-2 btn-primary hover:btn-primary text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <HugeiconsIcon icon={Add01FreeIcons} size={16} className="mr-2" />
                    Créer la première structure
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredStructures.map((structure) => (
                  <div
                    key={structure.id}
                    className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <HugeiconsIcon
                          icon={Building01Icon}
                          size={24}
                          className="text-gray-400"
                        />
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {structure.name}
                          </h4>
                          <div className="mt-1 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            {structure.address && (
                              <p>
                                <span className="font-medium">Adresse:</span> {structure.address}
                              </p>
                            )}
                            {structure.phone && (
                              <p>
                                <span className="font-medium">Téléphone:</span> {structure.phone}
                              </p>
                            )}
                            {structure.email && (
                              <p>
                                <span className="font-medium">Email:</span> {structure.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleToggleStatus(structure.id)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          structure.isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                        }`}
                      >
                        {structure.isActive ? "Actif" : "Inactif"}
                      </button>

                      <button
                        onClick={() => handleEdit(structure.id)}
                        className="p-2 text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
                        title="Modifier"
                      >
                        <HugeiconsIcon icon={Edit03Icon} size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(structure.id)}
                        className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                        title="Supprimer"
                      >
                        <HugeiconsIcon icon={Delete02Icon} size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmation */}
      {showDialog && (
        <ConfirmationDialog
          isOpen={showDialog}
          title="Confirmation de suppression"
          message="Voulez-vous vraiment supprimer cette structure ?"
          onConfirm={handleConfirmDelete}
          onClose={handleCancelDelete}
        />
      )}
    </AdminLayout>
  );
};

export default StructurePage;
