import { useState, useCallback } from "react";

const EXAMPLE_SITES = [
	"github.com",
	"stackoverflow.com",
	"dev.to",
	"npmjs.com",
	"vercel.com",
	"cloudflare.com",
	"stripe.com",
	"linear.app",
	"notion.so",
	"figma.com",
	"youtube.com",
	"reddit.com",
];

const STRATEGIES = [
	{
		name: "HTML <link>",
		desc: "Parse <link rel=\"icon\"> tags from the page",
		key: "html-link",
	},
	{
		name: "Web Manifest",
		desc: "Extract icons from manifest.json",
		key: "web-manifest",
	},
	{
		name: "Default Paths",
		desc: "Try /favicon.ico, /favicon.png, /apple-touch-icon.png",
		key: "default-path",
	},
	{
		name: "Open Graph",
		desc: "Fall back to og:image meta tags",
		key: "open-graph",
	},
	{
		name: "Google API",
		desc: "Google's undocumented favicon service",
		key: "google-api",
	},
	{
		name: "DuckDuckGo API",
		desc: "DuckDuckGo's icon service",
		key: "duckduckgo-api",
	},
];

function FaviconPreview({ domain }: { domain: string }) {
	const [error, setError] = useState(false);
	const googleUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
	const ddgUrl = `https://icons.duckduckgo.com/ip3/${encodeURIComponent(domain)}.ico`;

	return (
		<div className="flex items-center gap-4 p-4 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
			<div className="shrink-0 w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden">
				{!error ? (
					<img
						src={googleUrl}
						alt={`${domain} favicon`}
						className="w-8 h-8"
						onError={() => setError(true)}
					/>
				) : (
					<img
						src={ddgUrl}
						alt={`${domain} favicon`}
						className="w-8 h-8"
					/>
				)}
			</div>
			<div className="min-w-0">
				<p className="text-sm font-medium text-zinc-200 truncate">{domain}</p>
				<p className="text-xs text-zinc-500 font-mono truncate">{googleUrl}</p>
			</div>
		</div>
	);
}

function InstallBlock() {
	const [copied, setCopied] = useState(false);
	const cmd = "npm install @mulkatz/favicon-fetch";

	return (
		<button
			onClick={() => {
				navigator.clipboard.writeText(cmd);
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			}}
			className="inline-flex items-center gap-3 px-5 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg font-mono text-sm transition-colors cursor-pointer hover:bg-zinc-800/50"
		>
			<span className="text-zinc-500">$</span>
			<span className="text-zinc-300">{cmd}</span>
			<span className="text-zinc-600 text-xs ml-2">
				{copied ? "copied!" : "click to copy"}
			</span>
		</button>
	);
}

export default function App() {
	const [input, setInput] = useState("");
	const [results, setResults] = useState<string[]>([]);

	const handleSearch = useCallback(() => {
		const domain = input.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
		if (domain && !results.includes(domain)) {
			setResults((prev) => [domain, ...prev]);
		}
		setInput("");
	}, [input, results]);

	return (
		<div className="min-h-screen">
			<div className="max-w-3xl mx-auto px-6">
				{/* Hero */}
				<section className="pt-24 pb-16 text-center">
					<p className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-6 font-mono">
						favicon-fetch
					</p>
					<h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-50 mb-4">
						One call. Best icon.
					</h1>
					<p className="text-lg text-zinc-400 max-w-xl mx-auto mb-10">
						Universal favicon fetcher with smart 6-strategy fallback chain.
						Works everywhere — Node.js, Deno, Bun, Cloudflare Workers.
					</p>
					<InstallBlock />
				</section>

				<hr className="border-zinc-800/50" />

				{/* Interactive demo */}
				<section className="py-16">
					<p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-6 font-mono">
						Try it
					</p>
					<div className="flex gap-3 mb-6">
						<input
							type="text"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleSearch()}
							placeholder="Enter a domain (e.g. github.com)"
							className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-600 text-sm font-mono focus:outline-none focus:border-zinc-600 transition-colors"
						/>
						<button
							onClick={handleSearch}
							className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm font-medium transition-colors cursor-pointer"
						>
							Fetch
						</button>
					</div>

					{/* Quick picks */}
					<div className="flex flex-wrap gap-2 mb-8">
						{EXAMPLE_SITES.map((site) => (
							<button
								key={site}
								onClick={() => {
									if (!results.includes(site)) {
										setResults((prev) => [site, ...prev]);
									}
								}}
								className="px-3 py-1.5 text-xs font-mono text-zinc-500 bg-zinc-900/50 border border-zinc-800/50 rounded-md hover:text-zinc-300 hover:border-zinc-700 transition-colors cursor-pointer"
							>
								{site}
							</button>
						))}
					</div>

					{/* Results */}
					<div className="space-y-3">
						{results.map((domain) => (
							<FaviconPreview key={domain} domain={domain} />
						))}
					</div>
				</section>

				<hr className="border-zinc-800/50" />

				{/* How it works */}
				<section className="py-16">
					<p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-8 font-mono">
						Fallback chain
					</p>
					<div className="space-y-1">
						{STRATEGIES.map((s, i) => (
							<div
								key={s.key}
								className="flex items-center gap-4 p-4 rounded-lg hover:bg-zinc-900/30 transition-colors"
							>
								<span className="text-zinc-600 font-mono text-xs w-4 shrink-0">
									{i + 1}
								</span>
								<div>
									<p className="text-sm font-medium text-zinc-300">
										{s.name}
									</p>
									<p className="text-xs text-zinc-500">{s.desc}</p>
								</div>
							</div>
						))}
					</div>
				</section>

				<hr className="border-zinc-800/50" />

				{/* Code example */}
				<section className="py-16">
					<p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-8 font-mono">
						Usage
					</p>
					<pre className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-lg text-sm font-mono overflow-x-auto">
						<code className="text-zinc-300">{`import { getFavicon, getAllFavicons } from "@mulkatz/favicon-fetch";

// Get the single best icon
const icon = await getFavicon("https://github.com");
// => { url: "https://github.com/favicon.svg", source: "html-link", type: "image/svg+xml" }

// Get all discovered icons, sorted by quality
const icons = await getAllFavicons("https://github.com");
// => [{ url: "...", source: "html-link", width: 192 }, ...]

// Customize strategies and timeout
const icon = await getFavicon("https://example.com", {
  timeout: 3000,
  strategies: ["html-link", "default-path", "google-api"],
});`}</code>
					</pre>
				</section>

				{/* Footer */}
				<footer className="py-16 text-center">
					<code className="inline-block px-6 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm">
						npm install @mulkatz/favicon-fetch
					</code>
					<div className="mt-8 flex justify-center gap-6 text-sm text-zinc-500">
						<a
							href="https://github.com/mulkatz/favicon-fetch"
							className="hover:text-zinc-300 transition-colors"
						>
							GitHub
						</a>
						<a
							href="https://npmjs.com/package/@mulkatz/favicon-fetch"
							className="hover:text-zinc-300 transition-colors"
						>
							npm
						</a>
						<span className="text-zinc-700">&lt;5KB gzipped</span>
					</div>
					<p className="mt-8 text-xs text-zinc-600">MIT License</p>
				</footer>
			</div>
		</div>
	);
}
