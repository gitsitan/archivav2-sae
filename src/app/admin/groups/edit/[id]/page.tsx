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
import MySpinner from "@/components/ui/my-spinner";
import { updateGroup, getGroupById } from "../../actions";

// Schéma de validation Zod pour le formulaire de groupe
const groupSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom est requis")
    .min(2, "Le nom doit contenir au moins 2 caractères"),
  description: z.string().nullable().optional(),
  permissions: z.array(z.string()).optional(),
});

type GroupFormData = z.infer<typeof groupSchema>;

// Typage des props de la page, notamment les paramètres de l'URL
interface EditGroupPageProps {
  params: {
    id: string;
  };
}

const EditGroupPage = ({ params }: EditGroupPageProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [permissionsList, setPermissionsList] = useState<any[]>([]);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<GroupFormData>({
    resolver: zodResolver(groupSchema),
  });

  const { notification, showNotification, hideNotification } =
    useNotification();
  const groupId = params.id;

  useEffect(() => {
    // Fonction asynchrone pour charger les données
    const loadData = async () => {
      setLoading(true);
      try {
        // Chargement des données du groupe à éditer
        const groupResult = await getGroupById(groupId);

        if (groupResult.success && groupResult.data) {
          const group = groupResult.data;
          setValue("name", group.name);
          setValue("description", group.description);
          setValue("permissions", group.permissions);
        } else {
          showNotification(groupResult.error || "Groupe non trouvé.", "error");
          router.push("/admin/groups");
          return;
        }

        // Chargement des permissions depuis le fichier public
        const permissionsResponse = await fetch("/data/permissions.json");
        if (!permissionsResponse.ok) {
          throw new Error("Failed to fetch permissions data");
        }
        const permissionsData = await permissionsResponse.json();
        setPermissionsList(permissionsData);
      } catch (error) {
        console.error("Erreur de chargement des données:", error);
        showNotification("Erreur de chargement des données", "error");
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };
    loadData();
  }, [groupId, setValue, router, showNotification]);

  const handleBack = () => {
    router.back();
  };

  const onSubmit = async (data: GroupFormData) => {
    try {
      setIsSubmitting(true);
      const result = await updateGroup(groupId, data);

      if (result.success) {
        showNotification("Groupe mis à jour avec succès !", "success");
        setTimeout(() => router.push("/admin/groups"), 2000);
      } else {
        showNotification(
          result.error || "Erreur lors de la mise à jour.",
          "error"
        );
      }
    } catch (err) {
      console.error("Erreur de soumission:", err);
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
          <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <MySpinner size="lg" color="primary" />
            <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
              Chargement ...
            </p>
          </div>
        ) : (
          <>
            <AdminHeaders
              title="Modifier le Groupe"
              desc="Mettez à jour les informations et les permissions de ce groupe."
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
                  <div className="grid grid-cols-1 gap-6">
                    {/* Nom du groupe */}
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                      >
                        Nom du groupe <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        {...register("name")}
                        className="block w-full py-3 px-4 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600"
                      />
                      {errors.name && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    {/* Liste de cases à cocher pour les permissions */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Permissions
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
                        {permissionsList.map((permission) => (
                          <div key={permission.id} className="flex items-start">
                            <input
                              type="checkbox"
                              id={permission.id}
                              value={permission.id}
                              {...register("permissions")}
                              className="mt-1 h-4 w-4 text-blue-600 bg-gray-200 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <div className="ml-3 text-sm">
                              <label
                                htmlFor={permission.id}
                                className="font-medium text-gray-700 dark:text-gray-300"
                              >
                                {permission.name}
                              </label>
                              <p className="text-gray-500 dark:text-gray-400">
                                {permission.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Description du groupe */}
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
                      />
                      {errors.description && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.description.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Boutons d'action */}
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

export default EditGroupPage;
