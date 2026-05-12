import { http } from './client.js';
import { setToken, clearToken } from './client.js';

export const backendAuthApi = {
    signup: async dto => {
        const res = await http.post('/api/auth/signup', dto);
        if (res?.access_token) setToken(res.access_token);
        return res;
    },
    signin: async dto => {
        const res = await http.post('/api/auth/signin', dto);
        if (res?.access_token) setToken(res.access_token);
        return res;
    },
    signout: () => {
        clearToken();
    },
};
