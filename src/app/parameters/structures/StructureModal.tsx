"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Save } from "lucide-react";
import {
  createStructure,
  updateStructure,
  getStructuresForSelection,
  getStructureById,
  StructureWithChildren,
} from "./actions";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Edit01Icon,
  Edit02Icon,
  Edit03Icon,
} from "@hugeicons/core-free-icons";

const MAX_LEVEL = 3;

const LEVEL_NAME = [
  { level: 1, name: "Direction" },
  { level: 2, name: "Département" },
  { level: 3, name: "Service" },
];

interface StructureModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentId?: number;
  parentName?: string;
  structure?: StructureWithChildren | null;
  onSuccess: () => void;
}

const structureSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom est requis")
    .min(2, "Le nom doit contenir au moins 2 caractères"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Format d'email invalide").optional().or(z.literal("")),
  isActive: z.boolean(),
});

type StructureFormData = z.infer<typeof structureSchema>;

const StructureModal: React.FC<StructureModalProps> = ({
  isOpen,
  onClose,
  parentId,
  parentName,
  structure,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parentStructures, setParentStructures] = useState<any[]>([]);
  const [parentLevel, setParentLevel] = useState<number>(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<StructureFormData>({
    resolver: zodResolver(structureSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      email: "",
      isActive: true,
    },
  });

  // Fonction pour obtenir le niveau suivant
  const getNextLevel = () => {
    if (structure) {
      return structure.niveau;
    }
    if (parentId) {
      return parentLevel + 1;
    }
    return 1; // Niveau racine
  };

  // Vérifier si on peut ajouter des enfants
  const canAddChild = getNextLevel() < MAX_LEVEL;

  // Fonction pour obtenir le nom du niveau
  const getLevelName = (level: number) => {
    const levelInfo = LEVEL_NAME.find((item) => item.level === level);
    return levelInfo ? levelInfo.name : "Structure";
  };

  // Charger le niveau du parent
  useEffect(() => {
    if (parentId && isOpen) {
      const loadParentLevel = async () => {
        try {
          const result = await getStructureById(parentId);
          if (result.success && result.data) {
            setParentLevel((result.data as any).niveau || 0);
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

  // Charger les structures parentes
  useEffect(() => {
    if (isOpen) {
      const loadParentStructures = async () => {
        try {
          const result = await getStructuresForSelection();
          if (result.success && result.data) {
            setParentStructures(result.data);
          }
        } catch (error) {
          console.error(
            "Erreur lors du chargement des structures parentes:",
            error
          );
        }
      };
      loadParentStructures();
    }
  }, [isOpen]);

  // Réinitialiser le formulaire quand le modal s'ouvre/ferme ou quand la structure change
  useEffect(() => {
    if (isOpen) {
      if (structure) {
        reset({
          name: structure.name,
          address: structure.address || "",
          phone: structure.phone || "",
          email: structure.email || "",
          isActive: structure.isActive,
        });
      } else {
        reset({
          name: "",
          address: "",
          phone: "",
          email: "",
          isActive: true,
        });
      }
      setError(null);
    }
  }, [isOpen, structure, reset]);

  const onSubmit = async (data: StructureFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      console.log(
        "Modal onSubmit - parentId:",
        parentId,
        "parentName:",
        parentName
      );

      const structureData = {
        ...data,
        parentId: parentId || undefined,
      };

      const result = structure
        ? await updateStructure(structure.id, structureData)
        : await createStructure(structureData);

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
        <div className="relative w-full max-w-lg transform rounded-lg bg-white dark:bg-gray-800 shadow-xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {structure
                ? `Modifier la ${getLevelName(structure.niveau).toLowerCase()}`
                : `Nouvelle ${getLevelName(getNextLevel()).toLowerCase()}`}
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
                  <strong>{getLevelName(parentLevel)} parente :</strong> {parentName}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  ✓ Le niveau sera calculé automatiquement selon la structure parente
                </p>
                {!canAddChild && (
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                    ⚠️ Niveau maximum atteint ({MAX_LEVEL}). Cette structure ne pourra pas avoir de sous-structures.
                  </p>
                )}
              </div>
            )}

            {/* Nom */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Nom de la {getLevelName(getNextLevel()).toLowerCase()} <span className="text-red-500">*</span>
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

            {/* Adresse */}
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
                {...register("address")}
                className="block w-full py-2 px-3 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ex: Avenue Charles de Gaulle, N'Djamena"
                disabled={isSubmitting}
              />
              {errors.address && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.address.message}
                </p>
              )}
            </div>

            {/* Téléphone et Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  {...register("phone")}
                  className="block w-full py-2 px-3 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Ex: +235 XX XX XX XX"
                  disabled={isSubmitting}
                />
                {errors.phone && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.phone.message}
                  </p>
                )}
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
                  {...register("email")}
                  className="block w-full py-2 px-3 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Ex: contact@ministere.gouv.td"
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
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
                    {structure ? "Modification..." : "Création..."}
                  </>
                ) : (
                  <>
                    <HugeiconsIcon
                      icon={structure ? Edit03Icon : Add01Icon}
                      size={16}
                      className="mr-2"
                    />
                    {structure ? "Modifier" : "Créer"}
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

export default StructureModal;
