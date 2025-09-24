// Types pour les paramètres généraux de l'application

export interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
}
export interface OrganisationInfo {
  niveauOrganigrame: number;
  niveauAdressagePhysique: number;
}
export interface PermissionInfo {
  nom: string;
  description: string;
  permission: [];
}
export interface StorageSettings {
  path: string;
  maxFileSize: number; // en MB
  allowedExtensions: string[];
  backupEnabled: boolean;
  backupPath?: string;
}

export interface SessionSettings {
  timeout: number; // en minutes
  maxConcurrentSessions: number;
  rememberMeDuration: number; // en jours
  requirePasswordChange: boolean;
  passwordChangeInterval: number; // en jours
}

export interface SecuritySettings {
  enableTwoFactor: boolean;
  passwordMinLength: number;
  requireSpecialChars: boolean;
  maxLoginAttempts: number;
  lockoutDuration: number; // en minutes
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  systemNotifications: boolean;
  emailSmtpHost?: string;
  emailSmtpPort?: number;
  emailSmtpUser?: string;
  emailSmtpPassword?: string;
}

export interface GeneralSettings {
  company: CompanyInfo;
  organisation: OrganisationInfo;
  storage: StorageSettings;
  session: SessionSettings;
  security: SecuritySettings;
  notifications: NotificationSettings;
  permission: PermissionInfo;
}

export type SettingCategory =
  | "company"
  | "organisation"
  | "storage"
  | "session"
  | "security"
  | "notifications"
  | "permission";

export interface OptionItem {
  id: number;
  key: string;
  value: any;
  category: SettingCategory;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
