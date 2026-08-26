import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const robotsPath = fileURLToPath(new URL('../../public/robots.txt', import.meta.url));
const llmsPath = fileURLToPath(new URL('../../public/llms.txt', import.meta.url));

describe('discovery assets', () => {
	it('explicitly allows selected search and AI crawlers', async () => {
		const robots = await readFile(robotsPath, 'utf8');

		for (const crawler of [
			'OAI-SearchBot',
			'GPTBot',
			'ClaudeBot',
			'Claude-SearchBot',
			'anthropic-ai',
			'PerplexityBot',
			'Google-Extended',
		]) {
			expect(robots).toContain(`User-agent: ${crawler}\nAllow: /`);
		}

		expect(robots).toContain('Sitemap: https://notabenesztuka.pl/sitemap-index.xml');
	});

	it('provides a concise Polish summary for agents that request llms.txt', async () => {
		const llms = await readFile(llmsPath, 'utf8');

		expect(llms).toContain('# Nota Bene Sztuka');
		expect(llms).toContain('Korepetycje z historii sztuki online');
		expect(llms).toContain('https://notabenesztuka.pl/#oferta');
	});
});
