"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01FreeIcons,
  Delete02Icon,
  Edit03Icon,
  ArrowDown01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import ConfirmationDialog from "@/components/ui/confirmationDialog";

import useNotification from "@/app/hooks/useNotifications";
import Notification from "@/components/ui/notifications";
import AdminLayout from "@/app/adminLayout";
import { getSeries, deleteSerie, toggleSerieStatus } from "./actions";
import AdminHeaders from "@/app/components/adminHeader";
import MySpinner from "@/components/ui/my-spinner";

interface Serie {
  id: number;
  code: string;
  name: string;
  description: string | null;
  parentId: number | null;
  level: number;
  dcl: number;
  dua: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  children: Serie[];
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

const SerieTreeItem: React.FC<{
  serie: Serie;
  level: number;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number) => void;
}> = ({ serie, level, onEdit, onDelete, onToggleStatus }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = serie.children && serie.children.length > 0;

  return (
    <div className="border-l-2 border-gray-200 dark:border-gray-700 ml-4">
      <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-2 hover:shadow-md transition-shadow">
        <div className="flex items-center space-x-3">
          {hasChildren ? (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
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
            {/* <span className="text-sm font-medium text-gray-500">
              Niveau {serie.level}
            </span> */}
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {serie.name}
            </span>
            <span className="text-sm text-gray-500">({serie.code})</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <span>
              <strong>DCL:</strong> {serie.dcl} ans
            </span>
            <span>
              <strong>DUA:</strong> {serie.dua} ans
            </span>
          </div>

          <button
            onClick={() => onToggleStatus(serie.id)}
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              serie.isActive
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
            }`}
          >
            {serie.isActive ? "Actif" : "Inactif"}
          </button>

          <button
            onClick={() => onEdit(serie.id)}
            className="btn-action btn-action-edit"
          >
            <HugeiconsIcon icon={Edit03Icon} size={25} />
          </button>
          <button
            onClick={() => onDelete(serie.id)}
            className="btn-action btn-action-delete"
          >
            <HugeiconsIcon icon={Delete02Icon} size={25} />
          </button>
        </div>
      </div>

      {serie.description && (
        <div className="ml-8 mb-2 text-sm text-gray-600 dark:text-gray-400">
          {serie.description}
        </div>
      )}

      {hasChildren && isExpanded && (
        <div className="ml-4">
          {serie.children.map((child) => (
            <SerieTreeItem
              key={child.id}
              serie={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const SeriesPage: React.FC = () => {
  const [series, setSeries] = useState<Serie[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<number | null>(null);
  const router = useRouter();
  const { notification, showNotification, hideNotification } =
    useNotification();

  useEffect(() => {
    const fetchData = async () => {
      const start = Date.now();
      try {
        const result = await getSeries();
        const elapsed = Date.now() - start;

        if (result.success && result.data) {
          setSeries(result.data);
        } else {
          console.error("Erreur de l'API:", result.error);
          showNotification(
            result.error || "Erreur lors du chargement",
            "error"
          );
        }

        // Ajuster le loading en fonction de la durée réelle
        const minLoadingTime = 800;
        const remaining = minLoadingTime - elapsed;

        if (remaining > 0) {
          setTimeout(() => setLoading(false), remaining);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des séries:", error);
        showNotification("Erreur lors du chargement des séries", "error");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCreate = () => {
    router.push("/classification/series/new");
  };

  const handleEdit = (id: number) => {
    router.push(`/classification/series/edit/${id}`);
  };

  const handleDelete = async (id: number) => {
    setItemToDeleteId(id);
    setShowDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDeleteId !== null) {
      try {
        const result = await deleteSerie(itemToDeleteId);

        if (result.success) {
          // Recharger les données
          const result = await getSeries();
          if (result.success && result.data) {
            setSeries(result.data);
          }
          showNotification("Série supprimée avec succès !", "success");
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
      const result = await toggleSerieStatus(id);
      if (result.success) {
        // Recharger les données
        const result = await getSeries();
        if (result.success && result.data) {
          setSeries(result.data);
        }
        showNotification("Statut modifié avec succès !", "success");
      } else {
        showNotification(
          result.error || "Erreur lors de la modification",
          "error"
        );
      }
    } catch (error) {
      console.error("Erreur lors de la modification du statut:", error);
      showNotification("Erreur lors de la modification du statut", "error");
    }
  };

  // Fonction pour filtrer les séries selon le terme de recherche
  const filterSeries = (series: Serie[], searchTerm: string): Serie[] => {
    if (!searchTerm) return series;

    return series
      .filter((serie) => {
        const matchesSearch =
          serie.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          serie.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (serie.description &&
            serie.description.toLowerCase().includes(searchTerm.toLowerCase()));

        const filteredChildren =
          serie.children.length > 0
            ? filterSeries(serie.children, searchTerm)
            : [];

        return matchesSearch || filteredChildren.length > 0;
      })
      .map((serie) => ({
        ...serie,
        children:
          serie.children.length > 0
            ? filterSeries(serie.children, searchTerm)
            : [],
      }));
  };

  const filteredSeries = filterSeries(series, searchTerm);

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
              title="Classification des séries"
              desc="Gérez la hiérarchie des séries documentaires avec leurs durées de conservation"
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
                  placeholder="Rechercher par nom, code ou description..."
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
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Hiérarchie des séries
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    DCL = Durée de Conservation Légale | DUA = Durée d'Utilité
                    Administrative
                  </p>
                </div>

                {filteredSeries.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      {searchTerm
                        ? "Aucune série ne correspond à votre recherche"
                        : "Aucune série trouvée"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredSeries.map((serie) => (
                      <SerieTreeItem
                        key={serie.id}
                        serie={serie}
                        level={0}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onToggleStatus={handleToggleStatus}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {showDialog && (
              <ConfirmationDialog
                isOpen={showDialog}
                title="Confirmation de suppression"
                message="Voulez-vous vraiment supprimer cette série ? Cette action est irréversible."
                onConfirm={handleConfirmDelete}
                onClose={handleCancelDelete}
              />
            )}
          </>
        )}
      </AdminLayout>
    </>
  );
};

export default SeriesPage;
