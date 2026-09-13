# Qasim Hussain, research site

One static page and a nightly refresh job. No build step, no framework, no
dependency to install before it renders. Everything runs inside free
allowances.

Open `index.html` in a browser to see it. To see the contribution calendar read
its real data file rather than falling back to the public activity feed, serve
the folder instead:

```powershell
npx --yes serve . -l 5173
```

Then open `http://localhost:5173`.

## Layout

```
index.html                     the entire site
assets/portrait.jpg            full resolution portrait
assets/portrait-square.jpg     social card and favicon
assets/Qasim_Hussain_CV.pdf    add this; the page already links to it
data/activity.json             daily contribution record, rewritten nightly
data/profile.json              counts, written nightly
scripts/refresh.mjs            the refresh job
.github/workflows/refresh.yml  runs it at 06:00 Taipei
```

## Publishing

1. Create a **public** repository named `Qasim-Hussain-Code.github.io`.
2. Push this folder to `main`.
3. Settings, Pages: source "Deploy from a branch", branch `main`, folder
   `/ (root)`.

A push is a deploy. There is no build to wait for.

## The nightly refresh

The contribution calendar comes from the GitHub GraphQL API, which requires a
token even for public data.

1. Create a fine grained personal access token with read only access to public
   repositories and no other permission.
2. Add it to the repository as the Actions secret `GH_TOKEN`.
3. Run "Refresh site data" once from the Actions tab to confirm, then leave it.

Without the token the job still writes `data/profile.json`, and the page falls
back to the public activity feed, which covers about ninety days. Nothing
breaks; the window shown is simply shorter.

## What is maintained by hand

Exactly two values, at the top of the script block in `index.html`:

```js
seriesStart: '2026-07-24',   // day 1 of Machine Learning for Biology
seriesChapters: 3
```

The day counter is calendar based and reads day 52 on 13 September 2026. It
advances on its own.

Everything else is either fetched live from GitHub and Hugging Face, or listed
phase 5.

## Known items

- `assets/Qasim_Hussain_CV.pdf` does not exist yet. Add it or remove the two
  links that point at it.
- Two repositories need renaming on GitHub before their index entries resolve:
  `qiime2_micobiome_analysis` and `cell_profiler_nuclei_to_cytoplasm_ration`.
  The page already uses the corrected spellings.
- The Hugging Face dataset `qiime2_antibiotic_microbiome_analysis` shows a
  `DatasetGenerationCastError` in the viewer. That error is visible to anyone
  who opens it, so it is worth fixing before the address is circulated.

## Deliberately absent

- The *Biomedicines* 13(7):1785 paper, on instruction. It is indexed on PubMed
  phase 2.
- Any reference to the Bacteroides work as a manuscript. The repository itself
  is public and appears in the index under its own name.
- Analytics, tracking, cookie banners and third party scripts of every kind.
