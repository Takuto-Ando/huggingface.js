import type { ChatCompletionInput, ChatCompletionOutput } from "@huggingface/tasks";
import { InferenceClientProviderOutputError } from "../errors.js";
import type { BaseArgs, BodyParams, InferenceProvider, UrlParams } from "../types.js";
import { TaskProviderHelper, type ConversationalTaskHelper } from "./providerHelper.js";

/**
 * CGLA Provider
 *
 * OpenAI-compatible endpoint: /v1/chat/completions
 */

const CGLA_API_BASE_URL = "http://163.221.183.110:8080";

export class CGLAProvider extends TaskProviderHelper implements ConversationalTaskHelper {
	constructor(baseUrl: string = CGLA_API_BASE_URL) {
		super("cgla" as InferenceProvider, baseUrl, true);
	}

	makeRoute(_params: UrlParams): string {
		void _params;
		return "/v1/chat/completions";
	}

	preparePayload(params: BodyParams<ChatCompletionInput & BaseArgs>): Record<string, unknown> {
		return {
			...params.args,
			model: params.model,
		};
	}

	async getResponse(response: unknown): Promise<ChatCompletionOutput> {
		if (
			typeof response === "object" &&
			Array.isArray((response as ChatCompletionOutput | null)?.choices) &&
			typeof (response as ChatCompletionOutput | null)?.created === "number" &&
			typeof (response as ChatCompletionOutput | null)?.id === "string" &&
			typeof (response as ChatCompletionOutput | null)?.model === "string" &&
			// Some providers may omit system_fingerprint
			((response as ChatCompletionOutput | null)?.system_fingerprint === undefined ||
				(response as ChatCompletionOutput | null)?.system_fingerprint === null ||
				typeof (response as ChatCompletionOutput | null)?.system_fingerprint === "string") &&
			typeof (response as ChatCompletionOutput | null)?.usage === "object"
		) {
			return response as ChatCompletionOutput;
		}

		throw new InferenceClientProviderOutputError("Expected ChatCompletionOutput");
	}
}

export const CGLAConversationalTask = CGLAProvider;
