-- Company quotes gain 'event' (office decorating sessions and The Table).
-- 'table' stays valid for rows saved before 27 Sep 2026.
alter table public.enquiries drop constraint if exists enquiries_about_check;
alter table public.enquiries add constraint enquiries_about_check check (about in ('box', 'workshop', 'table', 'event'));
