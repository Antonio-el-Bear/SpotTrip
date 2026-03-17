const API_BASE_URL = 'http://127.0.0.1:8000';

type ApiFetchOptions = RequestInit & {
	token?: string | null;
};

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}, token?: string | null): Promise<T> {
	const headers = new Headers(options.headers);
	if (!headers.has('Content-Type') && options.body) {
		headers.set('Content-Type', 'application/json');
	}
	if (token) {
		headers.set('Authorization', `Bearer ${token}`);
	}

	const response = await fetch(`${API_BASE_URL}${path}`, {
		...options,
		headers,
		credentials: options.credentials ?? 'include'
	});

	if (!response.ok) {
		throw new Error(`Request failed with status ${response.status}`);
	}

	if (response.status === 204) {
		return undefined as T;
	}

	return response.json() as Promise<T>;
}