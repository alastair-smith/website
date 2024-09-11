import { HttpResponse, http } from 'msw';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
  vi,
} from 'vitest';

import { API_URL, type BortResponse, addBort } from '@/services/bort';
import { server } from '@/services/bort/mockServer';

vi.mock('server-only', () => ({}));

describe('services bort', () => {
  beforeAll(() => server.listen());

  afterEach(() => {
    server.resetHandlers();
    vi.unstubAllGlobals();
  });

  afterAll(() => server.close());

  describe('addBort', () => {
    test('updates the bort count and returns the latest bort data', async () => {
      const successResponse: BortResponse = {
        count: 5,
      };

      expect(await addBort()).toEqual(successResponse);
    });

    test('throws an error when fetch fails', async () => {
      const responseError = new Error('Fetch request timed out');

      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(responseError));

      await expect(addBort()).rejects.toThrow(responseError);
    });

    test.each([400, 401, 403, 404, 500, 502, 503, 504])(
      'throws error for %i response status',
      async (responseStatus) => {
        server.use(
          http.post(API_URL, () => {
            return new HttpResponse(null, { status: responseStatus });
          })
        );

        await expect(addBort()).rejects.toThrow('Failed to post Bort data');
      }
    );

    test('throws an error if the response data is the wrong format', async () => {
      server.use(
        http.post(API_URL, () => {
          return HttpResponse.json({ borts: 12 }, { status: 200 });
        })
      );

      await expect(addBort()).rejects.toThrow(
        'Bort validation error: [{"code":"invalid_type","expected":"number","received":"undefined","path":["count"],"message":"Required"}].'
      );
    });
  });

  describe('getBort', () => {
    test('returns the latest bort data', async () => {});

    test('throws an error on fetch error', async () => {});

    test('throws an error on response error', async () => {});

    test('throws an error if the response data is the wrong format', async () => {});
  });
});
