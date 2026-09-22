import AxeBuilder from '@axe-core/playwright';
import { Page } from '@playwright/test';

/** Returns true when the page is wider than the viewport. */
export async function hasHorizontalScroll(page: Page): Promise<boolean> {
  return page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
}

/** Returns the visible texts whose font size is below the given size in pixels. */
export async function findSmallTexts(page: Page, minSize: number): Promise<string[]> {
  return page.evaluate((min) => {
    /** Checks whether the element contains text of its own. */
    const hasOwnText = (element: Element): boolean =>
      Array.from(element.childNodes).some(
        (node) => node.nodeType === Node.TEXT_NODE && !!node.textContent?.trim(),
      );
    return Array.from(document.body.querySelectorAll('*'))
      .filter((element) => hasOwnText(element) && element.checkVisibility())
      .filter((element) => parseFloat(getComputedStyle(element).fontSize) < min)
      .map((element) => element.textContent?.trim() ?? '');
  }, minSize);
}

/** Returns the ids of all accessibility rules the page violates. */
export async function findAccessibilityViolations(page: Page): Promise<string[]> {
  const results = await new AxeBuilder({ page }).analyze();
  return results.violations.map((violation) => violation.id);
}

/** Collects console errors, page errors and requests to other hosts while the page runs. */
export function watchPageProblems(page: Page, allowedOrigins: string[]): string[] {
  const problems: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') problems.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => problems.push(`error: ${error.message}`));
  page.on('request', (request) => {
    const isAllowed = allowedOrigins.some((origin) => request.url().startsWith(origin));
    if (!isAllowed) problems.push(`request: ${request.url()}`);
  });
  return problems;
}
