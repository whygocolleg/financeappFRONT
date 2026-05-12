import { http } from './client.js';

export const goalsApi = {
    getAll:  ()          => http.get('/api/goals'),
    getOne:  id          => http.get(`/api/goals/${id}`),
    create:  dto         => http.post('/api/goals', dto),
    update:  (id, dto)   => http.patch(`/api/goals/${id}`, dto),
    delete:  id          => http.delete(`/api/goals/${id}`),
    addSaving: (id, dto) => http.post(`/api/goals/${id}/save`, dto),
};
