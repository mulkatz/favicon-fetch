import { type ChildProcess, spawn } from "node:child_process";
import { chromium } from "playwright";

const WIDTH = 800;
const HEIGHT = 600;
const DEV_URL = "http://localhost:5173";

async function waitForServer(url: string, timeout = 15000): Promise<void> {
	const start = Date.now();
	while (Date.now() - start < timeout) {
		try {
			const res = await fetch(url);
			if (res.ok) return;
		} catch {
			// not ready yet
		}
		await new Promise((r) => setTimeout(r, 500));
	}
	throw new Error(`Server at ${url} did not start within ${timeout}ms`);
}

async function startDevServer(): Promise<ChildProcess> {
	const proc = spawn("npm", ["run", "dev"], {
		cwd: new URL("../demo", import.meta.url).pathname,
		stdio: "pipe",
	});
	await waitForServer(DEV_URL);
	return proc;
}

async function wait(ms: number): Promise<void> {
	return new Promise((r) => setTimeout(r, ms));
}

async function record() {
	console.log("Starting demo dev server...");
	const server = await startDevServer();

	try {
		console.log("Launching browser...");
		const browser = await chromium.launch();

		// Pre-load
		const warmupCtx = await browser.newContext({ viewport: { width: WIDTH, height: HEIGHT } });
		const warmupPage = await warmupCtx.newPage();
		await warmupPage.goto(DEV_URL, { waitUntil: "networkidle" });
		await wait(1000);
		await warmupCtx.close();

		// Record
		const context = await browser.newContext({
			viewport: { width: WIDTH, height: HEIGHT },
			recordVideo: { dir: "./tmp-video", size: { width: WIDTH, height: HEIGHT } },
		});

		const page = await context.newPage();
		await page.goto(DEV_URL, { waitUntil: "networkidle" });
		await wait(1500);

		// Click some quick-pick buttons
		const buttons = ["github.com", "stripe.com", "linear.app", "figma.com", "vercel.com"];
		for (const site of buttons) {
			await page.click(`button:text("${site}")`);
			await wait(800);
		}

		await wait(1500);

		// Type a custom domain
		await page.fill('input[type="text"]', "wikipedia.org");
		await wait(500);
		await page.click('button:text("Fetch")');
		await wait(1500);

		console.log("Recording complete. Saving video...");
		await context.close();
		await browser.close();

		console.log("Video saved to tmp-video/");
	} finally {
		server.kill();
	}
}

record().catch((err) => {
	console.error("Recording failed:", err);
	process.exit(1);
});
