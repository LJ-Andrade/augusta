import axios from 'axios';

const axiosPublic = axios.create({
	baseURL: import.meta.env.VITE_API_URL || 'http://vadmin3.test/api/',
	headers: {
		'Accept': 'application/json',
		'Content-Type': 'application/json',
	},
});

export default axiosPublic;
