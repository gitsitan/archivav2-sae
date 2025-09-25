"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { HugeiconsIcon } from "@hugeicons/react";
import { CosIcon } from "@hugeicons/core-free-icons";
import { createLiasse, updateLiasse, LiasseWithSerie } from "./actions";

interface LiasseModalProps {
  isOpen: boolean;
  onClose: () => void;
  serieId: number;
  serieName: string;
  liasse?: LiasseWithSerie | null;
  onSuccess: () => void;
}

const liasseSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom est requis")
    .min(2, "Le nom doit contenir au moins 2 caractères"),
  description: z.string().optional(),
  isActive: z.boolean(),
});

type LiasseFormData = z.infer<typeof liasseSchema>;

const LiasseModal: React.FC<LiasseModalProps> = ({
  isOpen,
  onClose,
  serieId,
  serieName,
  liasse,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LiasseFormData>({
    resolver: zodResolver(liasseSchema),
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
    },
  });

  // Réinitialiser le formulaire quand le modal s'ouvre/ferme ou quand la liasse change
  useEffect(() => {
    if (isOpen) {
      if (liasse) {
        reset({
          name: liasse.name,
          description: liasse.description || "",
          isActive: liasse.isActive,
        });
      } else {
        reset({
          name: "",
          description: "",
          isActive: true,
        });
      }
      setError(null);
    }
  }, [isOpen, liasse, reset]);

  const onSubmit = async (data: LiasseFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const liasseData = {
        ...data,
        serieId,
      };

      const result = liasse
        ? await updateLiasse(liasse.id, liasseData)
        : await createLiasse(liasseData);

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.error || "Une erreur est survenue");
      }
    } catch (err) {
      console.error("Erreur lors de la soumission:", err);
      setError("Une erreur inattendue est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleClose}
        />
        
        {/* Modal */}
        <div className="relative w-full max-w-md transform rounded-lg bg-white dark:bg-gray-800 shadow-xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {liasse ? "Modifier la liasse" : "Nouvelle liasse"}
            </h3>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <HugeiconsIcon icon={CosIcon} size={24} />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4 space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Info série */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Série :</strong> {serieName}
              </p>
            </div>

            {/* Nom */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Nom de la liasse <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                {...register("name")}
                className="block w-full py-2 px-3 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ex: Liasse 2023"
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                {...register("description")}
                rows={3}
                className="block w-full py-2 px-3 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Description de la liasse..."
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
              <label
                htmlFor="isActive"
                className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
              >
                Liasse active
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 8l3-3.709z"
                      />
                    </svg>
                    {liasse ? "Modification..." : "Création..."}
                  </>
                ) : (
                  <>
                    <HugeiconsIcon icon={CosIcon} size={16} className="mr-2" />
                    {liasse ? "Modifier" : "Créer"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LiasseModal;
