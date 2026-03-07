import type { FaviconResult } from "../types";
import { fetchWithTimeout, resolveUrl } from "../utils";

/** Extract icons from Open Graph / Twitter meta tags */
export async function openGraphStrategy(
	url: string,
	timeout: number,
	fetchFn: typeof globalThis.fetch,
	headers?: Record<string, string>,
): Promise<FaviconResult[]> {
	const res = await fetchWithTimeout(url, timeout, fetchFn, headers);
	if (!res.ok) return [];

	const html = await res.text();
	return parseOgImages(html, url);
}

export function parseOgImages(html: string, baseUrl: string): FaviconResult[] {
	const results: FaviconResult[] = [];
	const metaRegex = /<meta\s[^>]*>/gi;

	let match: RegExpExecArray | null;
	for (
		match = metaRegex.exec(html);
		match !== null;
		match = metaRegex.exec(html)
	) {
		const tag = match[0];
		if (!tag) continue;

		const property = extractAttr(tag, "property") ?? extractAttr(tag, "name");
		if (property !== "og:image" && property !== "twitter:image") continue;

		const content = extractAttr(tag, "content");
		if (!content) continue;

		results.push({
			url: resolveUrl(content, baseUrl),
			source: "open-graph",
		});
	}

	return results;
}

function extractAttr(tag: string, name: string): string | null {
	const regex = new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, "i");
	return regex.exec(tag)?.[1] ?? null;
}
