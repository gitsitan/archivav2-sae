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
import { getUserById, updateUser, getActiveGroups } from "../../actions";
import { UserRole } from "@prisma/client";
import MySpinner from "@/components/ui/my-spinner";
import Notification from "@/components/ui/notifications";

interface Group {
  id: number;
  name: string;
}

interface User {
  id: number;
  email: string;
  name: string | null;
  role: UserRole;
  isActive: boolean;
  groupIds: number[];
  groupNames: string[];
}

interface UserFormData {
  email: string;
  name: string;
  isActive: boolean;
  groupIds: number[];
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

const UpdateUserPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [formData, setFormData] = useState<UserFormData>({
    email: "",
    name: "",
    isActive: true,
    groupIds: [],
  });

  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);
  const { notification, showNotification, hideNotification } = useNotification();

  useEffect(() => {
    const fetchUserData = async () => {
      const start = Date.now();

      if (!id) {
        setError("ID de l'utilisateur manquant.");
        setLoading(false);
        return;
      }

      try {
        // Charger les groupes
        const groupsResult = await getActiveGroups();
        if (groupsResult.success && groupsResult.data) {
          setGroups(groupsResult.data);
        }

        // Charger les données de l'utilisateur
        const result = await getUserById(Number(id));
        const elapsed = Date.now() - start;
        
        if (result.success && result.data) {
          const user = result.data;
          setFormData({
            email: user.email,
            name: user.name || "",
            isActive: user.isActive,
            groupIds: user.groupIds,
          });
          setSelectedGroupIds(user.groupIds);
        } else {
          setError(result.error || "Utilisateur introuvable.");
        }
        
        // Ajuster le loading en fonction de la durée réelle
        const minLoadingTime = 800; // Temps minimum réduit
        const remaining = minLoadingTime - elapsed;
        
        if (remaining > 0) {
          setTimeout(() => setLoading(false), remaining);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Erreur de chargement des données:", err);
        setError("Erreur de chargement des données de l'utilisateur.");
        setLoading(false); // Arrêter le loading immédiatement en cas d'erreur
      }
    };

    fetchUserData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (error) setError(null);
    setFormData({ ...formData, [e.target.name]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value });
  };

  const handleGroupChange = (groupId: number, checked: boolean) => {
    const newGroupIds = checked 
      ? [...selectedGroupIds, groupId]
      : selectedGroupIds.filter(id => id !== groupId);
    
    setSelectedGroupIds(newGroupIds);
    setFormData(prev => ({ ...prev, groupIds: newGroupIds }));
  };

  const handleBack = () => {
    router.back();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const validation = userSchema.safeParse(formData);

    if (!validation.success) {
      const firstError =
        validation.error.issues[0]?.message || "Erreur de validation.";
      setError(firstError);
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await updateUser(Number(id), {
        ...validation.data,
        role: "USER" as UserRole, // Rôle par défaut
        groupIds: selectedGroupIds,
      });

      if (result.success) {
        showNotification("Utilisateur modifié avec succès !", "success");
        setTimeout(() => router.push("/admin/accounts"), 2000);
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
              title="Éditer l'utilisateur"
              desc="Modifiez les informations de ce compte utilisateur."
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
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Email{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="block w-full py-3 px-4 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600"
                        placeholder="exemple@email.com"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Nom complet
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="block w-full py-3 px-4 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600"
                        placeholder="Nom complet"
                      />
                    </div>
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
                      Compte actif
                    </label>
                  </div>
                  
                  {/* Groupes */}
                  <div>
                    <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                      Groupes d'appartenance
                    </label>
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
                  </div>

                  {/* Note d'information */}
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      <strong>Note :</strong> La modification des groupes d'appartenance prend effet immédiatement. 
                      L'utilisateur aura accès aux permissions des nouveaux groupes sélectionnés. Le rôle reste "Utilisateur".
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
              </div>
            </div>
          </>
        )}
      </AdminLayout>
    </>
  );
};

export default UpdateUserPage;
