# Qasim Hussain, research site

This repository holds the source of a personal research site, published at
<https://qasim-hussain-code.github.io/> through GitHub Pages. The site consists of
one static page and a small nightly job that refreshes the figures the page
reports. There is no build step, no framework and no dependency that has to be
installed before the page renders, and every component runs within the free
allowances of GitHub, Hugging Face and Google Fonts.

The guiding principle is that every claim on the page should be checkable.
Counts of repositories and datasets are read from the public GitHub and
Hugging Face interfaces at load time. The daily writing counter is computed
from a fixed start date. Publication metadata is transcribed from the records
held by the publishers and can be resolved through each article's digital
object identifier. Where a value cannot be verified, the page leaves the
element empty and says so, rather than supplying a plausible figure.

## Viewing the page locally

Opening `index.html` directly in a browser renders the whole page. One detail
differs from the published version: browsers refuse to read local files
through `fetch`, so the contribution calendar cannot load `data/activity.json`
and falls back to the public activity feed. To see the page exactly as it is
served, run a local server from the repository root and open
`http://localhost:5173`:

```powershell
npx --yes serve . -l 5173
```

Any static file server will do; the Live Server extension for Visual Studio
Code behaves the same way.

## Layout of the repository

```text
index.html                     the entire site: markup, styles and script
assets/portrait.jpg            portrait, 570 by 760 pixels, used for the social card
assets/portrait-square.jpg     square portrait, used as the favicon
assets/Qasim_Hussain_CV.pdf    curriculum vitae
data/activity.json             daily contribution record, rewritten nightly
data/profile.json              repository and dataset counts, written by the job
data/series.json               chapters completed, the one value edited by hand
scripts/refresh.mjs            the nightly refresh job
.github/workflows/refresh.yml  runs the job every two hours
```

## Publishing

The site is served from the `main` branch of a public repository named
`Qasim-Hussain-Code.github.io`. In the repository settings, under Pages, the
source is "Deploy from a branch", the branch is `main` and the folder is the
root. Every push to `main` is a deployment; there is no build to wait for.

## The nightly refresh

GitHub exposes the contribution calendar only through its GraphQL interface,
which requires an authenticated request even for public data. The job
therefore needs a fine grained personal access token with read only access
to public repositories and no other permission. The token is stored as the
repository secret `GH_TOKEN` and appears nowhere else: not in a file, not in a
commit message, and not in this document.

Once the secret exists, running the workflow "Refresh site data" from the
Actions tab confirms that it works; thereafter it runs every two hours. A run
rewrites `data/activity.json` and `data/profile.json` only when a figure has
changed, and commits them under the repository owner's name, so the record on
the page is never more than a few hours old and quiet days add no commits. Without the token the job still writes
`data/profile.json`, and the page falls back to the public activity feed,
which covers roughly ninety days. Nothing breaks; the window shown is simply
shorter.

Two cautions are worth recording. Scheduled workflows can start late at busy
times, so the calendar should not be expected to update at a precise minute. A fine grained token expires, and when it does the failure is
silent: the page reverts to the shorter window. A reminder set a week before
the expiry date avoids the surprise.

## What is maintained by hand

One value: the number of chapters completed in Machine Learning for Biology.
It lives in `data/series.json`:

```json
{
  "start": "2026-07-24",
  "chapters": 4
}
```

When a chapter is finished, change the number and commit; the page reads the
file on every load, so the figure updates within a minute of the push. The
easiest way is to open the file on GitHub, press the pencil, change the
number and choose "Commit changes". The day counter is calendar based and
advances on its own from the start date.

Everything else is either fetched live from GitHub and Hugging Face, or listed
in the `REPOS` and `DSETS` arrays. A new repository is one line in `REPOS`, in
the form `['repository_name','group_id']`; a new dataset needs nothing, because
the table is read from Hugging Face on every load.

## Known items

- The repository index uses the names exactly as they appear on GitHub. If a
  repository is renamed, change its entry in the `REPOS` array (and in `DSETS`
  for the Hugging Face dataset of the same name) in the same commit.
