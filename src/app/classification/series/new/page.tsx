"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import AdminHeaders from "@/app/components/adminHeader";
import useNotification from "@/app/hooks/useNotifications";
import Notification from "@/components/ui/notifications";
import { Save } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowTurnBackwardIcon } from "@hugeicons/core-free-icons";
import AdminLayout from "@/app/adminLayout";
import { createSerie, getParentSeries } from "../actions";
import MySpinner from "@/components/ui/my-spinner";

interface ParentSerie {
  id: number;
  name: string;
  code: string;
  level: number;
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

type SerieFormData = z.infer<typeof serieSchema>;

const CreateSeriePage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [parentSeries, setParentSeries] = useState<ParentSerie[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SerieFormData>({
    resolver: zodResolver(serieSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      parentId: undefined,
      dcl: 10,
      dua: 1,
      isActive: true,
    },
  });

  const { notification, showNotification, hideNotification } = useNotification();

  useEffect(() => {
    const start = Date.now();
    const fetchParentSeries = async () => {
      try {
        const result = await getParentSeries();
        if (result.success && result.data) {
          setParentSeries(result.data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des séries parentes:", error);
      }
    };
    fetchParentSeries();
    
    const elapsed = Date.now() - start;
    const minLoadingTime = 800;
    const remaining = minLoadingTime - elapsed;

    if (remaining > 0) {
      setTimeout(() => setLoading(false), remaining);
    } else {
      setLoading(false);
    }
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleParentChange = (parentId: number | null) => {
    setSelectedParentId(parentId);
    setValue("parentId", parentId || undefined);
    
    // Le niveau sera calculé automatiquement côté serveur
  };

  const onSubmit = async (data: SerieFormData) => {
    try {
      setIsSubmitting(true);
      
      const result = await createSerie({
        ...data,
        parentId: selectedParentId || undefined,
      });

      if (result.success) {
        showNotification("Série créée avec succès !", "success");
        setTimeout(() => router.push("/classification/series"), 2000);
      } else {
        showNotification(
          result.error || "Erreur lors de la création.",
          "error"
        );
      }
    } catch (err) {
      showNotification(
        "Une erreur inattendue est survenue. Veuillez réessayer.",
        "error"
      );
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
              title="Créer une série"
              desc="Ajoutez une nouvelle série documentaire au système de classification."
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
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="px-6 py-8 space-y-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Code */}
                    <div>
                      <label
                        htmlFor="code"
                        className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                      >
                        Code de la série <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="code"
                        {...register("code")}
                        className="block w-full py-3 px-4 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600"
                        placeholder="Ex: S001"
                      />
                      {errors.code && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.code.message}
                        </p>
                      )}
                    </div>

                    {/* Nom */}
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                      >
                        Nom de la série <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        {...register("name")}
                        className="block w-full py-3 px-4 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600"
                        placeholder="Ex: Correspondance générale"
                      />
                      {errors.name && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.name.message}
                        </p>
                      )}
                    </div>
                  </div>

                

                  {/* Série parente */}
                  <div>
                    <label
                      htmlFor="parentId"
                      className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
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
                    {/* DCL */}
                    <div>
                      <label
                        htmlFor="dcl"
                        className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                      >
                        DCL (années) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        id="dcl"
                        {...register("dcl", { valueAsNumber: true })}
                        min="1"
                        className="block w-full py-3 px-4 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600"
                      />
                      {errors.dcl && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.dcl.message}
                        </p>
                      )}
                    </div>

                    {/* DUA */}
                    <div>
                      <label
                        htmlFor="dua"
                        className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                      >
                        DUA (années) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        id="dua"
                        {...register("dua", { valueAsNumber: true })}
                        min="1"
                        className="block w-full py-3 px-4 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600"
                      />
                      {errors.dua && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.dua.message}
                        </p>
                      )}
                    </div>
                  </div>
  {/* Description */}
  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      {...register("description")}
                      rows={3}
                      className="block w-full py-3 px-4 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600"
                      placeholder="Description de la série documentaire..."
                    />
                    {errors.description && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.description.message}
                      </p>
                    )}
                  </div>
                  {/* Statut actif */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      {...register("isActive")}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Série active
                    </label>
                  </div>

                  {/* Note d'information */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Note :</strong> 
                      <br />• <strong>DCL</strong> = Durée de Conservation Légale (durée minimale de conservation)
                      <br />• <strong>DUA</strong> = Durée d'Utilité Administrative (durée d'utilité pour l'administration)
   
                    </p>
                  </div>

                  {/* Submit */}
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
                          <Save size={24} className="mr-3" />
                          Enregistrer
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
              </div>
            </div>
          </>
        )}
      </AdminLayout>
    </>
  );
};

export default CreateSeriePage;
