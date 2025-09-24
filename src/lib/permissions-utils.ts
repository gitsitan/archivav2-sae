// Interface pour les permissions détaillées
export interface DetailedPermissions {
  [category: string]: {
    [action: string]: boolean;
  };
}

// Fonction utilitaire pour convertir les permissions détaillées en tableau
export function convertDetailedPermissionsToArray(
  permissions: DetailedPermissions
): string[] {
  const result: string[] = [];

  for (const category in permissions) {
    for (const action in permissions[category]) {
      if (permissions[category][action]) {
        result.push(`${category}.${action}`);
      }
    }
  }

  return result;
}

// Fonction utilitaire pour convertir un tableau de permissions en permissions détaillées
export function convertArrayToDetailedPermissions(
  permissions: string[]
): DetailedPermissions {
  const result: DetailedPermissions = {};

  permissions.forEach((permission) => {
    const [category, action] = permission.split(".");
    if (category && action) {
      if (!result[category]) {
        result[category] = {};
      }
      result[category][action] = true;
    }
  });

  return result;
}
