export interface FaviconResult {
	/** URL of the favicon */
	url: string;
	/** Source strategy that found this icon */
	source:
		| "html-link"
		| "web-manifest"
		| "default-path"
		| "open-graph"
		| "google-api"
		| "duckduckgo-api";
	/** MIME type if known (e.g. "image/png", "image/svg+xml") */
	type?: string;
	/** Width in pixels if known */
	width?: number;
	/** Height in pixels if known */
	height?: number;
}

export interface FaviconOptions {
	/** Request timeout in ms (default: 5000) */
	timeout?: number;
	/** Which strategies to use and in what order */
	strategies?: Strategy[];
	/** Custom fetch function (for proxies, auth, etc.) */
	fetch?: typeof globalThis.fetch;
	/** Custom headers to send with requests */
	headers?: Record<string, string>;
}

export type Strategy =
	| "html-link"
	| "web-manifest"
	| "default-path"
	| "open-graph"
	| "google-api"
	| "duckduckgo-api";

export const DEFAULT_STRATEGIES: Strategy[] = [
	"html-link",
	"web-manifest",
	"default-path",
	"open-graph",
	"google-api",
	"duckduckgo-api",
];
