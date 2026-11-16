import { assert, load } from './runtime.mjs';
const web = await load('web/index.ts');
assert.equal(web.isNewer('1.10.0', '1.9.0'), true);
assert.equal(web.isNewer('1.2.3', '1.2.3'), false);
assert.equal(web.isNewer('1.2.2', '1.2.3'), false);
assert.equal(await web.fetchUpdate('https://example.org/update', async () => { throw new Error('offline'); }), null);
const server = await load('server/index.ts');
assert.equal(server.updateUrlFor('https://ourapps.app/l/abc123'), 'https://ourapps.app/api/public/links/abc123/latest');
assert.equal(server.updateUrlFor('https://ourapps.app/l/abc123/extra'), null);
