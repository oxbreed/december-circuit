-- Indexes to support /admin Dashboard / Insights range aggregates.
-- Not applied from the pull request that adds this file.

create index if not exists page_views_ts_covering
  on public.page_views (ts desc)
  include (path, country, referrer, ua);

create index if not exists outbound_clicks_ts_earning
  on public.outbound_clicks (ts desc, earning);

create index if not exists outbound_clicks_from_path_ts
  on public.outbound_clicks (from_path, ts desc);

create index if not exists submissions_created_at_desc
  on public.submissions (created_at desc);

create index if not exists web_vitals_ts_metric_value
  on public.web_vitals (ts desc, metric, value);
