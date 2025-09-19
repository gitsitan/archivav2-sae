"use client";

import React, { useState } from "react";
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
import { createBeneficiary } from "../actions";
import { BeneficiaryType } from "@prisma/client";

// Schéma de validation Zod
const beneficiarySchema = z.object({
  name: z
    .string()
    .min(1, "Le nom est requis")
    .min(2, "Le nom doit contenir au moins 2 caractères"),
  type: z.nativeEnum(BeneficiaryType, {
    errorMap: () => ({ message: "Veuillez sélectionner un type valide" }),
  }),
  contact: z.string().optional(),
  address: z.string().optional(),
});

type BeneficiaryFormData = z.infer<typeof beneficiarySchema>;

const CreateBeneficiaryPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BeneficiaryFormData>({
    resolver: zodResolver(beneficiarySchema),
  });

  const { notification, showNotification, hideNotification } =
    useNotification();

  const handleBack = () => {
    router.back();
  };

  const onSubmit = async (data: BeneficiaryFormData) => {
    try {
      setIsSubmitting(true);
      
      const result = await createBeneficiary(data);

      if (result.success) {
        showNotification("Bénéficiaire créé avec succès !", "success");
        setTimeout(() => router.push("/parameters/beneficiaires"), 2000);
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
        <AdminHeaders
          title="Créer un Bénéficiaire"
          desc="Ajoutez un nouveau bénéficiaire au système d'archivage."
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
                {/* Nom */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                  >
                    Nom du bénéficiaire <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    {...register("name")}
                    className="block w-full py-3 px-4 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600"
                    placeholder="Ex: Ministère de l'Éducation"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Type */}
                <div>
                  <label
                    htmlFor="type"
                    className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                  >
                    Type de bénéficiaire <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="type"
                    {...register("type")}
                    className="block w-full py-3 px-4 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600"
                  >
                    <option value="">Sélectionnez un type</option>
                    <option value={BeneficiaryType.INDIVIDUAL}>Individuel</option>
                    <option value={BeneficiaryType.ORGANIZATION}>Organisation</option>
                    <option value={BeneficiaryType.GOVERNMENT}>Gouvernement</option>
                    <option value={BeneficiaryType.PRIVATE}>Privé</option>
                  </select>
                  {errors.type && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.type.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Contact */}
              <div>
                <label
                  htmlFor="contact"
                  className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                >
                  Contact
                </label>
                <input
                  type="text"
                  id="contact"
                  {...register("contact")}
                  className="block w-full py-3 px-4 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600"
                  placeholder="Ex: +235 XX XX XX XX"
                />
                {errors.contact && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.contact.message}
                  </p>
                )}
              </div>

              {/* Adresse */}
              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                >
                  Adresse
                </label>
                <textarea
                  id="address"
                  {...register("address")}
                  rows={3}
                  className="block w-full py-3 px-4 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600"
                  placeholder="Ex: Avenue Charles de Gaulle, N'Djamena"
                />
                {errors.address && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.address.message}
                  </p>
                )}
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
      </AdminLayout>
    </>
  );
};

export default CreateBeneficiaryPage;
