"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminHeaders from "@/app/admin/components/adminHeader";
import {
  ArrowTurnBackwardIcon,
  Edit01FreeIcons,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import LoadingTchadFlag from "@/components/ui/LoadingTchadFlag";
import z from "zod";
import useNotification from "@/app/hooks/useNotifications";

interface JournalFormData {
  annee: string;
  type: string;
  numero: string;
  date_de_publication: string;
}

//ici notre logique de formnulaire zode
const journalSchema = z.object({
  annee: z
    .string()
    .min(1, "L'année est requise")
    .regex(/^\d{4}$/, "Année invalide"),
  numero: z
    .string()
    .min(1, "Le numéro est requis")
    .regex(/^\d+$/, "Numéro invalide"),
  type: z.string().min(1, "Le type est requis"),
  date_de_publication: z
    .string()
    .min(1, "La date est requise")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide"),
});

const UpdateJournalPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [formData, setFormData] = useState<JournalFormData>({
    annee: "",
    type: "",
    numero: "",
    date_de_publication: "",
  });
  console.log("tout donee recuperer");

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { notification, showNotification, hideNotification } =
    useNotification();

  useEffect(() => {
    const fetchJournalData = async () => {
      const start = Date.now();

      if (!id) {
        setError("ID du journal manquant.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/journaux/${id}`);
        if (res.ok) {
          const data = await res.json();
          setFormData({
            annee: data.annee.toString(),
            type: data.type,
            numero: data.numero.toString(),
            date_de_publication: data.date_de_publication.split("T")[0],
          });
        } else {
          setError("Journal introuvable.");
        }
      } catch (err) {
        console.error("Erreur de chargement des données:", err);
        setError("Erreur de chargement des données du journal.");
      } finally {
        const elapsed = Date.now() - start;
        const minLoadingTime = 1500;
        const remaining = minLoadingTime - elapsed;

        if (remaining > 0) {
          setTimeout(() => setLoading(false), remaining);
        } else {
          setLoading(false);
        }
      }
    };

    fetchJournalData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) setError(null);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleBack = () => {
    router.back();
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const validation = journalSchema.safeParse(formData);

    if (!validation.success) {
      const firstError =
        validation.error.issues[0]?.message || "Erreur de validation.";
      setError(firstError);
      setIsSubmitting(false);
      return;
    }

    const payload = {
      ...validation.data,
      annee: parseInt(validation.data.annee, 10),
      numero: parseInt(validation.data.numero, 10),
    };

    try {
      const response = await fetch(`/api/journaux/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push("/admin/content/journals");
      } else {
        const errorData = await response.json();
        const errorMessage =
          errorData.message || "Erreur lors de la mise à jour.";
        setError(errorMessage);
        console.error("Erreur serveur:", errorData);
      }
    } catch (err) {
      console.error("Erreur de soumission:", err);
      setError("Une erreur inattendue est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {loading ? (
        <LoadingTchadFlag />
      ) : (
        <>
          <AdminHeaders
            title="Éditer le Journal"
            desc="Modifiez les informations de ce journal."
          />
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
                      htmlFor="annee"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Année de publication{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="annee"
                      name="annee"
                      value={formData.annee}
                      onChange={handleChange}
                      className="block w-full py-3 px-4 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600"
                      placeholder="Ex: 2024"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="numero"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Numéro <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="numero"
                      name="numero"
                      value={formData.numero}
                      onChange={handleChange}
                      className="block w-full py-3 px-4 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600"
                      placeholder="Ex: 123"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="type"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Type du journal <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="block w-full py-3 px-4 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600"
                      placeholder="Ex: Officiel, Spécial"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="date_de_publication"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Date de Publication{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="date_de_publication"
                      name="date_de_publication"
                      value={formData.date_de_publication}
                      onChange={handleChange}
                      className="block w-full py-3 px-4 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600"
                      required
                    />
                  </div>
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
                    className=" ml-auto w-30 flex justify-center items-center py-3 px-4 rounded-lg font-semibold text-white transition-colors duration-200 ease-in-out bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
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
    </>
  );
};

export default UpdateJournalPage;
