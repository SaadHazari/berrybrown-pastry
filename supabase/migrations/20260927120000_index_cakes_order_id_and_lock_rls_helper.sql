-- Applied as migration "index_cakes_order_id_and_lock_rls_helper".
-- Cover the cakes → orders foreign key (performance advisor).
create index if not exists cakes_order_id_idx on public.cakes (order_id);
-- The platform's rls_auto_enable() event-trigger function is SECURITY DEFINER and, by Postgres default,
-- executable by PUBLIC. It cannot do anything outside an event trigger, but the security advisor flags it.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
