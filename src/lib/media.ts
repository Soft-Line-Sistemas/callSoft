const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:64231";

export function resolveUserPhotoUrl(photoUrl?: string | null): string | null {
    if (!photoUrl) {
        return null;
    }

    if (photoUrl.startsWith("data:") || photoUrl.startsWith("blob:")) {
        return photoUrl;
    }

    if (photoUrl.startsWith("http://") || photoUrl.startsWith("https://")) {
        return photoUrl;
    }

    if (photoUrl.startsWith("/")) {
        return `${apiBaseUrl}${photoUrl}`;
    }

    return `${apiBaseUrl}/${photoUrl}`;
}
