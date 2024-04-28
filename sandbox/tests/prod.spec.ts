import { test, expect, Page } from '@playwright/test'
import { goHome } from './util'

test('check memory state', async ({ page }) => {
	await goHome(page)
	await page.getByRole('button', { name: 'Calculate Memory State' }).click()
	await expect
		.poll(
			async () => {
				let memoryStateText = await page
					.locator('#memoryStateResponse')
					.innerText()
				return memoryStateText.split(',').map((x) => Math.round(parseFloat(x)))
			},
			{
				intervals: [200],
			},
		)
		.toEqual([27, 5])
})

test('check next interval', async ({ page }) => {
	await goHome(page)
	await page.getByRole('button', { name: 'Calculate Next Interval' }).click()
	await expect(page.locator('#nextIntervalResponse')).toHaveText('2')
})

test('check progress and parameters', async ({ page }) => {
	await goHome(page)
	await page.getByRole('button', { name: 'Train with example file' }).click()
	let progress = await page.locator('#progressNumbers').innerText()
	expect(progress).toEqual('0/0')
	await expect
		.poll(
			async () => {
				let progress = await page.locator('#progressNumbers').innerText()
				let [n, d] = progress.split('/').map((x) => Math.round(parseInt(x)))
				return {
					numeratorLargerThan0: n > 0,
					numeratorLessThanDenominator: n < d,
					denominatorIsLarge: d > 10000,
				}
			},
			{
				message: 'Progress goes up',
				timeout: 20_000,
				intervals: [200],
			},
		)
		.toEqual({
			numeratorLargerThan0: true,
			numeratorLessThanDenominator: true,
			denominatorIsLarge: true,
		})
	await expect
		.poll(
			async () => {
				let parameters = await page.locator('#parametersResult').innerText()
				return parameters.split(',').length
			},
			{
				timeout: 20_000,
				intervals: [200],
			},
		)
		.toEqual(17)
})
