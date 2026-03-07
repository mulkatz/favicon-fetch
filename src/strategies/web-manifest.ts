import type { FaviconResult } from "../types";
import { fetchWithTimeout, guessMimeType, resolveUrl } from "../utils";

/** Extract icons from web manifest */
export async function webManifestStrategy(
	url: string,
	timeout: number,
	fetchFn: typeof globalThis.fetch,
	headers?: Record<string, string>,
): Promise<FaviconResult[]> {
	const res = await fetchWithTimeout(url, timeout, fetchFn, headers);
	if (!res.ok) return [];

	const html = await res.text();
	const manifestHref = extractManifestUrl(html);
	if (!manifestHref) return [];

	const manifestUrl = resolveUrl(manifestHref, url);

	try {
		const manifestRes = await fetchWithTimeout(
			manifestUrl,
			timeout,
			fetchFn,
			headers,
		);
		if (!manifestRes.ok) return [];

		const manifest = (await manifestRes.json()) as {
			icons?: Array<{ src: string; sizes?: string; type?: string }>;
		};

		if (!manifest.icons || !Array.isArray(manifest.icons)) return [];

		return manifest.icons.map((icon) => {
			const iconUrl = resolveUrl(icon.src, manifestUrl);
			const sizes = icon.sizes?.match(/(\d+)x(\d+)/);
			return {
				url: iconUrl,
				source: "web-manifest" as const,
				type: icon.type ?? guessMimeType(iconUrl),
				...(sizes?.[1] &&
					sizes?.[2] && {
						width: Number.parseInt(sizes[1], 10),
						height: Number.parseInt(sizes[2], 10),
					}),
			};
		});
	} catch {
		return [];
	}
}

function extractManifestUrl(html: string): string | null {
	const match = /<link\s[^>]*rel\s*=\s*["']manifest["'][^>]*>/i.exec(html);
	if (!match?.[0]) return null;
	const hrefMatch = /href\s*=\s*["']([^"']*)["']/i.exec(match[0]);
	return hrefMatch?.[1] ?? null;
}
