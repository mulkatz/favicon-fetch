/** Resolve a potentially relative URL against a base URL */
export function resolveUrl(href: string, baseUrl: string): string {
	try {
		return new URL(href, baseUrl).href;
	} catch {
		return href;
	}
}

/** Extract the origin from a URL string */
export function getOrigin(url: string): string {
	try {
		return new URL(url).origin;
	} catch {
		return url;
	}
}

/** Guess MIME type from file extension */
export function guessMimeType(url: string): string | undefined {
	const ext = url.split("?")[0]?.split(".").pop()?.toLowerCase();
	switch (ext) {
		case "ico":
			return "image/x-icon";
		case "png":
			return "image/png";
		case "jpg":
		case "jpeg":
			return "image/jpeg";
		case "svg":
			return "image/svg+xml";
		case "gif":
			return "image/gif";
		case "webp":
			return "image/webp";
		default:
			return undefined;
	}
}

/** Parse a sizes attribute like "32x32" into width/height */
export function parseSizes(
	sizes: string | null,
): { width: number; height: number } | undefined {
	if (!sizes || sizes === "any") return undefined;
	const match = sizes.match(/(\d+)x(\d+)/);
	if (!match?.[1] || !match?.[2]) return undefined;
	return {
		width: Number.parseInt(match[1], 10),
		height: Number.parseInt(match[2], 10),
	};
}

/** Fetch with timeout support */
export async function fetchWithTimeout(
	url: string,
	timeout: number,
	fetchFn: typeof globalThis.fetch,
	headers?: Record<string, string>,
): Promise<Response> {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeout);

	try {
		return await fetchFn(url, {
			signal: controller.signal,
			headers: {
				"User-Agent": "favicon-fetch/1.0",
				...headers,
			},
			redirect: "follow",
		});
	} finally {
		clearTimeout(timer);
	}
}
