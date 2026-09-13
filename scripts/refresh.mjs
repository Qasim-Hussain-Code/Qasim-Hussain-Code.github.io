/**
 * Nightly refresh for the portfolio site.
 *
 * Writes two files that the page reads at load time:
 *   data/activity.json   one entry per day of GitHub contributions, twelve months
 *   data/profile.json    repository and dataset counts, with the top datasets
 *
 * The GitHub contribution calendar is only available through the GraphQL API,
 * which requires a token. A fine grained token with no scopes beyond public
 * read access is sufficient. Store it as the repository secret GH_TOKEN.
 * If the token is absent the script still writes profile.json and leaves the
 * existing activity.json untouched, so the page degrades rather than breaks.
 */
import { writeFile, readFile } from 'node:fs/promises';

const USER = process.env.GH_USER || 'Qasim-Hussain-Code';
const HF   = process.env.HF_USER || 'QasimHussain';
const TOKEN = process.env.GH_TOKEN;

async function contributions() {
  if (!TOKEN) { console.warn('GH_TOKEN not set, skipping the contribution calendar.'); return null; }
  const to = new Date();
  const from = new Date(to); from.setFullYear(from.getFullYear() - 1);
  const query = `query($login:String!,$from:DateTime!,$to:DateTime!){
    user(login:$login){ contributionsCollection(from:$from,to:$to){
      contributionCalendar{ totalContributions
        weeks{ contributionDays{ date contributionCount } } } } } }`;
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { login: USER, from: from.toISOString(), to: to.toISOString() } })
  });
  if (!res.ok) throw new Error(`GitHub GraphQL returned ${res.status}`);
  const json = await res.json();
  const cal = json?.data?.user?.contributionsCollection?.contributionCalendar;
  if (!cal) throw new Error('No calendar in the GraphQL response.');
  const days = cal.weeks.flatMap(w => w.contributionDays)
    .filter(d => d.contributionCount > 0)
    .map(d => ({ date: d.date, count: d.contributionCount }));
  return { total: cal.totalContributions, days };
}

async function profile() {
  const out = { generated_at: new Date().toISOString() };
  const gh = await fetch(`https://api.github.com/users/${USER}`,
    TOKEN ? { headers: { Authorization: `bearer ${TOKEN}` } } : undefined);
  if (gh.ok) { const j = await gh.json(); out.public_repos = j.public_repos; }

  const hf = await fetch(`https://huggingface.co/api/datasets?author=${HF}&limit=200`);
  if (hf.ok) {
    const list = await hf.json();
    out.datasets = list.length;
    out.top_datasets = list
      .filter(d => typeof d.downloads === 'number')
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, 12)
      .map(d => ({ id: d.id.split('/')[1], downloads: d.downloads, likes: d.likes ?? 0 }));
  }

  const hm = await fetch(`https://huggingface.co/api/models?author=${HF}&limit=200`);
  if (hm.ok) { const m = await hm.json(); out.models = m.length; }
  return out;
}

const p = await profile();
await writeFile('data/profile.json', JSON.stringify(p, null, 2) + '\n');
console.log('profile.json written:', p.public_repos, 'repositories,', p.datasets, 'datasets');

try {
  const c = await contributions();
  if (c) {
    await writeFile('data/activity.json', JSON.stringify({
      generated_at: new Date().toISOString(),
      source: 'GitHub contributionsCollection, trailing twelve months',
      user: USER, total: c.total, days: c.days
    }, null, 2) + '\n');
    console.log('activity.json written:', c.days.length, 'active days,', c.total, 'contributions');
  }
} catch (err) {
  console.warn('Contribution calendar not refreshed:', err.message);
  await readFile('data/activity.json').catch(() => {});
}
