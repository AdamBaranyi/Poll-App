import { expect, test as base } from '@playwright/test';

import { mockSupabase, SupabaseMock } from './supabase-mock';

/** Playwright test in which every Supabase request is answered by the mock. */
export const test = base.extend<{ supabase: SupabaseMock }>({
  supabase: [
    async ({ page }, use) => {
      const supabase = await mockSupabase(page);
      await use(supabase);
      expect(supabase.unexpectedRequests, 'Supabase requests without test data').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
