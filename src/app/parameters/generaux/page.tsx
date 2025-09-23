"use client";

import React, { useState, useEffect } from "react";
import AdminHeaders from "@/app/components/adminHeader";
import AdminLayout from "@/app/adminLayout";
import MySpinner from "@/components/ui/my-spinner";
import Notification from "@/components/ui/notifications";
import useNotification from "@/app/hooks/useNotifications";
import { 
  getGeneralSettings, 
  updateCategorySettings, 
  initializeDefaultSettings 
} from "./actions";
import { GeneralSettings, SettingCategory } from "@/types/general-settings";
import { 
  Building2, 
  HardDrive, 
  Clock, 
  Shield, 
  Bell, 
  Save,
  RotateCcw
} from "lucide-react";

const GeneralSettingsPage = () => {
  const [settings, setSettings] = useState<Partial<GeneralSettings>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingCategory>("company");
  const { notification, showNotification, hideNotification } = useNotification();

  const tabs = [
    { id: "company" as SettingCategory, label: "Entreprise", icon: Building2 },
    { id: "organisation" as SettingCategory, label: "Organisation", icon: Building2 },
    { id: "storage" as SettingCategory, label: "Stockage", icon: HardDrive },
    { id: "session" as SettingCategory, label: "Sessions", icon: Clock },
    { id: "security" as SettingCategory, label: "Sécurité", icon: Shield },
    { id: "notifications" as SettingCategory, label: "Notifications", icon: Bell },
  ];

  useEffect(() => {
    const fetchSettings = async () => {
      const start = Date.now();
      try {
        const result = await getGeneralSettings();
        const elapsed = Date.now() - start;
        
        if (result.success && result.data) {
          setSettings(result.data);
        } else {
          console.error("Erreur de l'API:", result.error);
          showNotification(result.error || "Erreur lors du chargement", "error");
        }
        
        const minLoadingTime = 800;
        const remaining = minLoadingTime - elapsed;
        
        if (remaining > 0) {
          setTimeout(() => setLoading(false), remaining);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des paramètres:", error);
        showNotification("Erreur lors du chargement des paramètres", "error");
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (category: SettingCategory) => {
    setSaving(true);
    try {
      const categoryData = settings[category];
      if (!categoryData) return;

      const result = await updateCategorySettings(category, categoryData);
      
      if (result.success) {
        showNotification(`${tabs.find(t => t.id === category)?.label} sauvegardé avec succès !`, "success");
      } else {
        showNotification(result.error || "Erreur lors de la sauvegarde", "error");
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      showNotification("Erreur lors de la sauvegarde", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleInitializeDefaults = async () => {
    setSaving(true);
    try {
      const result = await initializeDefaultSettings();
      
      if (result.success) {
        showNotification("Paramètres par défaut initialisés avec succès !", "success");
        // Recharger les paramètres
        const settingsResult = await getGeneralSettings();
        if (settingsResult.success && settingsResult.data) {
          setSettings(settingsResult.data);
        }
      } else {
        showNotification(result.error || "Erreur lors de l'initialisation", "error");
      }
    } catch (error) {
      console.error("Erreur lors de l'initialisation:", error);
      showNotification("Erreur lors de l'initialisation", "error");
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (category: SettingCategory, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const renderCompanySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nom de l'entreprise *
          </label>
          <input
            type="text"
            value={settings.company?.name || ""}
            onChange={(e) => updateSetting("company", "name", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
            placeholder="Nom de l'entreprise"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            value={settings.company?.email || ""}
            onChange={(e) => updateSetting("company", "email", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
            placeholder="contact@entreprise.com"
          />
        </div>
      </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Téléphone
          </label>
          <input
            type="text"
            value={settings.company?.phone || ""}
            onChange={(e) => updateSetting("company", "phone", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
            placeholder="+235 XX XX XX XX"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Site web
          </label>
          <input
            type="url"
            value={settings.company?.website || ""}
            onChange={(e) => updateSetting("company", "website", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
            placeholder="https://www.entreprise.com"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Adresse
        </label>
        <textarea
          value={settings.company?.address || ""}
          onChange={(e) => updateSetting("company", "address", e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
          placeholder="Adresse complète de l'entreprise"
        />
      </div>
      
   
    </div>
  );

   const renderOrganisationSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nom de l'entreprise *
          </label>
          <input
            type="text"
            value={settings.company?.name || ""}
            onChange={(e) => updateSetting("company", "name", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
            placeholder="Nom de l'entreprise"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            value={settings.company?.email || ""}
            onChange={(e) => updateSetting("company", "email", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
            placeholder="contact@entreprise.com"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Adresse
        </label>
        <textarea
          value={settings.company?.address || ""}
          onChange={(e) => updateSetting("company", "address", e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
          placeholder="Adresse complète de l'entreprise"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Téléphone
          </label>
          <input
            type="text"
            value={settings.company?.phone || ""}
            onChange={(e) => updateSetting("company", "phone", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
            placeholder="+235 XX XX XX XX"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Site web
          </label>
          <input
            type="url"
            value={settings.company?.website || ""}
            onChange={(e) => updateSetting("company", "website", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
            placeholder="https://www.entreprise.com"
          />
        </div>
      </div>
    </div>
  );
  const renderStorageSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Chemin de stockage *
          </label>
          <input
            type="text"
            value={settings.storage?.path || ""}
            onChange={(e) => updateSetting("storage", "path", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
            placeholder="./storage"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Taille max des fichiers (MB)
          </label>
          <input
            type="number"
            value={settings.storage?.maxFileSize || 100}
            onChange={(e) => updateSetting("storage", "maxFileSize", parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
            min="1"
            max="1000"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Extensions autorisées
        </label>
        <input
          type="text"
          value={Array.isArray(settings.storage?.allowedExtensions) ? settings.storage.allowedExtensions.join(", ") : ""}
          onChange={(e) => updateSetting("storage", "allowedExtensions", e.target.value.split(",").map(ext => ext.trim()))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
          placeholder=".pdf, .doc, .docx, .jpg, .png"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={settings.storage?.backupEnabled || false}
            onChange={(e) => updateSetting("storage", "backupEnabled", e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Activer les sauvegardes automatiques
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Chemin des sauvegardes
          </label>
          <input
            type="text"
            value={settings.storage?.backupPath || ""}
            onChange={(e) => updateSetting("storage", "backupPath", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
            placeholder="./backups"
          />
        </div>
      </div>
    </div>
  );

  const renderSessionSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Délai d'expiration (minutes)
          </label>
          <input
            type="number"
            value={settings.session?.timeout || 30}
            onChange={(e) => updateSetting("session", "timeout", parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
            min="5"
            max="480"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sessions simultanées max
          </label>
          <input
            type="number"
            value={settings.session?.maxConcurrentSessions || 5}
            onChange={(e) => updateSetting("session", "maxConcurrentSessions", parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
            min="1"
            max="20"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Durée "Se souvenir de moi" (jours)
          </label>
          <input
            type="number"
            value={settings.session?.rememberMeDuration || 30}
            onChange={(e) => updateSetting("session", "rememberMeDuration", parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
            min="1"
            max="365"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Intervalle changement mot de passe (jours)
          </label>
          <input
            type="number"
            value={settings.session?.passwordChangeInterval || 90}
            onChange={(e) => updateSetting("session", "passwordChangeInterval", parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
            min="30"
            max="365"
          />
        </div>
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={settings.session?.requirePasswordChange || false}
          onChange={(e) => updateSetting("session", "requirePasswordChange", e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
          Exiger le changement de mot de passe
        </label>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={settings.security?.enableTwoFactor || false}
          onChange={(e) => updateSetting("security", "enableTwoFactor", e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
          Activer l'authentification à deux facteurs
        </label>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Longueur minimale du mot de passe
          </label>
          <input
            type="number"
            value={settings.security?.passwordMinLength || 8}
            onChange={(e) => updateSetting("security", "passwordMinLength", parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
            min="6"
            max="32"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tentatives de connexion max
          </label>
          <input
            type="number"
            value={settings.security?.maxLoginAttempts || 5}
            onChange={(e) => updateSetting("security", "maxLoginAttempts", parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
            min="3"
            max="10"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={settings.security?.requireSpecialChars || false}
            onChange={(e) => updateSetting("security", "requireSpecialChars", e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Exiger des caractères spéciaux
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Durée de verrouillage (minutes)
          </label>
          <input
            type="number"
            value={settings.security?.lockoutDuration || 15}
            onChange={(e) => updateSetting("security", "lockoutDuration", parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
            min="5"
            max="60"
          />
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={settings.notifications?.emailNotifications || false}
            onChange={(e) => updateSetting("notifications", "emailNotifications", e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Notifications par email
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={settings.notifications?.smsNotifications || false}
            onChange={(e) => updateSetting("notifications", "smsNotifications", e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Notifications par SMS
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={settings.notifications?.systemNotifications || false}
            onChange={(e) => updateSetting("notifications", "systemNotifications", e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Notifications système
          </label>
        </div>
      </div>
      
      <div className="border-t pt-6">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Configuration SMTP</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Serveur SMTP
            </label>
            <input
              type="text"
              value={settings.notifications?.emailSmtpHost || ""}
              onChange={(e) => updateSetting("notifications", "emailSmtpHost", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
              placeholder="smtp.gmail.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Port SMTP
            </label>
            <input
              type="number"
              value={settings.notifications?.emailSmtpPort || 587}
              onChange={(e) => updateSetting("notifications", "emailSmtpPort", parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
              min="1"
              max="65535"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Utilisateur SMTP
            </label>
            <input
              type="text"
              value={settings.notifications?.emailSmtpUser || ""}
              onChange={(e) => updateSetting("notifications", "emailSmtpUser", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mot de passe SMTP
            </label>
            <input
              type="password"
              value={settings.notifications?.emailSmtpPassword || ""}
              onChange={(e) => updateSetting("notifications", "emailSmtpPassword", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
              placeholder="••••••••"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "company":
        return renderCompanySettings();
      case "organisation":
        return renderOrganisationSettings();  
      case "storage":
        return renderStorageSettings();
      case "session":
        return renderSessionSettings();
      case "security":
        return renderSecuritySettings();
      case "notifications":
        return renderNotificationSettings();
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
          <MySpinner size="lg" color="primary" />
          <p className="mt-4 text-gray-600 font-medium">
            Chargement des paramètres...
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <AdminHeaders
        title="Paramètres Généraux"
        desc="Configurez les paramètres généraux de l'application"
      />
      
      {notification.visible && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
        />
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderTabContent()}
          
          {/* Actions */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={handleInitializeDefaults}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Initialiser les valeurs par défaut
            </button>
            
            <button
              onClick={() => handleSave(activeTab)}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Sauvegarde..." : "Sauvegarder"}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default GeneralSettingsPage;
