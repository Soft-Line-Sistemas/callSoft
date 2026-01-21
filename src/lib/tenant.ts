export type TenantDomainMap = Record<string, string>;

function tryParseDomainMap(value?: string): TenantDomainMap | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as TenantDomainMap;
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

function normalizeDomain(domain: string): string {
  return domain.trim().toLowerCase().replace(/^\.+/, '').replace(/\.+$/, '');
}

/**
 * Resolve tenantId for login flows.
 *
 * Priority:
 * 1) `NEXT_PUBLIC_TENANT_ID` (fixed single-tenant)
 * 2) `NEXT_PUBLIC_TENANT_DOMAIN_MAP` (JSON mapping)
 * 3) fallback: first label of the email domain (e.g. intercity.com -> intercity)
 */
export function resolveTenantIdFromEmail(email: string): string | null {
  const fixedTenantId = process.env.NEXT_PUBLIC_TENANT_ID?.trim();
  if (fixedTenantId) return fixedTenantId;

  const at = email.lastIndexOf('@');
  if (at < 0) return null;

  const domain = normalizeDomain(email.slice(at + 1));
  if (!domain) return null;

  const domainMap = tryParseDomainMap(process.env.NEXT_PUBLIC_TENANT_DOMAIN_MAP);
  if (domainMap) {
    const exact = domainMap[domain];
    if (exact) return exact;

    for (const [suffix, tenantId] of Object.entries(domainMap)) {
      const normalizedSuffix = normalizeDomain(suffix);
      if (!normalizedSuffix) continue;
      if (domain === normalizedSuffix || domain.endsWith(`.${normalizedSuffix}`)) {
        return tenantId;
      }
    }
  }

  const firstLabel = domain.split('.')[0]?.trim();
  return firstLabel ? firstLabel : null;
}

