import type { FaviconResult } from "../types";
import {
	fetchWithTimeout,
	guessMimeType,
	parseSizes,
	resolveUrl,
} from "../utils";

const ICON_RELS = [
	"icon",
	"shortcut icon",
	"apple-touch-icon",
	"apple-touch-icon-precomposed",
];

/** Extract favicons from HTML <link> tags */
export async function htmlLinkStrategy(
	url: string,
	timeout: number,
	fetchFn: typeof globalThis.fetch,
	headers?: Record<string, string>,
): Promise<FaviconResult[]> {
	const res = await fetchWithTimeout(url, timeout, fetchFn, headers);
	if (!res.ok) return [];

	const html = await res.text();
	return parseIconLinks(html, url);
}

export function parseIconLinks(html: string, baseUrl: string): FaviconResult[] {
	const results: FaviconResult[] = [];
	const linkRegex = /<link\s[^>]*>/gi;

	let match: RegExpExecArray | null;
	for (
		match = linkRegex.exec(html);
		match !== null;
		match = linkRegex.exec(html)
	) {
		const tag = match[0];
		if (!tag) continue;

		const rel = extractAttr(tag, "rel")?.toLowerCase();
		if (!rel || !ICON_RELS.some((r) => rel.includes(r))) continue;

		const href = extractAttr(tag, "href");
		if (!href) continue;

		const absoluteUrl = resolveUrl(href, baseUrl);
		const sizes = parseSizes(extractAttr(tag, "sizes"));
		const type = extractAttr(tag, "type") ?? guessMimeType(absoluteUrl);

		results.push({
			url: absoluteUrl,
			source: "html-link",
			type,
			...(sizes && { width: sizes.width, height: sizes.height }),
		});
	}

	return results;
}

function extractAttr(tag: string, name: string): string | null {
	const regex = new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, "i");
	return regex.exec(tag)?.[1] ?? null;
}
