import axios, {
	type AxiosError,
	type AxiosRequestConfig,
	type AxiosResponse,
} from "axios";
import Cookies from "js-cookie";

export type RequestConfig<TData = unknown> = {
	url?: string;
	method: "GET" | "PUT" | "PATCH" | "POST" | "DELETE" | "OPTIONS" | "HEAD";
	params?: unknown;
	data?: TData | FormData;
	responseType?:
		| "arraybuffer"
		| "blob"
		| "document"
		| "json"
		| "text"
		| "stream";
	signal?: AbortSignal;
	headers?: AxiosRequestConfig["headers"];
};

export type ResponseConfig<TData = unknown> = {
	data: TData;
	status: number;
	statusText: string;
	headers: AxiosResponse["headers"];
};

export type ResponseErrorConfig<TError = unknown> = AxiosError<TError>;

export const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL || "http://localhost:3333",
});

api.interceptors.request.use(async (config) => {
	const accessToken = Cookies.get("ezmoney-access-token");

	if (accessToken) {
		config.headers.Authorization = `Bearer ${accessToken}`;
	}

	if (import.meta.env.VITE_AXIOS_DELAY === "true") {
		await new Promise((resolve) => setTimeout(resolve, 3000));
	}

	return config;
});

api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			Cookies.remove("ezmoney-access-token");
			window.location.href = "/entrar";
		}

		return Promise.reject(error);
	},
);

const client = async <TData, _TError = unknown, TVariables = unknown>(
	config: RequestConfig<TVariables>,
): Promise<ResponseConfig<TData>> => {
	const response = await api({
		url: config.url,
		method: config.method,
		params: config.params as object,
		data: config.data,
		responseType: config.responseType,
		signal: config.signal,
		headers: config.headers,
	});

	return {
		data: response.data,
		status: response.status,
		statusText: response.statusText,
		headers: response.headers,
	};
};

export default client;
