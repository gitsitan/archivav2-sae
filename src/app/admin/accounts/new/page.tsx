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
import { createUser, getActiveGroups } from "../actions";
import { UserRole } from "@prisma/client";
import MySpinner from "@/components/ui/my-spinner";

interface Group {
  id: number;
  name: string;
}

// Schéma de validation Zod
const userSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Format d'email invalide"),
  name: z.string().optional(),
  isActive: z.boolean().default(true),
  groupIds: z.array(z.number()).default([]),
});

type UserFormData = z.infer<typeof userSchema>;

const CreateUserPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      isActive: true,
      groupIds: [],
    },
  });

  const { notification, showNotification, hideNotification } = useNotification();

  useEffect(() => {
    const start = Date.now();
    const fetchGroups = async () => {
      try {
        const result = await getActiveGroups();
        if (result.success && result.data) {
          setGroups(result.data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des groupes:", error);
      } finally {
        setGroupsLoading(false);
      }
    };
    fetchGroups();
    
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

  const handleGroupChange = (groupId: number, checked: boolean) => {
    const newGroupIds = checked 
      ? [...selectedGroupIds, groupId]
      : selectedGroupIds.filter(id => id !== groupId);
    
    setSelectedGroupIds(newGroupIds);
    setValue("groupIds", newGroupIds);
  };

  const onSubmit = async (data: UserFormData) => {
    try {
      setIsSubmitting(true);
      
      const result = await createUser({
        ...data,
        role: "USER" as UserRole, // Rôle par défaut
        groupIds: selectedGroupIds,
      });

      if (result.success) {
        showNotification("Utilisateur créé avec succès !", "success");
        setTimeout(() => router.push("/admin/accounts"), 2000);
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
              title="Créer un utilisateur"
              desc="Ajoutez un nouveau compte utilisateur au système d'archivage."
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
                    {/* Email */}
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                      >
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        {...register("email")}
                        className="block w-full py-3 px-4 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600"
                        placeholder="exemple@email.com"
                      />
                      {errors.email && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Nom */}
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                      >
                        Nom complet
                      </label>
                      <input
                        type="text"
                        id="name"
                        {...register("name")}
                        className="block w-full py-3 px-4 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600"
                        placeholder="Nom complet"
                      />
                      {errors.name && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.name.message}
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
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Compte actif
                    </label>
                  </div>

                  {/* Groupes */}
                  <div>
                    <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                      Groupes d'appartenance
                    </label>
                    {groupsLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <MySpinner size="sm" />
                        <span className="ml-2 text-sm text-gray-500">Chargement des groupes...</span>
                      </div>
                    ) : (
                      <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 max-h-48 overflow-y-auto bg-gray-50 dark:bg-gray-700">
                        {groups.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center">Aucun groupe disponible</p>
                        ) : (
                          <div className="space-y-2">
                            {groups.map((group) => (
                              <label key={group.id} className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={selectedGroupIds.includes(group.id)}
                                  onChange={(e) => handleGroupChange(group.id, e.target.checked)}
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                  {group.name}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Note d'information */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Note :</strong> Un mot de passe initial sera généré automatiquement. 
                      L'utilisateur devra le changer lors de sa première connexion. Le rôle sera défini sur "Utilisateur" par défaut.
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

export default CreateUserPage;
