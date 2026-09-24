---
name: check-frameworks
description: Check whether new versions of the API Green Score or EROOM referentials were published upstream
---

Check the upstream sources of the evaluation frameworks against what the app embeds, then report. This skill is read-only: never update data files unless the user explicitly asks.

## 1. Read what we embed

`src/data/frameworks.json` is the single source of truth. For each framework it gives `version`, `upstreamUrl` (source to watch) and `syncedAt` (date the embedded data was last synced).

```bash
cat src/data/frameworks.json
```

## 2. API Green Score

Upstream: https://github.com/API-Green-Score/APIGreenScore. The repo has no tags or releases: the version only appears in the filename of the scoring grid linked from the README (`48_CAT_Sustainable_API_GreenScore_V1-2.xlsx` means version `1.2`).

```bash
# Grid version referenced by the README
gh api repos/API-Green-Score/APIGreenScore/readme --jq .content | base64 -d \
  | grep -oE '[0-9]+_CAT_Sustainable_API_GreenScore_V[0-9-]+\.xlsx' | sort -u

# Commits since our last sync
SYNCED_AT=$(node -p 'require("./src/data/frameworks.json").apigreenscore.syncedAt')
gh api "repos/API-Green-Score/APIGreenScore/commits?since=${SYNCED_AT}T00:00:00Z" \
  --jq '.[] | .sha[0:7] + " " + .commit.committer.date[0:10] + " " + (.commit.message|split("\n")[0])'

# Rule ids upstream (from filenames) vs embedded
gh api repos/API-Green-Score/APIGreenScore/contents/chapters --jq '.[].name' \
  | grep -oE '^[A-Z]{2}[0-9]{2}' | sort > "$TMPDIR/upstream-rules.txt"
node -e 'require("./src/data/apigreenscore-survey-questions.json").forEach(q => console.log(q.id))' \
  | sort > "$TMPDIR/embedded-rules.txt"
diff "$TMPDIR/embedded-rules.txt" "$TMPDIR/upstream-rules.txt"
```

Also check the version columns (`V1 | V2 | V3`) of the "Identifiers" table in each `chapters/*_en.md`: a rule marked in V2 or V3 announces a new version.

```bash
for f in $(gh api repos/API-Green-Score/APIGreenScore/contents/chapters --jq '.[].name'); do
  echo "$f $(gh api repos/API-Green-Score/APIGreenScore/contents/chapters/$f --jq .content | base64 -d | grep -m1 -E '^\|\s+[A-Z]{2}[0-9]{2}')"
done
```

Finally check that the grid link from the README still responds (`curl -sSIL --max-time 20 <url>`).

Known, expected differences (do not report them as changes):
- `AR05` exists as a rule sheet upstream but has no weight in the V1-2 grid, so it is not embedded.
- `chapters/US07_en.md` shows `US06` in its table (upstream typo): always use filenames for rule ids.
- The grid link on `collectif-api-thinking.com` is dead (API-Green-Score/APIGreenScore#5). The V1-2 grid is archived at https://web.archive.org/web/20260226044514/https://www.collectif-api-thinking.com/assets/deliverables/worksites/48_CAT_Sustainable_API_GreenScore_V1-2.xlsx. If the issue is closed or the link works again, say so.

## 3. EROOM

Upstream: a public Google Drive folder (`eroom.upstreamUrl`). Its public listing needs no authentication and shows every file, unlike the Drive connector which may only see part of them.

```bash
curl -sSL --max-time 20 "https://drive.google.com/embeddedfolderview?id=10gcaVlUuJPp_GDJTILE4HCGFpZKVFYro" \
  | grep -oE 'flip-entry-title">[^<]*|flip-entry-last-modified"><div>[^<]*' \
  | sed -E 's/.*">(<div>)?//'
```

- The version is in the file titles: `EOF-V.1.1 (...)` means version `1.1`.
- Our data (`src/data/eroom-data-model-1-1.json`) comes from the **English** template: a modification date after `eroom.syncedAt` on that file means the content may have changed without a version bump. Changes on the French template alone do not affect us.
- Dates without a year belong to the current year.

## 4. Report

Give one line per framework with: embedded version, latest upstream version, status (up to date / new version / modified since sync / source unreachable), plus links to what changed (commits, files). End with the recommended next step. Do not open issues or edit files without asking.

## Updating a framework (only when asked)

1. Update the data file (`src/data/apigreenscore-survey-questions.json` or the EROOM data model; for a new EROOM version, create a new `eroom-data-model-X-Y.json` and update its imports).
2. Update `version` and `syncedAt` in `src/data/frameworks.json` (and `version` inside the EROOM data model: a unit test checks they match).
3. Run `npm run test:run` and `npm run build`, then check the versions displayed on `/doc` and `/about`.
