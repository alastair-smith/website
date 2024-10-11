import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';

import { API_URL } from '@/services/bort';
import { addBortData, getBortCountData } from '@/services/bort/mockData';

export const handlers = [
  http.get(API_URL, ({ request, params, cookies }) => {
    return HttpResponse.json(getBortCountData);
  }),

  http.post(API_URL, ({ request, params, cookies }) => {
    return HttpResponse.json(addBortData);
  }),
];

export const server = setupServer(...handlers);
