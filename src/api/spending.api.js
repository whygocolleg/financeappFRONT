import { http } from './client.js';

export const spendingApi = {
    getToday:     ()                     => http.get('/api/spending/today'),
    create:       dto                    => http.post('/api/spending', dto),
    delete:       id                     => http.delete(`/api/spending/${id}`),
    getAnalytics: cycleDate              => http.get(`/api/spending/analytics?cycleDate=${cycleDate}`),
    save:         (spendingId, goalId)   => http.post(`/api/spending/${spendingId}/save`, { goalId }),
};
