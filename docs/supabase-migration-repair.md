# Supabase migration repair (Ox Mac)

**Repo:** [oxbreed/december-circuit](https://github.com/oxbreed/december-circuit)  
**Symptoms (seen in order on the Mac):**

1. `ERROR: relation "submissions" already exists` while applying `20261022104500_unpublished_submissions_and_reviews.sql` — remote schema exists, history missing those versions.
2. After repairing the first three as `applied` on `cursor/admin-probe-ui`:  
   `Remote migration versions not found in local migrations directory.`  
   CLI suggests `supabase migration repair --status reverted 20261024201200` and/or `supabase db pull`.

**Cause of (2):** Remote history has `20261024201200` (UGC) but `cursor/admin-probe-ui` does **not** ship that migration file. An earlier push failed on `submissions` before UGC SQL could run, so UGC **objects are likely absent** and the remote history row is stale (or from a mistaken `repair --status applied`). Prefer verifying objects, then **revert** the history row — do **not** `db pull` into a dump that overwrites intentional branch layout, and do **not** drop tables.

**Do not** destroy remote data. Do **not** run `supabase db reset`, drop tables, or wipe the project. `migration repair` only edits the history table; it does not run or undo SQL.

Product note: UGC (`cursor/supabase-ugc`) is still **pended** for product work. Treat **apply UGC** vs **admin probe / wp_probes only** as an explicit choice below.

---

## What push reported

Typical pending set when history is empty but schema exists:

| Version | File | On `main`? |
| --- | --- | --- |
| `20261022104500` | `unpublished_submissions_and_reviews.sql` | yes |
| `20261023141200` | `private_submission_images.sql` | yes |
| `20261024101000` | `place_business_submissions.sql` | yes |
| `20261024201200` | `ugc_ratings_votes_photos_qa.sql` | **no** — `cursor/supabase-ugc` |
| `20261025060000` | `wp_probes.sql` | yes (merged via admin probe UI) |
| `20261025114500` | `admin_service_role_select.sql` | yes — explicit `service_role` grants for `/admin` reads |

If `wp_probes` was **not** in the pending list, that file is not on the branch you pushed from. Get it from `cursor/admin-probe-ui` after history is repaired (see Path B / C).

---

## Idempotency (why repair, not re-push)

| Migration | Safe to re-run on a DB that already has it? |
| --- | --- |
| `20261022104500` | **No** — bare `create table` / `create policy` (this is the error you hit). |
| `20261023141200` | **No** — `insert into storage.buckets` without `on conflict`; bare `create policy`; constraint adds can clash. |
| `20261024101000` | **Mostly no** — columns use `if not exists`, but constraint rewrites assume a clean prior step. |
| `20261024201200` (UGC) | **Mostly yes** — `if not exists`, `drop policy if exists`, bucket `on conflict do nothing`. Still prefer history repair if objects already exist. |
| `20261025060000` (wp_probes) | **No** — bare `create table` / `create index`. |

We are **not** rewriting older migration files for `IF NOT EXISTS` here: that would change checksums for anyone who already recorded those versions. Prefer `migration repair`. Greenfield (empty project) can keep using the current SQL as-is.

---

## 0. Mac prep

```bash
cd ~/Documents/december-circuit
git fetch origin
supabase login          # if needed
supabase link           # pick DirtyDecember / december-circuit project if not linked
supabase migration list
supabase db push --dry-run
```

Confirm the failing / pending versions match the table above. Leave the remote DB alone until verification below.

---

## 1. Verify remote schema (SQL editor) — no deletes

In Supabase Dashboard → SQL → New query. Run:

```sql
-- Core tables from 20261022104500
select to_regclass('public.submissions') as submissions,
       to_regclass('public.reviews') as reviews;

-- 20261023141200 markers
select column_name
from information_schema.columns
where table_schema = 'public' and table_name = 'submissions'
  and column_name = 'image_path';

select id, public from storage.buckets where id = 'submission-images';

-- 20261024101000 markers
select column_name
from information_schema.columns
where table_schema = 'public' and table_name = 'submissions'
  and column_name in ('category', 'note', 'latitude', 'longitude')
order by 1;

-- UGC markers (20261024201200) — expect empty if UGC never applied
select to_regclass('public.helpful_votes') as helpful_votes,
       to_regclass('public.review_photos') as review_photos,
       to_regclass('public.ugc_questions') as ugc_questions,
       to_regclass('public.ugc_answers') as ugc_answers;

select column_name
from information_schema.columns
where table_schema = 'public' and table_name = 'reviews'
  and column_name in ('subject_kind', 'subject_key', 'rating', 'status')
order by 1;

select id from storage.buckets where id = 'review-photos';

-- Admin probe markers (20261025060000)
select to_regclass('public.wp_probes') as wp_probes,
       to_regclass('public.wp_probe_settings') as wp_probe_settings;

-- What history already knows
select version, name
from supabase_migrations.schema_migrations
order by version;
```

Interpretation for Ox’s error:

- `submissions` / `reviews` present → mark `20261022104500` **applied** (do not re-run).
- `image_path` + `submission-images` bucket → mark `20261023141200` **applied**.
- `category` / `note` / lat / lon → mark `20261024101000` **applied**.
- UGC tables/columns **absent** → do **not** mark `20261024201200` applied. If remote history already lists it, **revert** that version (Path B § ghost UGC). If history does not list it and you stay on admin-probe-ui, leave it alone.
- UGC tables/columns **present** but file missing on current branch → copy the file from `cursor/supabase-ugc` so local matches remote, then push only what is still pending (usually `wp_probes`).
- `wp_probes` **absent** and file missing locally → bring file from `cursor/admin-probe-ui`, then push (do not repair).

---

## 2. Repair history for schema that already exists

`migration repair` inserts/deletes rows in `supabase_migrations.schema_migrations` only.

Given the error (`submissions` already exists) and a normal DirtyDecember remote that already took the intake migrations via SQL editor or an earlier untracked apply, mark the first three as applied:

```bash
cd ~/Documents/december-circuit

supabase migration repair --status applied \
  20261022104500 \
  20261023141200 \
  20261024101000
```

Only if step 1 shows UGC objects **already** on remote:

```bash
supabase migration repair --status applied 20261024201200
```

Only if step 1 shows `wp_probes` / `wp_probe_settings` **already** on remote:

```bash
supabase migration repair --status applied 20261025060000
```

Then:

```bash
supabase migration list
supabase db push --dry-run
```

Dry-run should **no longer** list the repaired versions. It should list only migrations whose SQL is still missing on remote.

---

## 3. Choose what to push next

### Path A — Apply UGC (and later wp_probes)

Use when you intentionally want Free Tier reviews/ratings/Q&A live now (overrides the “UGC pended” product hold).

```bash
cd ~/Documents/december-circuit
git fetch origin
git checkout cursor/supabase-ugc
# history already repaired for 20261022104500..20261024101000

supabase db push --dry-run
# expect: 20261024201200_ugc_ratings_votes_photos_qa.sql only

supabase db push
```

Then add admin probe schema (still missing until this file exists locally):

```bash
git checkout cursor/admin-probe-ui -- supabase/migrations/20261025060000_wp_probes.sql
# commit on a working branch if you want it tracked, then:
supabase db push --dry-run
supabase db push
```

Or merge/rebase onto `cursor/admin-probe-ui` after UGC, then push once if both files are present and neither is repaired.

### Path B — Admin probe / `wp_probes` only (recommended while UGC is pended)

Avoid applying `20261024201200` SQL. Work from `cursor/admin-probe-ui` (has `wp_probes`, no UGC file).

#### B1 — First three already repaired; dry-run complains about remote-only `20261024201200`

This is the current Mac state after:

```text
Remote migration versions not found in local migrations directory.
supabase migration repair --status reverted 20261024201200
# (CLI may also suggest db pull — skip pull for Path B)
```

**Step 1 — check objects (SQL editor), no deletes:**

```sql
select to_regclass('public.helpful_votes') as helpful_votes,
       to_regclass('public.ugc_questions') as ugc_questions;

select column_name
from information_schema.columns
where table_schema = 'public' and table_name = 'reviews'
  and column_name = 'subject_kind';
```

**Step 2a — UGC objects absent (likely):** ghost history only. Revert the version, then push `wp_probes`:

```bash
cd ~/Documents/december-circuit
# already on cursor/admin-probe-ui

supabase migration repair --status reverted 20261024201200

supabase migration list
supabase db push --dry-run
# expect: 20261025060000_wp_probes.sql only

supabase db push
```

**Step 2b — UGC objects present:** keep history; bring the missing file onto this branch so local matches remote, then push only `wp_probes` (do **not** revert; do **not** drop UGC tables):

```bash
cd ~/Documents/december-circuit
git fetch origin
git checkout cursor/supabase-ugc -- supabase/migrations/20261024201200_ugc_ratings_votes_photos_qa.sql
# optional: commit that file on a working branch so list/push stay clean

supabase migration list
supabase db push --dry-run
# expect: 20261025060000_wp_probes.sql only (UGC already in remote history)

supabase db push
```

Do **not** run `supabase db pull` for this Path B fix: pull writes a new remote-schema migration and is the wrong tool when you only need history ↔ files aligned for one known version.

#### B2 — Fresh Path B (first three not yet repaired)

```bash
cd ~/Documents/december-circuit
git fetch origin
git checkout cursor/admin-probe-ui

supabase migration repair --status applied \
  20261022104500 \
  20261023141200 \
  20261024101000

# If migration list / dry-run then flags remote-only 20261024201200 → follow B1
supabase migration list
supabase db push --dry-run
supabase db push
```

After push, set Vercel `WP_PROBE_INGEST_SECRET` (and existing `SUPABASE_SERVICE_ROLE_KEY`) and redeploy — see [wp-probe-monitor.md](./wp-probe-monitor.md).

### Path C — Both UGC and wp_probes in one push

Need **both** migration files on disk, history repaired for anything already live, then one push:

```bash
git fetch origin
git checkout -b cursor/db-push-ugc-and-probes origin/main
git checkout cursor/supabase-ugc -- supabase/migrations/20261024201200_ugc_ratings_votes_photos_qa.sql
git checkout cursor/admin-probe-ui -- supabase/migrations/20261025060000_wp_probes.sql

supabase migration repair --status applied \
  20261022104500 \
  20261023141200 \
  20261024101000

supabase db push --dry-run
# expect: ugc then wp_probes (timestamp order)

supabase db push
```

---

## 4. Confirm

```bash
supabase migration list
# LOCAL and REMOTE columns should align for every file in supabase/migrations/
```

Re-run the SQL checks in step 1. For Path B, `wp_probes` / `wp_probe_settings` should exist; UGC regs should still be null.

---

## 5. If something is half-applied

Example: `submissions` exists but `image_path` / bucket missing → **do not** repair `20261023141200` yet; dry-run/push that one version only after the earlier ones are repaired. If push still fails mid-file, stop and fix the specific object in SQL editor to match the migration intent, then `repair --status applied` that version — still without dropping live submission/review rows.

Wrong repair (marked applied but SQL never ran): mark reverted, then push carefully:

```bash
supabase migration repair --status reverted 20261025060000
supabase db push --dry-run
supabase db push
```

---

## Exact commands Ox should run next (Path B — current Mac)

First three already `applied`. On `cursor/admin-probe-ui`. Dry-run / push fail because remote history has `20261024201200` without a local file. UGC SQL almost certainly never ran.

**1. SQL editor (no deletes):**

```sql
select to_regclass('public.helpful_votes') as helpful_votes,
       to_regclass('public.ugc_questions') as ugc_questions;

select column_name
from information_schema.columns
where table_schema = 'public' and table_name = 'reviews'
  and column_name = 'subject_kind';
```

**2a. If those are null / empty (expected) — revert ghost UGC history, push probes:**

```bash
cd ~/Documents/december-circuit
# stay on cursor/admin-probe-ui

supabase migration repair --status reverted 20261024201200

supabase migration list
supabase db push --dry-run
# expect only: 20261025060000_wp_probes.sql

supabase db push
```

**2b. If UGC objects exist — keep history, add the file, then push probes:**

```bash
cd ~/Documents/december-circuit
git fetch origin
git checkout cursor/supabase-ugc -- supabase/migrations/20261024201200_ugc_ratings_votes_photos_qa.sql

supabase migration list
supabase db push --dry-run
# expect only: 20261025060000_wp_probes.sql

supabase db push
```

Skip `supabase db pull` for this fix. Do not drop tables or `db reset`.

If product wants UGC SQL applied for real instead, use **Path A** after clearing the ghost (2a), or stay on a branch that has the UGC file and `db push` that version when objects are still absent.

---

## Related

- [Supabase UGC](./supabase-ugc.md) — pended branch `cursor/supabase-ugc`
- [WP probe monitor](./wp-probe-monitor.md) — migration `20261025060000_wp_probes.sql` on `cursor/admin-probe-ui`
