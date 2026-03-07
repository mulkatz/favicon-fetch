import { defaultPathStrategy } from "./strategies/default-path";
import {
	duckduckgoApiStrategy,
	googleApiStrategy,
} from "./strategies/external-apis";
import { htmlLinkStrategy } from "./strategies/html-link";
import { openGraphStrategy } from "./strategies/open-graph";
import { webManifestStrategy } from "./strategies/web-manifest";
import type { FaviconOptions, FaviconResult, Strategy } from "./types";
import { DEFAULT_STRATEGIES } from "./types";

/** Score an icon result — higher is better */
function scoreIcon(icon: FaviconResult): number {
	let score = 0;

	// Prefer SVG
	if (icon.type === "image/svg+xml") score += 1000;

	// Prefer PNG over ICO
	if (icon.type === "image/png") score += 500;
	if (icon.type === "image/x-icon") score += 100;

	// Larger icons score higher
	if (icon.width && icon.height) {
		score += Math.min(icon.width, icon.height);
	}

	// Prefer direct sources over APIs
	const sourceScores: Record<string, number> = {
		"html-link": 50,
		"web-manifest": 40,
		"default-path": 30,
		"open-graph": 10,
		"google-api": 5,
		"duckduckgo-api": 5,
	};
	score += sourceScores[icon.source] ?? 0;

	return score;
}

/** Deduplicate icons by URL */
function dedup(icons: FaviconResult[]): FaviconResult[] {
	const seen = new Set<string>();
	return icons.filter((icon) => {
		if (seen.has(icon.url)) return false;
		seen.add(icon.url);
		return true;
	});
}

async function runStrategy(
	strategy: Strategy,
	url: string,
	timeout: number,
	fetchFn: typeof globalThis.fetch,
	headers?: Record<string, string>,
): Promise<FaviconResult[]> {
	switch (strategy) {
		case "html-link":
			return htmlLinkStrategy(url, timeout, fetchFn, headers);
		case "web-manifest":
			return webManifestStrategy(url, timeout, fetchFn, headers);
		case "default-path":
			return defaultPathStrategy(url, timeout, fetchFn, headers);
		case "open-graph":
			return openGraphStrategy(url, timeout, fetchFn, headers);
		case "google-api":
			return googleApiStrategy(url);
		case "duckduckgo-api":
			return duckduckgoApiStrategy(url);
	}
}

/**
 * Get the single best favicon for a URL.
 * Tries strategies in order until it finds an icon.
 */
export async function getFavicon(
	url: string,
	options: FaviconOptions = {},
): Promise<FaviconResult | null> {
	const icons = await getAllFavicons(url, options);
	if (icons.length === 0) return null;

	// Sort by score descending, return best
	return icons.sort((a, b) => scoreIcon(b) - scoreIcon(a))[0] ?? null;
}

/**
 * Get all discovered favicons for a URL.
 * Runs all strategies and returns deduplicated results sorted by quality.
 */
export async function getAllFavicons(
	url: string,
	options: FaviconOptions = {},
): Promise<FaviconResult[]> {
	const {
		timeout = 5000,
		strategies = DEFAULT_STRATEGIES,
		fetch: fetchFn = globalThis.fetch,
		headers,
	} = options;

	const allIcons: FaviconResult[] = [];

	for (const strategy of strategies) {
		try {
			const icons = await runStrategy(strategy, url, timeout, fetchFn, headers);
			allIcons.push(...icons);

			// For getFavicon optimization: stop early if we have a good icon
			// (but getAllFavicons always runs all strategies)
		} catch {
			// Strategy failed, continue to next
		}
	}

	return dedup(allIcons).sort((a, b) => scoreIcon(b) - scoreIcon(a));
}
