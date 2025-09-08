// /* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import AdminHeaders from "@/app/admin/components/adminHeader";
import useNotification from "@/app/hooks/useNotifications";
import Notification from "@/components/ui/notifications";
import { PlusCircle } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowTurnBackwardIcon } from "@hugeicons/core-free-icons";

//permet de definir le schema de zod pour le controle des champs
const journalSchema = z.object({
  annee: z
    .string()
    .min(4, "L'année doit contenir au moins 4 chiffres")
    .regex(/^\d{4}$/, "L'année doit être un nombre à 4 chiffres"),
  numero: z
    .string()
    .min(1, "Le numéro est requis")
    .regex(/^\d+$/, "Doit être un nombre"),
  type: z.string().min(1, "Le type est requis"),
  date_de_publication: z.string().min(1, "La date de publication est requise"),
});

type JournalFormData = z.infer<typeof journalSchema>;

const CreateJournalPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JournalFormData>({
    resolver: zodResolver(journalSchema),
  });

  const { notification, showNotification, hideNotification } =
    useNotification();

  const handleBack = () => {
    router.back();
  };

  const onSubmit = async (data: JournalFormData) => {
    try {
      setIsSubmitting(true);
      const payload = {
        ...data,
        annee: parseInt(data.annee, 10),
        numero: parseInt(data.numero, 10),
      };

      const response = await fetch("/api/journaux", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        showNotification("Journal créé avec succès !", "success");
        setTimeout(() => router.push("/admin/content/journals"), 2000);
      } else {
        const errorData = await response.json();
        showNotification(
          errorData.message || "Erreur lors de la création.",
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
      <AdminHeaders
        title="Créer un Journal"
        desc="Ajoutez un nouveau journal à la base de données."
      />

      {notification.visible && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
        />
      )}

      <div className=" w-full mx-auto mt-8 px-4 sm:px-6 lg:px-0">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="px-6 py-8 space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Année */}
              <div>
                <label
                  htmlFor="annee"
                  className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                >
                  Année de publication <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="annee"
                  {...register("annee")}
                  className="block w-full py-3 px-4 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600"
                  placeholder="Ex: 2024"
                />
                {errors.annee && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.annee.message}
                  </p>
                )}
              </div>

              {/* Numéro */}
              <div>
                <label
                  htmlFor="numero"
                  className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                >
                  Numéro <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="numero"
                  {...register("numero")}
                  className="block w-full py-3 px-4 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600"
                  placeholder="Ex: 123"
                />
                {errors.numero && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.numero.message}
                  </p>
                )}
              </div>
            </div>

            {/* Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                >
                  Type du journal <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="type"
                  {...register("type")}
                  className="block w-full py-3 px-4 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600"
                  placeholder="Ex: Officiel, Spécial"
                />
                {errors.type && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.type.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="date_de_publication"
                  className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                >
                  Date de Publication <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="date_de_publication"
                  {...register("date_de_publication")}
                  className="block w-full py-3 px-4 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600"
                />
                {errors.date_de_publication && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.date_de_publication.message}
                  </p>
                )}
              </div>
            </div>

            {/* Date de Publication */}

            {/* Submit */}
            <div className="pt-6 flex justify-start items-center space-x-4">
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
                    <PlusCircle size={24} className="mr-3" />
                    Créer le Journal
                  </>
                )}
              </button>
              <button
                onClick={handleBack}
                type="button"
                className="w-30 flex justify-center items-center py-3 px-4 rounded-lg font-semibold text-white transition-colors duration-200 ease-in-out bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
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
  );
};

export default CreateJournalPage;
