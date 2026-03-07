import { describe, expect, it } from "vitest";
import {
	duckduckgoApiStrategy,
	googleApiStrategy,
} from "../strategies/external-apis";
import { parseIconLinks } from "../strategies/html-link";
import { parseOgImages } from "../strategies/open-graph";

describe("parseIconLinks", () => {
	it("extracts favicon links from HTML", () => {
		const html = `
			<html><head>
				<link rel="icon" href="/favicon.ico" />
				<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
				<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
			</head></html>
		`;
		const icons = parseIconLinks(html, "https://example.com");

		expect(icons).toHaveLength(3);
		expect(icons[0]).toMatchObject({
			url: "https://example.com/favicon.ico",
			source: "html-link",
		});
		expect(icons[1]).toMatchObject({
			url: "https://example.com/favicon-32x32.png",
			source: "html-link",
			type: "image/png",
			width: 32,
			height: 32,
		});
		expect(icons[2]).toMatchObject({
			url: "https://example.com/apple-touch-icon.png",
			source: "html-link",
			width: 180,
			height: 180,
		});
	});

	it("resolves relative URLs against base", () => {
		const html = '<link rel="icon" href="assets/icon.png" />';
		const icons = parseIconLinks(html, "https://example.com/page/");

		expect(icons[0]?.url).toBe("https://example.com/page/assets/icon.png");
	});

	it("ignores non-icon links", () => {
		const html = `
			<link rel="stylesheet" href="/style.css" />
			<link rel="preconnect" href="https://fonts.googleapis.com" />
		`;
		expect(parseIconLinks(html, "https://example.com")).toHaveLength(0);
	});

	it("handles shortcut icon rel", () => {
		const html = '<link rel="shortcut icon" href="/favicon.ico" />';
		const icons = parseIconLinks(html, "https://example.com");

		expect(icons).toHaveLength(1);
		expect(icons[0]?.url).toBe("https://example.com/favicon.ico");
	});
});

describe("parseOgImages", () => {
	it("extracts og:image", () => {
		const html =
			'<meta property="og:image" content="https://example.com/og.png" />';
		const icons = parseOgImages(html, "https://example.com");

		expect(icons).toHaveLength(1);
		expect(icons[0]).toMatchObject({
			url: "https://example.com/og.png",
			source: "open-graph",
		});
	});

	it("extracts twitter:image", () => {
		const html = '<meta name="twitter:image" content="/twitter-card.jpg" />';
		const icons = parseOgImages(html, "https://example.com");

		expect(icons).toHaveLength(1);
		expect(icons[0]?.url).toBe("https://example.com/twitter-card.jpg");
	});

	it("ignores non-image meta tags", () => {
		const html = '<meta property="og:title" content="My Site" />';
		expect(parseOgImages(html, "https://example.com")).toHaveLength(0);
	});
});

describe("googleApiStrategy", () => {
	it("returns Google favicon URL", () => {
		const icons = googleApiStrategy("https://github.com");
		expect(icons).toHaveLength(1);
		expect(icons[0]?.url).toContain("google.com/s2/favicons");
		expect(icons[0]?.url).toContain("github.com");
		expect(icons[0]?.source).toBe("google-api");
	});
});

describe("duckduckgoApiStrategy", () => {
	it("returns DuckDuckGo favicon URL", () => {
		const icons = duckduckgoApiStrategy("https://github.com");
		expect(icons).toHaveLength(1);
		expect(icons[0]?.url).toContain("icons.duckduckgo.com");
		expect(icons[0]?.url).toContain("github.com");
		expect(icons[0]?.source).toBe("duckduckgo-api");
	});
});
