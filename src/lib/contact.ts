export function isEmailContact(value?: string | null): boolean {
  if (!value) return false;
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return false;
  if (trimmed.startsWith("email:")) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}
