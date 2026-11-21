-- Aggregates for /admin Dashboard / Insights.
-- Not applied from the pull request that adds this file.
--
-- Today's Insights path pulls up to 20,000 page_views, 5,000 outbound_clicks,
-- and 20,000 web_vitals rows into the app and aggregates in TypeScript.
-- This function returns one compact JSON report instead. The app falls back
-- to the row fetch if the function is not on the database yet.
--
-- Grants: service_role only. Invoker rights, so a leaked grant still hits RLS
-- (these tables have no policies for anon or authenticated).

create index if not exists page_views_ts_human
  on public.page_views (ts desc)
  include (path, country, referrer, ua)
  where ua is null
     or ua !~* 'bot|crawler|spider|slurp|bingpreview|facebookexternalhit|bytespider';

create or replace function public.admin_insights_report(
  p_range text,
  p_end timestamptz default now()
)
returns jsonb
language plpgsql
stable
set search_path = public
as $$
declare
  range_key text := coalesce(nullif(p_range, ''), '7d');
  period_end timestamptz := coalesce(p_end, now());
  period_start timestamptz;
  previous_start timestamptz;
  window_len interval;
  bot_re text := 'bot|crawler|spider|slurp|bingpreview|facebookexternalhit|bytespider';
  report jsonb;
begin
  if range_key not in ('24h', '7d', '30d', '90d') then
    range_key := '7d';
  end if;

  window_len := case range_key
    when '24h' then interval '24 hours'
    when '7d' then interval '7 days'
    when '30d' then interval '30 days'
    else interval '90 days'
  end;

  period_start := period_end - window_len;
  previous_start := period_start - window_len;

  with views as (
    select
      path,
      country,
      referrer,
      ua,
      ts,
      (ts >= period_start) as is_current
    from public.page_views
    where ts >= previous_start
      and ts < period_end
      and (ua is null or ua !~* bot_re)
  ),
  clicks as (
    select
      id,
      kind,
      partner,
      target,
      destination_host,
      placement,
      from_path,
      ts,
      earning,
      (ts >= period_start) as is_current,
      (placement is not distinct from 'admin-migration-verify') as is_test
    from public.outbound_clicks
    where ts >= previous_start
      and ts < period_end
  ),
  subs as (
    select
      id,
      kind,
      event_name,
      business_name,
      product_name,
      city,
      created_at,
      (created_at >= period_start) as is_current
    from public.submissions
    where created_at >= previous_start
      and created_at < period_end
  ),
  view_kpi as (
    select
      count(*) filter (where is_current)::int as page_views,
      count(*) filter (where not is_current)::int as prev_page_views,
      count(distinct (coalesce(country, '??') || '|' || left(coalesce(ua, 'unknown'), 80)))
        filter (where is_current)::int as sessions,
      count(distinct (coalesce(country, '??') || '|' || left(coalesce(ua, 'unknown'), 80)))
        filter (where not is_current)::int as prev_sessions
    from views
  ),
  click_kpi as (
    select
      count(*) filter (where is_current and not is_test)::int as clicks,
      count(*) filter (where not is_current and not is_test)::int as prev_clicks,
      count(*) filter (where is_current and not is_test and earning is true)::int as earning_clicks,
      count(*) filter (where not is_current and not is_test and earning is true)::int as prev_earning_clicks
    from clicks
  ),
  sub_kpi as (
    select
      count(*) filter (where is_current)::int as submissions,
      count(*) filter (where not is_current)::int as prev_submissions
    from subs
  ),
  view_buckets as (
    select
      case
        when range_key = '24h' then to_char(ts at time zone 'Europe/London', 'YYYY-MM-DD"T"HH24')
        else to_char(ts at time zone 'Europe/London', 'YYYY-MM-DD')
      end as bucket,
      count(*)::int as count
    from views
    where is_current
    group by 1
  ),
  click_buckets as (
    select
      case
        when range_key = '24h' then to_char(ts at time zone 'Europe/London', 'YYYY-MM-DD"T"HH24')
        else to_char(ts at time zone 'Europe/London', 'YYYY-MM-DD')
      end as bucket,
      count(*)::int as count
    from clicks
    where is_current and not is_test
    group by 1
  ),
  top_pages as (
    select path as label, count(*)::int as count
    from views
    where is_current and path is not null and path <> ''
    group by path
    order by count desc, path
    limit 8
  ),
  top_referrers as (
    select host as label, count(*)::int as count
    from (
      select regexp_replace(
        case
          when referrer ~* '^https?://' then substring(referrer from '://([^/?#]+)')
          else referrer
        end,
        '^www\.',
        ''
      ) as host
      from views
      where is_current and referrer is not null and referrer <> ''
    ) parsed
    where host is not null
      and host <> ''
      and host not ilike '%dirtydecember.info%'
    group by host
    order by count desc, host
    limit 8
  ),
  top_countries as (
    select country as label, count(*)::int as count
    from views
    where is_current and country is not null and country <> ''
    group by country
    order by count desc, country
    limit 8
  ),
  top_devices as (
    select
      case
        when ua is null or ua = '' then 'Unknown'
        when ua ~* 'iPad' then 'Tablet'
        when ua ~* 'Mobile|iPhone|Android' and ua !~* 'Android.*Tablet' then 'Mobile'
        else 'Desktop'
      end as label,
      count(*)::int as count
    from views
    where is_current
    group by 1
    order by count desc, label
    limit 6
  ),
  top_browsers as (
    select
      case
        when ua is null or ua = '' then 'Unknown'
        when ua ~* 'Edg/' then 'Edge'
        when ua ~* 'OPR/|Opera' then 'Opera'
        when ua ~* 'Chrome/' and ua !~* 'Edg/' then 'Chrome'
        when ua ~* 'Firefox/' then 'Firefox'
        when ua ~* 'Safari/' and ua !~* 'Chrome/' then 'Safari'
        else 'Other'
      end as label,
      count(*)::int as count
    from views
    where is_current
    group by 1
    order by count desc, label
    limit 6
  ),
  top_partners as (
    select partner as label, count(*)::int as count
    from clicks
    where is_current and not is_test and partner is not null and partner <> ''
    group by partner
    order by count desc, partner
    limit 8
  ),
  top_placements as (
    select placement as label, count(*)::int as count
    from clicks
    where is_current and not is_test and placement is not null and placement <> ''
    group by placement
    order by count desc, placement
    limit 8
  ),
  top_click_paths as (
    select from_path as label, count(*)::int as count
    from clicks
    where is_current and not is_test and from_path is not null and from_path <> ''
    group by from_path
    order by count desc, from_path
    limit 8
  ),
  vital_rows as (
    select metric, value
    from public.web_vitals
    where ts >= period_start
      and ts < period_end
      and metric in ('LCP', 'INP', 'CLS')
      and value is not null
  ),
  vitals as (
    select
      metric,
      percentile_cont(0.75) within group (order by value) as p75,
      count(*)::int as samples
    from vital_rows
    group by metric
  ),
  activity as (
    (
      select
        'click-' || id::text as id,
        'click'::text as kind,
        coalesce(
          nullif(trim(coalesce(partner, '') || case when target is not null and target <> '' then ': ' || target else '' end), ''),
          destination_host,
          'Outbound click'
        ) as title,
        nullif(concat_ws(' · ', kind, coalesce(nullif(placement, ''), from_path)), '') as detail,
        ts
      from clicks
      where is_current
      order by ts desc
      limit 8
    )
    union all
    (
      select
        'sub-' || id::text as id,
        'submission'::text as kind,
        coalesce(event_name, business_name, product_name, kind, 'Submission') as title,
        nullif(concat_ws(' · ', kind, city), '') as detail,
        created_at as ts
      from subs
      where is_current
      order by created_at desc
      limit 8
    )
  )
  select jsonb_build_object(
    'range', range_key,
    'periodStart', period_start,
    'periodEnd', period_end,
    'previousStart', previous_start,
    'kpis', jsonb_build_object(
      'pageViews', view_kpi.page_views,
      'prevPageViews', view_kpi.prev_page_views,
      'sessions', view_kpi.sessions,
      'prevSessions', view_kpi.prev_sessions,
      'clicks', click_kpi.clicks,
      'prevClicks', click_kpi.prev_clicks,
      'earningClicks', click_kpi.earning_clicks,
      'prevEarningClicks', click_kpi.prev_earning_clicks,
      'submissions', sub_kpi.submissions,
      'prevSubmissions', sub_kpi.prev_submissions
    ),
    'viewBuckets', coalesce((select jsonb_agg(jsonb_build_object('bucket', bucket, 'count', count) order by bucket) from view_buckets), '[]'::jsonb),
    'clickBuckets', coalesce((select jsonb_agg(jsonb_build_object('bucket', bucket, 'count', count) order by bucket) from click_buckets), '[]'::jsonb),
    'topPages', coalesce((select jsonb_agg(jsonb_build_object('label', label, 'count', count) order by count desc, label) from top_pages), '[]'::jsonb),
    'topReferrers', coalesce((select jsonb_agg(jsonb_build_object('label', label, 'count', count) order by count desc, label) from top_referrers), '[]'::jsonb),
    'topCountries', coalesce((select jsonb_agg(jsonb_build_object('label', label, 'count', count) order by count desc, label) from top_countries), '[]'::jsonb),
    'topDevices', coalesce((select jsonb_agg(jsonb_build_object('label', label, 'count', count) order by count desc, label) from top_devices), '[]'::jsonb),
    'topBrowsers', coalesce((select jsonb_agg(jsonb_build_object('label', label, 'count', count) order by count desc, label) from top_browsers), '[]'::jsonb),
    'topPartners', coalesce((select jsonb_agg(jsonb_build_object('label', label, 'count', count) order by count desc, label) from top_partners), '[]'::jsonb),
    'topPlacements', coalesce((select jsonb_agg(jsonb_build_object('label', label, 'count', count) order by count desc, label) from top_placements), '[]'::jsonb),
    'topClickPaths', coalesce((select jsonb_agg(jsonb_build_object('label', label, 'count', count) order by count desc, label) from top_click_paths), '[]'::jsonb),
    'vitals', coalesce((
      select jsonb_agg(jsonb_build_object('metric', metric, 'p75', p75, 'samples', samples) order by metric)
      from vitals
    ), '[]'::jsonb),
    'activity', coalesce((
      select jsonb_agg(jsonb_build_object('id', id, 'kind', kind, 'title', title, 'detail', coalesce(detail, case when kind = 'click' then 'Outbound click' else 'Submission' end), 'ts', ts) order by ts desc)
      from (select * from activity order by ts desc limit 10) recent
    ), '[]'::jsonb)
  )
  into report
  from view_kpi, click_kpi, sub_kpi;

  return report;
end;
$$;

comment on function public.admin_insights_report(text, timestamptz) is
  'Compact /admin Insights report for a 24h, 7d, 30d, or 90d window. Service role only.';

revoke all on function public.admin_insights_report(text, timestamptz) from public, anon, authenticated;
grant execute on function public.admin_insights_report(text, timestamptz) to service_role;
