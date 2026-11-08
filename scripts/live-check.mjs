// Read-only check of the live site, run from GitHub Actions (no sign-in, no data written).
import { chromium } from 'playwright';
const SITE = process.env.SITE_URL || 'https://study-in-china-psi.vercel.app';
const SB = 'https://gtmzayvorvajufhcpxjk.supabase.co';
const KEY = 'sb_publishable_1t6w_YnKEylif06X2wAcbw_CBdwu9PM';
const out = []; let fails = 0;
const ok = (c, msg) => { out.push(`${c ? 'PASS' : 'FAIL'} ${msg}`); if (!c) fails++; };

// 1) Security headers on the live site
const res = await fetch(SITE + '/');
for (const h of ['content-security-policy', 'x-frame-options', 'x-content-type-options', 'strict-transport-security', 'referrer-policy'])
  ok(!!res.headers.get(h), `header ${h}`);

// 2) Anonymous visitor cannot read or write private data through the API
const H = { apikey: KEY, 'Content-Type': 'application/json' };
for (const t of ['profiles', 'student_applications', 'audit_logs', 'payments', 'messages']) {
  const r = await fetch(`${SB}/rest/v1/${t}?select=*&limit=5`, { headers: H });
  const body = r.ok ? await r.json() : [];
  ok(Array.isArray(body) && body.length === 0, `anon read ${t} -> ${r.status}, ${Array.isArray(body) ? body.length : '?'} rows`);
}
const ins = await fetch(`${SB}/rest/v1/student_applications`, { method: 'POST', headers: { ...H, Prefer: 'return=minimal' }, body: JSON.stringify({ id: 'ANON-PROBE', user_id: '00000000-0000-0000-0000-000000000000', data: {} }) });
ok(ins.status >= 400, `anon insert application -> ${ins.status}`);
const upd = await fetch(`${SB}/rest/v1/site_content?id=eq.main`, { method: 'PATCH', headers: { ...H, Prefer: 'return=representation' }, body: JSON.stringify({ updated_at: new Date().toISOString() }) });
const updBody = upd.ok ? await upd.json() : [];
ok(!upd.ok || updBody.length === 0, `anon edit site content -> ${upd.status}, ${updBody.length ?? 0} rows changed`);
const sec = await fetch(`${SB}/rest/v1/rpc/security_overview`, { method: 'POST', headers: H, body: '{}' });
ok(sec.status >= 400, `anon security_overview -> ${sec.status}`);
const lst = await fetch(`${SB}/storage/v1/object/list/student-documents`, { method: 'POST', headers: { ...H, Authorization: `Bearer ${KEY}` }, body: JSON.stringify({ prefix: '', limit: 10 }) });
const lstBody = lst.ok ? await lst.json() : [];
ok(!lst.ok || lstBody.length === 0, `anon list student files -> ${lst.status}, ${lstBody.length ?? 0} items`);
const pub = await fetch(`${SB}/rest/v1/site_content?select=id`, { headers: H });
ok(pub.status === 200, `public site content readable -> ${pub.status}`);

// 3) Pages render with real Supabase, no CSP blocks, no JS errors
const browser = await chromium.launch();
for (const [path, expect] of [['/', /Study In China/i], ['/apply', /Personal Information|Informations personnelles/i], ['/login', /Sign in|Connexion/i], ['/admin', /Restricted|réservé/i], ['/student/dashboard', /Sign in|Connexion|Study In China/i]]) {
  for (const width of [390, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errs = []; const blocked = [];
    page.on('pageerror', e => errs.push(e.message));
    page.on('console', m => { const t = m.text(); if (/Content Security Policy|Refused to/.test(t)) blocked.push(t.slice(0, 160)); else if (m.type() === 'error') errs.push(t.slice(0, 160)); });
    let sbOk = 0, sbFail = 0;
    page.on('response', r => { if (r.url().startsWith(SB)) (r.status() < 400 ? sbOk++ : sbFail++); });
    await page.goto(SITE + path, { waitUntil: 'networkidle' });
    const text = await page.innerText('body');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    ok(expect.test(text), `${path} @${width}px renders`);
    ok(blocked.length === 0, `${path} @${width}px no CSP block ${blocked.join(' | ')}`);
    ok(errs.length === 0, `${path} @${width}px no JS error ${errs.join(' | ')}`);
    ok(overflow <= 1, `${path} @${width}px no horizontal scroll (${overflow}px)`);
    if (path === '/' && width === 1440) ok(sbOk > 0 && sbFail === 0, `home talks to Supabase (${sbOk} ok, ${sbFail} failed)`);
    await page.close();
  }
}
await browser.close();
console.log(out.join('\n'));
console.log(`\n${fails} failure(s)`);
process.exit(fails ? 1 : 0);
