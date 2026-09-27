-- Applied as migration "multi_brand_separation".
-- Multi-brand separation (Dormers is the legal merchant; Berry Brown is the brand).
-- Adds customers and payments, and makes the order ↔ Stripe boundary explicit.

-- CUSTOMERS ------------------------------------------------------------
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text,
  phone text not null unique
);
comment on table public.customers is 'Berry Brown customers only, keyed by UAE mobile. Never shared with Dormers data.';
alter table public.customers enable row level security;
revoke all on public.customers from anon, authenticated;

-- ORDERS: spec column names, currency, tax, customer link, refunded state --
alter table public.orders rename column stripe_session_id to stripe_checkout_session_id;
alter table public.orders rename column stripe_payment_intent to stripe_payment_intent_id;
alter table public.orders
  add column customer_id uuid references public.customers (id) on delete set null,
  add column currency text not null default 'AED',
  add column tax integer not null default 0;
alter table public.orders drop constraint orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('pending', 'paid', 'confirmed', 'delivered', 'cancelled', 'refunded'));
create unique index orders_stripe_checkout_session_id_idx on public.orders (stripe_checkout_session_id) where stripe_checkout_session_id is not null;
create index orders_stripe_payment_intent_id_idx on public.orders (stripe_payment_intent_id) where stripe_payment_intent_id is not null;
create index orders_customer_id_idx on public.orders (customer_id);
comment on column public.orders.tax is 'Always 0: Dormers Restaurant L.L.C. is not registered for VAT.';

-- PAYMENTS: one row per Stripe payment event, idempotent on the event id --
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  order_id uuid not null references public.orders (id) on delete cascade,
  provider text not null default 'stripe' check (provider = 'stripe'),
  provider_payment_id text not null,
  status text not null check (status in ('succeeded', 'failed', 'refunded')),
  amount integer not null,
  currency text not null default 'AED',
  paid_at timestamptz,
  raw_event_id text not null unique
);
comment on table public.payments is 'Written by the Stripe webhook only. provider_payment_id is the PaymentIntent (or Charge for refunds). Reconcile: order.total → payments → Stripe payout.';
create index payments_order_id_idx on public.payments (order_id);
alter table public.payments enable row level security;
revoke all on public.payments from anon, authenticated;
