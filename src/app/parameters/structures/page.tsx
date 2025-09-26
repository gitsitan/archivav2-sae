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
  ArrowDown01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";

import ConfirmationDialog from "@/components/ui/confirmationDialog";

import useNotification from "@/app/hooks/useNotifications";
import Notification from "@/components/ui/notifications";
import AdminLayout from "@/app/adminLayout";
import { getStructures, deleteStructure, toggleStructureStatus, StructureWithChildren } from "./actions";
import AdminHeaders from "@/app/components/adminHeader";
import MySpinner from "@/components/ui/my-spinner";
import { Plus } from "lucide-react";
import StructureModal from "./StructureModal";

const MAX_LEVEL = 3;

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
  const [structures, setStructures] = useState<StructureWithChildren[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStructure, setSelectedStructure] = useState<StructureWithChildren | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<number | undefined>(undefined);
  const [selectedParentName, setSelectedParentName] = useState<string | undefined>(undefined);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
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
          // Ouvrir tous les éléments par défaut
          const allIds = new Set<number>();
          const collectIds = (items: StructureWithChildren[]) => {
            items.forEach((item) => {
              allIds.add(item.id);
              if (item.children) {
                collectIds(item.children);
              }
            });
          };
          collectIds(result.data);
          setExpandedItems(allIds);
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

  // Fonction pour filtrer les structures selon le terme de recherche
  const filterStructures = (structures: StructureWithChildren[], searchTerm: string): StructureWithChildren[] => {
    if (!searchTerm) return structures;

    return structures
      .filter((structure) => {
        const matchesSearch =
          structure.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (structure.address && structure.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (structure.phone && structure.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (structure.email && structure.email.toLowerCase().includes(searchTerm.toLowerCase()));

        const filteredChildren =
          structure.children.length > 0
            ? filterStructures(structure.children, searchTerm)
            : [];

        return matchesSearch || filteredChildren.length > 0;
      })
      .map((structure) => ({
        ...structure,
        children:
          structure.children.length > 0
            ? filterStructures(structure.children, searchTerm)
            : [],
      }));
  };

  const filteredStructures = filterStructures(structures, searchTerm);

  const handleCreate = () => {
    setSelectedStructure(null);
    setSelectedParentId(undefined);
    setSelectedParentName(undefined);
    setIsModalOpen(true);
  };

  const handleCreateChild = (parentId: number, parentName: string) => {
    setSelectedStructure(null);
    setSelectedParentId(parentId);
    setSelectedParentName(parentName);
    setIsModalOpen(true);
  };

  const handleEdit = (structure: StructureWithChildren) => {
    setSelectedStructure(structure);
    setSelectedParentId(undefined);
    setSelectedParentName(undefined);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStructure(null);
    setSelectedParentId(undefined);
    setSelectedParentName(undefined);
  };

  const handleModalSuccess = () => {
    // Recharger les données
    const loadStructures = async () => {
      try {
        const result = await getStructures();
        if (result.success && result.data) {
          setStructures(result.data);
          // Ouvrir tous les éléments par défaut
          const allIds = new Set<number>();
          const collectIds = (items: StructureWithChildren[]) => {
            items.forEach((item) => {
              allIds.add(item.id);
              if (item.children) {
                collectIds(item.children);
              }
            });
          };
          collectIds(result.data);
          setExpandedItems(allIds);
        }
      } catch (error) {
        console.error("Erreur lors du rechargement des structures:", error);
      }
    };
    loadStructures();
    showNotification(
      selectedStructure
        ? "Structure modifiée avec succès"
        : "Structure créée avec succès",
      "success"
    );
  };

  // Gestion de l'expansion
  const toggleExpansion = (id: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
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

  const handleToggleStatus = async (structure: StructureWithChildren) => {
    try {
      const result = await toggleStructureStatus(structure.id);
      if (result.success) {
        // Recharger les données
        const loadStructures = async () => {
          try {
            const result = await getStructures();
            if (result.success && result.data) {
              setStructures(result.data);
            }
          } catch (error) {
            console.error("Erreur lors du rechargement des structures:", error);
          }
        };
        loadStructures();
        showNotification("Statut modifié avec succès !", "success");
      } else {
        showNotification(result.error || "Erreur lors de la modification", "error");
      }
    } catch (error) {
      console.error("Erreur lors de la modification du statut:", error);
      showNotification("Erreur lors de la modification du statut", "error");
    }
  };

  // Composant récursif pour l'affichage hiérarchique
  const StructureTreeItem: React.FC<{
    structure: StructureWithChildren;
    level: number;
  }> = ({ structure, level }) => {
    const hasChildren = structure.children && structure.children.length > 0;
    const isExpanded = expandedItems.has(structure.id);
    const canAddChild = level < MAX_LEVEL;

    return (
      <div className="border-l-2 border-gray-200 dark:border-gray-700 ml-4">
        <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-2 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 flex-1">
            {hasChildren ? (
              <button
                onClick={() => toggleExpansion(structure.id)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <HugeiconsIcon
                  icon={isExpanded ? ArrowDown01Icon : ArrowRight01Icon}
                  size={16}
                />
              </button>
            ) : (
              <div className="w-6" />
            )}

            <div className="flex items-center space-x-2">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {structure.name}
                  </span>
                </div>
                {(structure.address || structure.phone || structure.email) && (
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
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleToggleStatus(structure)}
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                structure.isActive
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
              }`}
            >
              {structure.isActive ? "Actif" : "Inactif"}
            </button>

            {canAddChild && (
              <button
                onClick={() => handleCreateChild(structure.id, structure.name)}
                className="p-2 hover:btn-primary transition-colors"
                title="Ajouter une sous-structure"
              >
                <HugeiconsIcon icon={Add01FreeIcons} size={20} />
              </button>
            )}
            <button
              onClick={() => handleEdit(structure)}
              className="p-2 hover:btn-primary transition-colors"
              title="Modifier"
            >
              <HugeiconsIcon icon={Edit03Icon} size={20} />
            </button>
            <button
              onClick={() => handleDelete(structure.id)}
              className="p-2 text-red-600 hover:text-red-700 transition-colors"
              title="Supprimer"
            >
              <HugeiconsIcon icon={Delete02Icon} size={20} />
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="ml-4">
            {structure.children.map((child) => (
              <StructureTreeItem
                key={child.id}
                structure={child}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
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
              <div className="space-y-2">
                {filteredStructures.map((structure) => (
                  <StructureTreeItem
                    key={structure.id}
                    structure={structure}
                    level={1}
                  />
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

      {/* Modal de structure */}
      <StructureModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        parentId={selectedParentId}
        parentName={selectedParentName}
        structure={selectedStructure}
        onSuccess={handleModalSuccess}
      />
    </AdminLayout>
  );
};

export default StructurePage;
