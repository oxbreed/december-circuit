# Support inbox

Ask support has two parts: a chat with December guide, and a Leave a message form.

Chat answers from `/api/support` use the site files, or a model key if one is set. Those chat turns are not stored.

Leave a message posts to `/api/support/request`. The server checks the fields, ignores honeypot fills, rate limits by address, and stores the name, email, topic, message, and page path in `support_requests`.

Apply `supabase/migrations/20261121140000_support_requests.sql` before the form can store rows in Supabase. Do not apply it from this note; Ox applies migrations.

The admin Support section is `/admin?section=support`. It lists open and resolved requests, filters by topic or search, marks a request open or resolved, and offers a reply-by-email link. Access uses the existing admin allowlist and the service role key.

There is no outbound mail provider on this site for automatic notifications. Replies are sent by the team from hello@dirtydecember.info or partners@dirtydecember.info.
