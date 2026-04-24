import axios from 'axios';
import { auth } from './firebase';

// Initialize the base Axios instance pointing to the Django API
const apiClient = axios.create({
    baseURL: 'http://localhost:8000/api/',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Implement the Request Interceptor
apiClient.interceptors.request.use(
    async (config) => {
        const user = auth.currentUser;
        if (user) {
            // Retrieve a fresh JWT from Firebase
            const token = await user.getIdToken();
            // Inject the token into the Authorization header
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;