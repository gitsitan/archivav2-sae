"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import AdminLayout from "@/app/adminLayout";
import AdminHeaders from "@/app/components/adminHeader";
import useNotification from "@/app/hooks/useNotifications";
import Notification from "@/components/ui/notifications";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowTurnBackwardIcon } from "@hugeicons/core-free-icons";
import { Save } from "lucide-react";
import { createTypeDocument } from "../actions";

const schema = z.object({
  name: z
    .string()
    .min(1, "Le nom est requis")
    .min(2, "Le nom doit contenir au moins 2 caractères"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const NewTypeDocumentPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { notification, showNotification, hideNotification } =
    useNotification();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "" },
  });

  const handleBack = () => router.back();

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      const result = await createTypeDocument(data);
      if (result.success) {
        showNotification("Type de document créé avec succès !", "success");
        setTimeout(() => router.push("/classification/types-documents"), 1200);
      } else {
        showNotification(result.error || "Erreur lors de la création", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AdminLayout>
        <AdminHeaders
          title="Créer un type de document"
          desc="Ajoutez une nouvelle catégorie de type pour vos documents."
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
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                  >
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    {...register("name")}
                    className="block w-full py-3 px-4 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600"
                    placeholder="Ex: Rapport, Note de service, ..."
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                >
                  Description (optionnel)
                </label>
                <textarea
                  id="description"
                  {...register("description")}
                  rows={3}
                  className="block w-full py-3 px-4 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600"
                  placeholder="Décrivez ce type de document..."
                />
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
      </AdminLayout>
    </>
  );
};

export default NewTypeDocumentPage;
