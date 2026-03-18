import axios from 'axios';
import i18n from '@/i18n/config';

const axiosClient = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	headers: {
		'Accept': 'application/json',
	},
});

axiosClient.interceptors.request.use((config) => {
	const token = localStorage.getItem('ACCESS_TOKEN');
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	config.headers['Accept-Language'] = i18n.language;

	if (config.data instanceof FormData) {
		delete config.headers['Content-Type'];
	}

	return config;
});

axiosClient.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		const { response } = error;

		// 401: Unauthorized
		// 419: Authentication Timeout (Laravel CSRF/Session)
		if (response && [401, 419].includes(response.status)) {
			// Clear local storage to prevent infinite loops or invalid states
			localStorage.removeItem('ACCESS_TOKEN');

			// Optional: Prevent redirect if we're already on login to avoid loops
			if (window.location.pathname !== '/vadmin/login') {
				window.location.href = '/vadmin/login';
			}
		}

		return Promise.reject(error);
	}
);

export default axiosClient;
