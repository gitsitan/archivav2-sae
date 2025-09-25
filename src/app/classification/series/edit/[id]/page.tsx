"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminHeaders from "@/app/components/adminHeader";
import {
  ArrowTurnBackwardIcon,
  Edit01FreeIcons,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import z from "zod";
import useNotification from "@/app/hooks/useNotifications";
import AdminLayout from "@/app/adminLayout";
import { getSerieById, updateSerie, getParentSeries } from "../../actions";
import MySpinner from "@/components/ui/my-spinner";
import Notification from "@/components/ui/notifications";
import LiassesManager from "../../liasses/LiassesManager";

interface ParentSerie {
  id: number;
  name: string;
  code: string;
  level: number;
}

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
  parent?: { id: number; name: string; code: string } | null;
  children?: { id: number; name: string; code: string }[];
}

interface SerieFormData {
  code: string;
  name: string;
  description: string;
  parentId: number | null;
  dcl: number;
  dua: number;
  isActive: boolean;
}

// Schéma de validation Zod
const serieSchema = z.object({
  code: z
    .string()
    .min(1, "Le code est requis")
    .min(2, "Le code doit contenir au moins 2 caractères"),
  name: z
    .string()
    .min(1, "Le nom est requis")
    .min(2, "Le nom doit contenir au moins 2 caractères"),
  description: z.string().optional(),
  parentId: z.number().optional(),
  dcl: z.number().min(1, "La DCL doit être au moins 1 an"),
  dua: z.number().min(1, "La DUA doit être au moins 1 an"),
  isActive: z.boolean(),
});

const UpdateSeriePage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [formData, setFormData] = useState<SerieFormData>({
    code: "",
    name: "",
    description: "",
    parentId: null,
    dcl: 10,
    dua: 1,
    isActive: true,
  });

  const [parentSeries, setParentSeries] = useState<ParentSerie[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "liasses">("details");
  const [serieLevel, setSerieLevel] = useState<number>(1);
  const { notification, showNotification, hideNotification } = useNotification();

  useEffect(() => {
    const fetchSerieData = async () => {
      const start = Date.now();

      if (!id) {
        setError("ID de la série manquant.");
        setLoading(false);
        return;
      }

      try {
        // Charger les séries parentes
        const parentResult = await getParentSeries();
        if (parentResult.success && parentResult.data) {
          setParentSeries(parentResult.data);
        }

        // Charger les données de la série
        const result = await getSerieById(Number(id));
        const elapsed = Date.now() - start;
        
        if (result.success && result.data) {
          const serie = result.data;
          setFormData({
            code: serie.code,
            name: serie.name,
            description: serie.description || "",
            parentId: serie.parentId,
            dcl: serie.dcl,
            dua: serie.dua,
            isActive: serie.isActive,
          });
          setSelectedParentId(serie.parentId);
          setSerieLevel(serie.level);
        } else {
          setError(result.error || "Série introuvable.");
        }
        
        // Ajuster le loading en fonction de la durée réelle
        const minLoadingTime = 800;
        const remaining = minLoadingTime - elapsed;
        
        if (remaining > 0) {
          setTimeout(() => setLoading(false), remaining);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Erreur de chargement des données:", err);
        setError("Erreur de chargement des données de la série.");
        setLoading(false);
      }
    };

    fetchSerieData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (error) setError(null);
    const { name, value, type } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseInt(value) || 0 : value 
    });
  };

  const handleParentChange = (parentId: number | null) => {
    setSelectedParentId(parentId);
    setFormData(prev => ({ ...prev, parentId }));
    
    // Le niveau sera calculé automatiquement côté serveur
  };

  const handleBack = () => {
    router.back();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const validation = serieSchema.safeParse(formData);

    if (!validation.success) {
      const firstError =
        validation.error.issues[0]?.message || "Erreur de validation.";
      setError(firstError);
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await updateSerie(Number(id), {
        ...validation.data,
        parentId: selectedParentId || undefined,
      });

      if (result.success) {
        showNotification("Série modifiée avec succès !", "success");
        setTimeout(() => router.push("/classification/series"), 2000);
      } else {
        setError(result.error || "Erreur lors de la mise à jour.");
        showNotification(result.error || "Erreur lors de la mise à jour", "error");
      }
    } catch (err) {
      console.error("Erreur de soumission:", err);
      setError("Une erreur inattendue est survenue. Veuillez réessayer.");
      showNotification("Une erreur inattendue est survenue", "error");
    } finally {
      setIsSubmitting(false);
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
              title={`Éditer la série ${formData.name}`}
              desc="Modifiez les informations de cette série documentaire."
            />
            {notification.visible && (
               <Notification
              message={notification.message}
              type={notification.type}
              onClose={hideNotification}
            />
            )}
            <div className="w-full mx-auto mt-8 px-4 sm:px-6 lg:px-0">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                {/* Onglets - seulement si niveau > 1 */}
                {serieLevel > 1 && (
                  <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                      <button
                        onClick={() => setActiveTab("details")}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ease-in-out ${
                          activeTab === "details"
                            ? "border-blue-500 text-blue-600 dark:text-blue-400"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                        }`}
                      >
                        Détails
                      </button>
                      <button
                        onClick={() => setActiveTab("liasses")}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ease-in-out ${
                          activeTab === "liasses"
                            ? "border-blue-500 text-blue-600 dark:text-blue-400"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                        }`}
                      >
                        Liasses (Chemises)
                      </button>
                    </nav>
                  </div>
                )}

                {/* Contenu des onglets */}
                {(serieLevel > 1 ? activeTab === "details" : true) && (
                  <form onSubmit={handleSubmit} className="px-6 py-8 space-y-6">
                  {error && (
                    <div
                      className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative"
                      role="alert"
                    >
                      <span className="block sm:inline">{error}</span>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="code"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Code de la série{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="code"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        className="block w-full py-3 px-4 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600"
                        placeholder="Ex: S001"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Nom de la série{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="block w-full py-3 px-4 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600"
                        placeholder="Ex: Correspondance générale"
                        required
                      />
                    </div>
                  </div>
                  
                  

                  {/* Série parente */}
                  <div>
                    <label
                      htmlFor="parentId"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Série parente (optionnel)
                    </label>
                    <select
                      id="parentId"
                      value={selectedParentId || ""}
                      onChange={(e) => handleParentChange(e.target.value ? parseInt(e.target.value) : null)}
                      className="block w-full py-3 px-4 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600"
                    >
                      <option value="">Aucune série parente (série racine)</option>
                      {parentSeries.map((parent) => (
                        <option key={parent.id} value={parent.id}>
                          {parent.name} ({parent.code})
                        </option>
                      ))}
                    </select>
                    {selectedParentId && (
                      <p className="text-sm text-blue-600 mt-1">
                        Le niveau sera calculé automatiquement selon la série parente
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="dcl"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        DCL (années){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        id="dcl"
                        name="dcl"
                        value={formData.dcl}
                        onChange={handleChange}
                        min="1"
                        className="block w-full py-3 px-4 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="dua"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        DUA (années){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        id="dua"
                        name="dua"
                        value={formData.dua}
                        onChange={handleChange}
                        min="1"
                        className="block w-full py-3 px-4 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="block w-full py-3 px-4 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600"
                      placeholder="Description de la série documentaire..."
                    />
                  </div>

                  {/* Statut actif */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Série active
                    </label>
                  </div>

                  {/* Note d'information */}
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      <strong>Note :</strong> 
                      <br />• <strong>DCL</strong> = Durée de Conservation Légale (durée minimale de conservation)
                      <br />• <strong>DUA</strong> = Durée d'Utilité Administrative (durée d'utilité pour l'administration)
                   
                    </p>
                  </div>

                  <div className="pt-6 flex justify-between items-center space-x-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-30 flex justify-center items-center py-3 px-4 rounded-lg font-semibold text-white transition-colors duration-200 ease-in-out ${
                        isSubmitting
                          ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                      }`}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 8l3-3.709z"
                            ></path>
                          </svg>
                          Sauvegarde...
                        </span>
                      ) : (
                        <>
                          <HugeiconsIcon
                            icon={Edit01FreeIcons}
                            size={24}
                            className="mr-3"
                          />
                          Modifier
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleBack}
                      type="button"
                      className="ml-auto w-30 flex justify-center items-center py-3 px-4 rounded-lg font-semibold text-white transition-colors duration-200 ease-in-out bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                    >
                      <HugeiconsIcon
                        icon={ArrowTurnBackwardIcon}
                        size={24}
                        className="mr-3"
                      />
                      Annuler
                    </button>
                  </div>
                  </form>
                )}

                {/* Onglet Liasses - seulement si niveau > 1 */}
                {serieLevel > 1 && activeTab === "liasses" && (
                  <div className="px-6 py-8">
                    <LiassesManager 
                      serieId={Number(id)} 
                      serieName={formData.name || "Série"} 
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </AdminLayout>
    </>
  );
};

export default UpdateSeriePage;
