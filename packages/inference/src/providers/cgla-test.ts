/**
 * CGLA Provider test script
 *
 * Execution method:
 *   npx tsx packages/inference/src/providers/cgla-test.ts
 */

import { CGLAProvider } from "./cgla.js";


// Configuration: FPGA server information
const FPGA_URL = "http://163.221.183.110:8080"; 
const MODEL_NAME = "imax-model";
const API_TOKEN = "dummy";

async function runTest() {
	console.log("=".repeat(50));
	console.log("CGLA Provider test start");
	console.log("=".repeat(50));

	// Instantiate the provider
	const provider = new CGLAProvider(API_TOKEN, FPGA_URL);

	// Test A: Test endpoint generation (makeRoute)
	console.log("\n[Test 1] makeRoute test");
	const route = provider.makeRoute(MODEL_NAME);
	const fullUrl = `${FPGA_URL}${route}`;
	console.log(`  Route: ${route}`);
	console.log(`  Full URL: ${fullUrl}`);

	// Test B: Test request body generation (preparePayload)
	console.log("\n[Test 2] preparePayload test");
	const hfArgs = {
		messages: [{ role: "user" as const, content: "Hello FPGA, are you working?" }],
		max_tokens: 50,
		temperature: 0.7,
	};

	const payload = provider.preparePayload(MODEL_NAME, hfArgs);
	console.log("  Generated payload (OpenAI format):");
	console.log(JSON.stringify(payload, null, 2));

	// --- Step C: 実際の通信テスト ---
	console.log("\n[Test 3] Test communication with FPGA server");
	console.log(`  Destination: ${fullUrl}`);
	console.log("  Sending request...\n");

	try {
		const response = await fetch(fullUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		console.log(`  Status: ${response.status} ${response.statusText}`);

		if (!response.ok) {
			throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
		}

		// Test response parsing (new API)
		const resultText = await provider.getResponse(response);
		console.log("\n  ✅ Success! Response from FPGA:");
		console.log("  " + "-".repeat(40));
		console.log(`  ${resultText}`);
		console.log("  " + "-".repeat(40));
	} catch (error) {
			console.error("\n  ❌ Communication failed:");
			console.error(`  ${error}`);
	}

	console.log("\n" + "=".repeat(50));
	console.log("Test completed");
	console.log("=".repeat(50));
}

// Main execution
runTest().catch(console.error);
