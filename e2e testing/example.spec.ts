import { test } from '@playwright/test';

test('Is Hosted', async ({ page }) => {
	await page.goto('http://localhost:3000');
});
