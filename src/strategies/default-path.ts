import type { FaviconResult } from "../types";
import { fetchWithTimeout, getOrigin, guessMimeType } from "../utils";

const DEFAULT_PATHS = ["/favicon.ico", "/favicon.png", "/apple-touch-icon.png"];

/** Try common default favicon paths */
export async function defaultPathStrategy(
	url: string,
	timeout: number,
	fetchFn: typeof globalThis.fetch,
	headers?: Record<string, string>,
): Promise<FaviconResult[]> {
	const origin = getOrigin(url);
	const results: FaviconResult[] = [];

	for (const path of DEFAULT_PATHS) {
		const faviconUrl = `${origin}${path}`;
		try {
			const res = await fetchWithTimeout(faviconUrl, timeout, fetchFn, headers);
			if (res.ok) {
				const contentType = res.headers.get("content-type");
				if (contentType?.startsWith("image/") || path.endsWith(".ico")) {
					results.push({
						url: faviconUrl,
						source: "default-path",
						type: contentType?.split(";")[0] ?? guessMimeType(faviconUrl),
					});
				}
			}
		} catch {
			// path not available
		}
	}

	return results;
}
