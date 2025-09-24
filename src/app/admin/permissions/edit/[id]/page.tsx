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
import { updateGroupPermissions, getGroupPermissionsById } from "../../actions";

// Schéma de validation Zod pour le formulaire de permissions
const permissionsSchema = z.object({
  permissions: z.array(z.string()).optional(),
  name: z
    .string()
    .min(1, "Le nom est requis")
    .min(2, "Le nom doit contenir au moins 2 caractères"),
  detailedPermissions: z
    .record(z.string(), z.record(z.string(), z.boolean()))
    .optional(),
});

type PermissionFormData = z.infer<typeof permissionsSchema>;

// Interface pour les permissions disponibles
interface AvailablePermission {
  id: string;
  name: string;
  description: string;
  category: string;
  actions: string[];
}

interface EditPermissionsPageProps {
  params: Promise<{
    id: string;
  }>;
}

const EditPermissionsPage = ({ params }: EditPermissionsPageProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [groupName, setGroupName] = useState("");
  const [permissionsList, setPermissionsList] = useState<AvailablePermission[]>(
    []
  );
  const [detailedPermissions, setDetailedPermissions] = useState<{
    [key: string]: { [key: string]: boolean };
  }>({});
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PermissionFormData>({
    resolver: zodResolver(permissionsSchema),
  });

  const { notification, showNotification, hideNotification } =
    useNotification();
  const resolvedParams = React.use(params);
  const groupId = resolvedParams.id;

  // Fonction pour traduire les actions
  const translateAction = (action: string) => {
    switch (action) {
      case "C":
        return "Créer";
      case "U":
        return "Modifier";
      case "D":
        return "Supprimer";
      default:
        return action;
    }
  };
  const [activeTab, setActiveTab] = useState("permissionf");

  const tabs = [{ id: "permissionf", label: "Permissions sur les fonctionnalités" },{ id: "permissionr", label: "Permissions sur les ressources"  }];

  const handleDetailedPermissionChange = (
    permissionId: string,
    action: string,
    checked: boolean
  ) => {
    setDetailedPermissions((prev) => ({
      ...prev,
      [permissionId]: {
        ...prev[permissionId],
        [action]: checked,
      },
    }));
  };

  const hasSelectedActions = (permissionId: string) => {
    const actions = detailedPermissions[permissionId] || {};
    return Object.values(actions).some((checked) => checked);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      try {
        const groupResult = await getGroupPermissionsById(groupId);

        if (groupResult.success && groupResult.data) {
          const group = groupResult.data;
          setValue("permissions", group.permissions);
          setValue("name", group.name);
          setGroupName(group.name);

          const initialDetailedPermissions: {
            [key: string]: { [key: string]: boolean };
          } = {};
          group.permissions.forEach((perm: string) => {
            const [resource, action] = perm.split(".");
            if (action) {
              if (!initialDetailedPermissions[resource]) {
                initialDetailedPermissions[resource] = {};
              }
              initialDetailedPermissions[resource][action] = true;
            }
          });
          setDetailedPermissions(initialDetailedPermissions);
        } else {
          showNotification(groupResult.error || "Groupe non trouvé.", "error");
          router.push("/admin/permissions");
          return;
        }

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

  const onSubmit = async (data: PermissionFormData) => {
    try {
      setIsSubmitting(true);

      const detailedPermissionsArray: string[] = [];
      Object.entries(detailedPermissions).forEach(([permissionId, actions]) => {
        Object.entries(actions).forEach(([action, checked]) => {
          if (checked) {
            detailedPermissionsArray.push(`${permissionId}.${action}`);
          }
        });
      });

      const result = await updateGroupPermissions(groupId, {
        permissions: [...(data.permissions || []), ...detailedPermissionsArray],
      });

      if (result.success) {
        showNotification("Permissions mises à jour avec succès !", "success");
        setTimeout(() => router.push("/admin/permissions"), 2000);
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
              title={`Permissions du groupe [${groupName}]`}
              desc="Mettez à jour les permissions de ce groupe d'utilisateurs."
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
                {/* Structure des onglets */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <nav className="-mb-px flex space-x-8 px-6">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ease-in-out ${
                          activeTab === tab.id
                            ? "border-blue-500 text-blue-600 dark:text-blue-400"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Contenu du formulaire à l'intérieur de l'onglet */}
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="px-6 py-8 space-y-6"
                >
                  <div className="grid grid-cols-1 gap-6">
                    {/* Contenu de l'onglet "Général" */}
                    {activeTab === "permissionf" && (
                      <>
                        {/* Liste de cases à cocher pour les permissions */}
                        <div>
                     
                          
                          {/* Grouper les permissions par catégorie */}
                          {(() => {
                            const groupedPermissions = permissionsList.reduce((acc, permission) => {
                              const category = permission.category || 'Autres';
                              if (!acc[category]) {
                                acc[category] = [];
                              }
                              acc[category].push(permission);
                              return acc;
                            }, {} as Record<string, AvailablePermission[]>);

                            return Object.entries(groupedPermissions).map(([category, permissions]) => (
                              <div key={category} className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 pb-2 border-b border-gray-200 dark:border-gray-600">
                                  {category}
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
                                  {permissions.map((permission) => (
                                    <div
                                      key={permission.id}
                                      className="flex items-start"
                                    >
                                      <input
                                        type="checkbox"
                                        id={permission.id}
                                        value={permission.id}
                                        {...register("permissions")}
                                        className="mt-1 h-4 w-4 text-blue-600 bg-gray-200 border-gray-300 rounded focus:ring-blue-500"
                                      />
                                      <div className="ml-3 text-sm flex-1">
                                        <label
                                          htmlFor={permission.id}
                                          className="font-medium text-gray-700 dark:text-gray-300"
                                        >
                                          {permission.name}
                                        </label>
                                        <p className="text-gray-500 dark:text-gray-400 mb-2">
                                          {permission.description}
                                        </p>

                                        <div className="mt-2">
                                          <details className="group">
                                            <summary className="cursor-pointer text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                                              Actions détaillées ▼
                                            </summary>
                                            <div className="mt-2 ml-2 space-y-1">
                                              {permission.actions.map((action) => (
                                                <div
                                                  key={action}
                                                  className="flex items-center"
                                                >
                                                  <input
                                                    type="checkbox"
                                                    id={`${permission.id}-${action}`}
                                                    checked={
                                                      detailedPermissions[
                                                        permission.id
                                                      ]?.[action] || false
                                                    }
                                                    onChange={(e) =>
                                                      handleDetailedPermissionChange(
                                                        permission.id,
                                                        action,
                                                        e.target.checked
                                                      )
                                                    }
                                                    className="h-3 w-3 text-green-600 bg-gray-200 border-gray-300 rounded focus:ring-green-500"
                                                  />
                                                  <label
                                                    htmlFor={`${permission.id}-${action}`}
                                                    className="ml-2 text-xs text-gray-600 dark:text-gray-400 capitalize"
                                                  >
                                                    {translateAction(action)}
                                                  </label>
                                                </div>
                                              ))}
                                            </div>
                                          </details>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
                      </>
                    )}
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

export default EditPermissionsPage;
