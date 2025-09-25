"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, MapPin, Search } from "lucide-react";
import { 
  getLocalisations, 
  deleteLocalisation, 
  toggleLocalisationStatus, 
  LocalisationWithChildren 
} from "./actions";
import LocalisationModal from "./LocalisationModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import useNotification from "@/app/hooks/useNotifications";
import Notification from "@/components/ui/notifications";
import AdminLayout from "@/app/adminLayout";
import AdminHeaders from "@/app/components/adminHeader";
import MySpinner from "@/components/ui/my-spinner";

const MAX_LEVEL = 3;

const AdressagePage: React.FC = () => {
  const [localisations, setLocalisations] = useState<LocalisationWithChildren[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLocalisation, setSelectedLocalisation] = useState<LocalisationWithChildren | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<number | undefined>(undefined);
  const [selectedParentName, setSelectedParentName] = useState<string | undefined>(undefined);
  const [localisationToDelete, setLocalisationToDelete] = useState<LocalisationWithChildren | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const { notification, showNotification, hideNotification } = useNotification();

  // Charger les localisations
  const loadLocalisations = async () => {
    try {
      setLoading(true);
      const result = await getLocalisations();
      
      if (result.success && result.data) {
        setLocalisations(result.data);
        // Ouvrir tous les éléments par défaut
        const allIds = new Set<number>();
        const collectIds = (items: LocalisationWithChildren[]) => {
          items.forEach(item => {
            allIds.add(item.id);
            if (item.children) {
              collectIds(item.children);
            }
          });
        };
        collectIds(result.data);
        setExpandedItems(allIds);
      } else {
        showNotification(result.error || "Erreur lors du chargement", "error");
      }
    } catch (error) {
      console.error("Erreur lors du chargement des localisations:", error);
      showNotification("Erreur lors du chargement des localisations", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocalisations();
  }, []);

  // Filtrer les localisations
  const filterLocalisations = (items: LocalisationWithChildren[]): LocalisationWithChildren[] => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterActive === null || item.isActive === filterActive;
      
      if (matchesSearch && matchesFilter) {
        return true;
      }
      
      // Vérifier les enfants
      if (item.children && item.children.length > 0) {
        const filteredChildren = filterLocalisations(item.children);
        if (filteredChildren.length > 0) {
          return true;
        }
      }
      
      return false;
    }).map(item => ({
      ...item,
      children: item.children ? filterLocalisations(item.children) : []
    }));
  };

  const filteredLocalisations = filterLocalisations(localisations);

  // Gestion des modals
  const handleOpenModal = (parentId?: number, parentName?: string, localisation?: LocalisationWithChildren) => {
    setSelectedLocalisation(localisation || null);
    setSelectedParentId(parentId);
    setSelectedParentName(parentName);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLocalisation(null);
    setSelectedParentId(undefined);
    setSelectedParentName(undefined);
  };

  const handleOpenDeleteModal = (localisation: LocalisationWithChildren) => {
    setLocalisationToDelete(localisation);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setLocalisationToDelete(null);
  };

  // Actions CRUD
  const handleCreate = (parentId?: number, parentName?: string) => {
    console.log("Creating with parentId:", parentId, "parentName:", parentName);
    handleOpenModal(parentId, parentName);
  };

  const handleEdit = (localisation: LocalisationWithChildren) => {
    handleOpenModal(undefined, undefined, localisation);
  };

  const handleDelete = async () => {
    if (!localisationToDelete) return;

    try {
      setIsDeleting(true);
      const result = await deleteLocalisation(localisationToDelete.id);

      if (result.success) {
        showNotification("Localisation supprimée avec succès", "success");
        await loadLocalisations();
        handleCloseDeleteModal();
      } else {
        showNotification(result.error || "Erreur lors de la suppression", "error");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      showNotification("Erreur lors de la suppression", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (localisation: LocalisationWithChildren) => {
    try {
      const result = await toggleLocalisationStatus(localisation.id);

      if (result.success) {
        showNotification(
          `Localisation ${localisation.isActive ? "désactivée" : "activée"} avec succès`,
          "success"
        );
        await loadLocalisations();
      } else {
        showNotification(result.error || "Erreur lors du changement de statut", "error");
      }
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
      showNotification("Erreur lors du changement de statut", "error");
    }
  };

  const handleModalSuccess = () => {
    loadLocalisations();
    showNotification(
      selectedLocalisation ? "Localisation modifiée avec succès" : "Localisation créée avec succès",
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

  // Composant récursif pour l'affichage hiérarchique
  const LocalisationTreeItem: React.FC<{
    localisation: LocalisationWithChildren;
    level: number;
  }> = ({ localisation, level }) => {
    const hasChildren = localisation.children && localisation.children.length > 0;
    const isExpanded = expandedItems.has(localisation.id);
    const canAddChild = level < MAX_LEVEL;
    const isMaxLevel = level >= MAX_LEVEL;

    return (
      <div className="border-l-2 border-gray-200 dark:border-gray-700 ml-4">
        <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-2 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 flex-1">
            {hasChildren ? (
              <button
                onClick={() => toggleExpansion(localisation.id)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                {isExpanded ? <ToggleLeft size={16} /> : <ToggleRight size={16} />}
              </button>
            ) : (
              <div className="w-6" />
            )}
            
            <div className="flex items-center space-x-2">
   
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {localisation.name}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({localisation.code})
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      localisation.isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                    }`}
                  >
                    {localisation.isActive ? "Active" : "Inactive"}
                  </span>
      
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {canAddChild && (
              <button
                onClick={() => handleCreate(localisation.id, localisation.name)}
                className="p-2 text-green-600 hover:text-green-700 transition-colors"
                title={`Ajouter une sous-localisation (niveau ${localisation.level + 1})`}
              >
                <Plus size={16} />
              </button>
            )}
            <button
              onClick={() => handleToggleStatus(localisation)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title={localisation.isActive ? "Désactiver" : "Activer"}
            >
              {localisation.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
            </button>
            <button
              onClick={() => handleEdit(localisation)}
              className="p-2 text-indigo-600 hover:text-indigo-700 transition-colors"
              title="Modifier"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => handleOpenDeleteModal(localisation)}
              className="p-2 text-red-600 hover:text-red-700 transition-colors"
              title="Supprimer"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="ml-4">
            {localisation.children.map((child) => (
              <LocalisationTreeItem
                key={child.id}
                localisation={child}
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
            Chargement des localisations...
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
        title="Gestion des localisations"
        desc="Organisez vos localisations de manière hiérarchique (max 5 niveaux)."
      />

      <div className="w-full mx-auto mt-8 px-4 sm:px-6 lg:px-0">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {/* Header avec actions */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Localisations
              </h3>
              <button
                onClick={() => handleCreate()}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Plus size={16} className="mr-2" />
                Nouvelle localisation
              </button>
            </div>

            {/* Filtres et recherche */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher une localisation..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterActive(null)}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    filterActive === null
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  Toutes
                </button>
                <button
                  onClick={() => setFilterActive(true)}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    filterActive === true
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  Actives
                </button>
                <button
                  onClick={() => setFilterActive(false)}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    filterActive === false
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  Inactives
                </button>
              </div>
            </div>
          </div>

          {/* Liste des localisations */}
          <div className="px-6 py-4">
            {filteredLocalisations.length === 0 ? (
              <div className="text-center py-8">
                <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {localisations.length === 0 ? "Aucune localisation" : "Aucune localisation trouvée"}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {localisations.length === 0 
                    ? "Commencez par créer votre première localisation."
                    : "Essayez de modifier vos critères de recherche."
                  }
                </p>
                {localisations.length === 0 && (
                  <button
                    onClick={() => handleCreate()}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Plus size={16} className="mr-2" />
                    Créer la première localisation
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredLocalisations.map((localisation) => (
                  <LocalisationTreeItem
                    key={localisation.id}
                    localisation={localisation}
                    level={1}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <LocalisationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        parentId={selectedParentId}
        parentName={selectedParentName}
        localisation={selectedLocalisation}
        onSuccess={handleModalSuccess}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDelete}
        localisationName={localisationToDelete?.name || ""}
        isDeleting={isDeleting}
      />
    </AdminLayout>
  );
};

export default AdressagePage;
