-- Run this entire file in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  designation text not null,
  village text not null,
  taluk text not null,
  district text not null,
  mobile text not null,
  aadhaar text not null,
  photo_url text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  membership_no text,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id integer primary key,
  hero_text text default 'ನಮ್ಮ ಸಂಘಟನೆಗೆ ಸದಸ್ಯರಾಗಿ',
  sub_text text default 'ಸದಸ್ಯತ್ವ ನೋಂದಣಿ ಮಾಡಿ ಮತ್ತು PVC ID Card ಪಡೆಯಿರಿ',
  brand_color text default '#16a34a',
  updated_at timestamptz default now()
);

insert into public.site_settings(id) values (1) on conflict do nothing;

alter table public.applications enable row level security;
alter table public.site_settings enable row level security;

-- Public users can submit applications.
create policy "public insert applications"
on public.applications for insert to anon, authenticated
with check (true);

-- Authenticated admins can read/update applications.
create policy "authenticated read applications"
on public.applications for select to authenticated using (true);

create policy "authenticated update applications"
on public.applications for update to authenticated using (true) with check (true);

create policy "public read site settings"
on public.site_settings for select to anon, authenticated using (true);

create policy "authenticated update site settings"
on public.site_settings for update to authenticated using (true) with check (true);

-- Storage bucket for member photos.
insert into storage.buckets (id, name, public)
values ('member-photos','member-photos',true)
on conflict (id) do nothing;

create policy "public photo upload"
on storage.objects for insert to anon, authenticated
with check (bucket_id = 'member-photos');

create policy "public photo read"
on storage.objects for select to anon, authenticated
using (bucket_id = 'member-photos');

create policy "authenticated photo update"
on storage.objects for update to authenticated
using (bucket_id = 'member-photos');

-- Safe sequential membership number generator starting at 6164.
create sequence if not exists public.membership_number_seq start 6164;

create or replace function public.approve_application(
  p_id uuid,
  p_membership_no text default null
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  new_no text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if coalesce(trim(p_membership_no),'') <> '' then
    new_no := trim(p_membership_no);
  else
    new_no := nextval('public.membership_number_seq')::text;
  end if;

  update public.applications
    set status='approved', membership_no=new_no
    where id=p_id;

  if not found then
    raise exception 'Application not found';
  end if;

  return new_no;
end;
$$;

revoke all on function public.approve_application(uuid,text) from public;
grant execute on function public.approve_application(uuid,text) to authenticated;
