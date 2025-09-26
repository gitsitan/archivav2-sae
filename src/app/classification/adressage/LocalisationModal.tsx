"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Save } from "lucide-react";
import {
  createLocalisation,
  updateLocalisation,
  getParentLocalisations,
  getLocalisationById,
  LocalisationWithParent,
} from "./actions";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Edit01Icon,
  Edit02Icon,
  Edit03Icon,
} from "@hugeicons/core-free-icons";

interface LocalisationModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentId?: number;
  parentName?: string;
  localisation?: LocalisationWithParent | null;
  onSuccess: () => void;
}

const localisationSchema = z.object({
  code: z
    .string()
    .min(1, "Le code est requis")
    .min(2, "Le code doit contenir au moins 2 caractères"),
  name: z
    .string()
    .min(1, "Le nom est requis")
    .min(2, "Le nom doit contenir au moins 2 caractères"),
  isActive: z.boolean(),
});
const LEVEL_NAME = [
  { level: 1, name: "Batiment" },
  { level: 2, name: "Salle" },
  { level: 3, name: "Rayon" },
];
type LocalisationFormData = z.infer<typeof localisationSchema>;

const LocalisationModal: React.FC<LocalisationModalProps> = ({
  isOpen,
  onClose,
  parentId,
  parentName,
  localisation,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parentLocalisations, setParentLocalisations] = useState<any[]>([]);
  const [parentLevel, setParentLevel] = useState<number>(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<LocalisationFormData>({
    resolver: zodResolver(localisationSchema),
    defaultValues: {
      code: "",
      name: "",
      isActive: true,
    },
  });

  // Fonction pour obtenir le nom du niveau
  const getLevelName = (level: number) => {
    const levelInfo = LEVEL_NAME.find((item) => item.level === level);
    return levelInfo ? levelInfo.name : "Localisation";
  };

  // Fonction pour obtenir le niveau suivant
  const getNextLevel = () => {
    if (localisation) {
      return localisation.level;
    }
    if (parentId) {
      return parentLevel + 1;
    }
    return 1; // Niveau racine
  };

  // Charger le niveau du parent
  useEffect(() => {
    if (parentId && isOpen) {
      const loadParentLevel = async () => {
        try {
          const result = await getLocalisationById(parentId);
          if (result.success && result.data) {
            setParentLevel((result.data as any).level || 0);
          }
        } catch (error) {
          console.error(
            "Erreur lors du chargement du niveau du parent:",
            error
          );
        }
      };
      loadParentLevel();
    }
  }, [parentId, isOpen]);

  // Charger les localisations parentes
  useEffect(() => {
    if (isOpen) {
      const loadParentLocalisations = async () => {
        try {
          const result = await getParentLocalisations();
          if (result.success && result.data) {
            setParentLocalisations(result.data);
          }
        } catch (error) {
          console.error(
            "Erreur lors du chargement des localisations parentes:",
            error
          );
        }
      };
      loadParentLocalisations();
    }
  }, [isOpen]);

  // Réinitialiser le formulaire quand le modal s'ouvre/ferme ou quand la localisation change
  useEffect(() => {
    if (isOpen) {
      if (localisation) {
        reset({
          code: localisation.code,
          name: localisation.name,
          isActive: localisation.isActive,
        });
      } else {
        reset({
          code: "",
          name: "",
          isActive: true,
        });
      }
      setError(null);
    }
  }, [isOpen, localisation, reset]);

  const onSubmit = async (data: LocalisationFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      console.log(
        "Modal onSubmit - parentId:",
        parentId,
        "parentName:",
        parentName
      );

      const localisationData = {
        ...data,
        parentId: parentId || undefined,
      };

      const result = localisation
        ? await updateLocalisation(localisation.id, localisationData)
        : await createLocalisation(localisationData);

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
              {localisation
                ? `Modifier le ${getLevelName(
                    localisation.level
                  ).toLowerCase()}`
                : `Nouveau ${getLevelName(getNextLevel()).toLowerCase()}`}
            </h3>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Body */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="px-6 py-4 space-y-4"
          >
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Info parent */}
            {parentName && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Localisation parente :</strong> {parentName}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  ✓ Le niveau sera calculé automatiquement selon la localisation
                  parente
                </p>
              </div>
            )}

            {/* Code */}
            <div>
              <label
                htmlFor="code"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="code"
                {...register("code")}
                className="block w-full py-2 px-3 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder={`Ex: ${getLevelName(
                  getNextLevel()
                ).toUpperCase()}001`}
                disabled={isSubmitting}
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
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                {...register("name")}
                className="block w-full py-2 px-3 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder={`Ex: ${getLevelName(getNextLevel())} 101`}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.name.message}
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
                Actif
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
                className="px-4 py-2 text-sm font-medium text-white btn-primary hover:btn-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center"
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
                    {localisation ? "Modification..." : "Création..."}
                  </>
                ) : (
                  <>
                    <HugeiconsIcon
                      icon={localisation ? Edit03Icon : Add01Icon}
                      size={16}
                      className="mr-2"
                    />
                    {localisation ? "Modifier" : "Créer"}
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

export default LocalisationModal;
