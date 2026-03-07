import type { FaviconResult } from "../types";
import { getOrigin } from "../utils";

/** Use Google's undocumented favicon API */
export function googleApiStrategy(url: string): FaviconResult[] {
	const domain = new URL(getOrigin(url)).hostname;
	return [
		{
			url: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`,
			source: "google-api",
			type: "image/png",
			width: 128,
			height: 128,
		},
	];
}

/** Use DuckDuckGo's favicon API */
export function duckduckgoApiStrategy(url: string): FaviconResult[] {
	const domain = new URL(getOrigin(url)).hostname;
	return [
		{
			url: `https://icons.duckduckgo.com/ip3/${encodeURIComponent(domain)}.ico`,
			source: "duckduckgo-api",
			type: "image/x-icon",
		},
	];
}
