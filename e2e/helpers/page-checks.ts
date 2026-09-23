import AxeBuilder from '@axe-core/playwright';
import { expect, Page } from '@playwright/test';

/** Opens a page and waits until it shows its content, has loaded its data and its fonts. */
export async function openPage(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('status').filter({ hasText: 'Loading' })).toHaveCount(0);
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

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

// These parts keep the orange from the Figma design, as the mentor asked, although it is lighter
// than the WCAG contrast asks for. The school does not require the contrast, the rest is still checked.
const FIGMA_COLOURED = ['app-survey-info h1', '.message h1', '.live', '.percent'];

/** Returns the ids of all accessibility rules the page violates. */
export async function findAccessibilityViolations(page: Page): Promise<string[]> {
  const others = await new AxeBuilder({ page }).disableRules(['color-contrast']).analyze();
  const contrast = await contrastCheck(page).analyze();
  return [...others.violations, ...contrast.violations].map((violation) => violation.id);
}

/** Builds a contrast check that leaves out the parts with their Figma colour. */
function contrastCheck(page: Page): AxeBuilder {
  return FIGMA_COLOURED.reduce(
    (builder, selector) => builder.exclude(selector),
    new AxeBuilder({ page }).withRules(['color-contrast']),
  );
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

/** Returns the visible buttons that change without a transition when the pointer is over them. */
export async function findButtonsWithoutTransition(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    [...document.querySelectorAll('button')]
      .filter((button) => button.offsetParent !== null)
      .filter((button) => getComputedStyle(button).transitionDuration === '0s')
      .map((button) => `${button.className} ${(button.textContent ?? '').trim()}`.trim()),
  );
}
