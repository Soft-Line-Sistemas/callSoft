export const hasPermission = (
  permissions: string[] | undefined,
  required: string | string[],
): boolean => {
  if (!permissions || permissions.length === 0) return false;
  if (permissions.includes('*')) return true;
  if (Array.isArray(required)) {
    return required.some((perm) => permissions.includes(perm));
  }
  return permissions.includes(required);
};

export const hasAllPermissions = (
  permissions: string[] | undefined,
  required: string[],
): boolean => {
  if (!permissions || permissions.length === 0) return false;
  if (permissions.includes('*')) return true;
  return required.every((perm) => permissions.includes(perm));
};
