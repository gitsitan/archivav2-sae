"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminHeaders from "@/app/components/adminHeader";
import {
  ArrowTurnBackwardIcon,
  Add01FreeIcons,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import z from "zod";
import useNotification from "@/app/hooks/useNotifications";
import AdminLayout from "@/app/adminLayout";
import { createStructure, getStructuresForSelection } from "../actions";
import MySpinner from "@/components/ui/my-spinner";
import Notification from "@/components/ui/notifications";

interface StructureFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
  parentId?: number;
}

interface Structure {
  id: number;
  name: string;
  niveau: number;
  parentId: number | null;
  isActive: boolean;
}

// Schéma de validation Zod
const structureSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom est requis")
    .min(2, "Le nom doit contenir au moins 2 caractères"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Format d'email invalide").optional().or(z.literal("")),
  parentId: z.number().optional(),
});

const NewStructurePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState<StructureFormData>({
    name: "",
    address: "",
    phone: "",
    email: "",
    parentId: undefined,
  });

  const [structures, setStructures] = useState<Structure[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { notification, showNotification, hideNotification } =
    useNotification();

  useEffect(() => {
    const loadStructures = async () => {
      const start = Date.now();
      try {
        const result = await getStructuresForSelection();
        const elapsed = Date.now() - start;
        
        if (result.success && result.data) {
          setStructures(result.data);
        }
        
        // Pré-remplir le parentId si présent dans l'URL
        const parentIdParam = searchParams.get('parentId');
        if (parentIdParam) {
          setFormData(prev => ({
            ...prev,
            parentId: parseInt(parentIdParam)
          }));
        }
        
        const minLoadingTime = 800;
        const remaining = minLoadingTime - elapsed;
        
        if (remaining > 0) {
          setTimeout(() => setLoading(false), remaining);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des structures:", error);
        setLoading(false);
      }
    };
    
    loadStructures();
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (error) setError(null);
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: name === 'parentId' ? (value ? parseInt(value) : undefined) : value 
    });
  };

  const handleBack = () => {
    router.back();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const validation = structureSchema.safeParse(formData);

    if (!validation.success) {
      const firstError =
        validation.error.issues[0]?.message || "Erreur de validation.";
      setError(firstError);
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await createStructure(validation.data);

      if (result.success) {
        showNotification("Structure créée avec succès !", "success");
        setTimeout(() => router.push("/parameters/structures"), 2000);
      } else {
        setError(result.error || "Erreur lors de la création.");
        showNotification(result.error || "Erreur lors de la création", "error");
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
              title="Nouvelle Structure"
              desc="Créez une nouvelle structure dans le système d'archivage."
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
                <form onSubmit={handleSubmit} className="px-6 py-8 space-y-6">
                  {error && (
                    <div
                      className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative"
                      role="alert"
                    >
                      <span className="block sm:inline">{error}</span>
                    </div>
                  )}
                  
                  <div>
                    <label
                      htmlFor="parentId"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Structure parent
                    </label>
                    <select
                      id="parentId"
                      name="parentId"
                      value={formData.parentId || ""}
                      onChange={handleChange}
                      className="block w-full py-3 px-4 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600"
                    >
                      <option value="">Aucune (Structure racine)</option>
                      {structures
                        .filter(structure => structure.isActive)
                        .map((structure) => (
                          <option key={structure.id} value={structure.id}>
                            {"— ".repeat(structure.niveau - 1)}{structure.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Nom de la structure{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="block w-full py-3 px-4 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600"
                      placeholder="Ex: Ministère de l'Éducation"
                      required
                    />
                  </div>
                  
                  <div>
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Adresse
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="block w-full py-3 px-4 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600"
                      placeholder="Ex: Avenue Charles de Gaulle, N'Djamena"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Téléphone
                      </label>
                      <input
                        type="text"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="block w-full py-3 px-4 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600"
                        placeholder="Ex: +235 XX XX XX XX"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="block w-full py-3 px-4 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600"
                        placeholder="Ex: contact@ministere.gouv.td"
                      />
                    </div>
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
                          Création...
                        </span>
                      ) : (
                        <>
                          <HugeiconsIcon
                            icon={Add01FreeIcons}
                            size={24}
                            className="mr-3"
                          />
                          Créer
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

export default NewStructurePage;
