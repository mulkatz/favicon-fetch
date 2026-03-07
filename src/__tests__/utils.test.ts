import { describe, expect, it } from "vitest";
import { getOrigin, guessMimeType, parseSizes, resolveUrl } from "../utils";

describe("resolveUrl", () => {
	it("resolves relative URLs", () => {
		expect(resolveUrl("/favicon.png", "https://example.com/page")).toBe(
			"https://example.com/favicon.png",
		);
	});

	it("returns absolute URLs as-is", () => {
		expect(
			resolveUrl("https://cdn.example.com/icon.png", "https://example.com"),
		).toBe("https://cdn.example.com/icon.png");
	});

	it("resolves protocol-relative URLs", () => {
		expect(
			resolveUrl("//cdn.example.com/icon.png", "https://example.com"),
		).toBe("https://cdn.example.com/icon.png");
	});
});

describe("getOrigin", () => {
	it("extracts origin from URL", () => {
		expect(getOrigin("https://example.com/path?query=1")).toBe(
			"https://example.com",
		);
	});
});

describe("guessMimeType", () => {
	it("identifies common image types", () => {
		expect(guessMimeType("icon.png")).toBe("image/png");
		expect(guessMimeType("icon.ico")).toBe("image/x-icon");
		expect(guessMimeType("icon.svg")).toBe("image/svg+xml");
		expect(guessMimeType("icon.jpg")).toBe("image/jpeg");
		expect(guessMimeType("icon.webp")).toBe("image/webp");
	});

	it("handles URLs with query strings", () => {
		expect(guessMimeType("icon.png?v=2")).toBe("image/png");
	});

	it("returns undefined for unknown extensions", () => {
		expect(guessMimeType("file.txt")).toBeUndefined();
	});
});

describe("parseSizes", () => {
	it("parses valid sizes", () => {
		expect(parseSizes("32x32")).toEqual({ width: 32, height: 32 });
		expect(parseSizes("192x192")).toEqual({ width: 192, height: 192 });
	});

	it("returns undefined for 'any'", () => {
		expect(parseSizes("any")).toBeUndefined();
	});

	it("returns undefined for null", () => {
		expect(parseSizes(null)).toBeUndefined();
	});
});
