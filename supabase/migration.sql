-- OfferteFlits — initieel schema + Row Level Security
-- Plak dit volledige script in Supabase Dashboard → SQL Editor → New query → Run.

create extension if not exists "pgcrypto";

-- ─── profiles: 1 bedrijfsprofiel per ingelogde gebruiker ───────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  bedrijfsnaam text not null default 'Mijn Vakbedrijf',
  adres text not null default '',
  kvk_nummer text not null default '',
  btw_nummer text not null default '',
  iban text not null default '',
  email text not null default '',
  telefoon text not null default '',
  standaard_uurtarief numeric not null default 55,
  standaard_btw_percentage numeric not null default 21,
  logo_url text,
  merkkleur text not null default '#111827',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiel: alleen eigenaar" on public.profiles;
create policy "profiel: alleen eigenaar" on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

-- Bij registratie automatisch een leeg profiel aanmaken
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, bedrijfsnaam)
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data->>'bedrijfsnaam', ''), 'Mijn Vakbedrijf')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── klanten: CRM-lite per bedrijf ──────────────────────────────────────────
create table if not exists public.klanten (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  naam text not null,
  adres text not null default '',
  email text not null default '',
  telefoon text not null default '',
  created_at timestamptz not null default now()
);

alter table public.klanten enable row level security;

drop policy if exists "klanten: alleen eigen bedrijf" on public.klanten;
create policy "klanten: alleen eigen bedrijf" on public.klanten
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create index if not exists klanten_profile_id_idx on public.klanten (profile_id);

-- ─── offertes ────────────────────────────────────────────────────────────
create table if not exists public.offertes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  klant_id uuid references public.klanten (id) on delete set null,
  offerte_nummer text not null,
  klant_naam text not null default '',
  klant_adres text not null default '',
  klant_email text not null default '',
  klus_omschrijving text not null default '',
  regels jsonb not null default '[]'::jsonb,
  btw_percentage numeric not null default 21,
  status text not null default 'concept'
    check (status in ('concept', 'verzonden', 'geaccepteerd', 'afgewezen')),
  opmerkingen text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Idempotent: voegt klant_email toe als de tabel al bestond van een eerdere run
alter table public.offertes add column if not exists klant_email text not null default '';

alter table public.offertes enable row level security;

drop policy if exists "offertes: alleen eigen bedrijf" on public.offertes;
create policy "offertes: alleen eigen bedrijf" on public.offertes
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create index if not exists offertes_profile_id_idx on public.offertes (profile_id);
create index if not exists offertes_klant_id_idx on public.offertes (klant_id);

-- ─── facturen: automatisch gegenereerd bij acceptatie van een offerte ──────
create table if not exists public.facturen (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  offerte_id uuid references public.offertes (id) on delete set null,
  factuur_nummer text not null,
  klant_naam text not null default '',
  klant_adres text not null default '',
  klant_email text not null default '',
  regels jsonb not null default '[]'::jsonb,
  btw_percentage numeric not null default 21,
  status text not null default 'open' check (status in ('open', 'betaald')),
  factuurdatum timestamptz not null default now(),
  vervaldatum timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz not null default now()
);

alter table public.facturen enable row level security;

drop policy if exists "facturen: alleen eigen bedrijf" on public.facturen;
create policy "facturen: alleen eigen bedrijf" on public.facturen
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create index if not exists facturen_profile_id_idx on public.facturen (profile_id);
create index if not exists facturen_offerte_id_idx on public.facturen (offerte_id);

-- ─── storage: logo's per bedrijf ────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

drop policy if exists "logo's: iedereen mag lezen (publieke bucket)" on storage.objects;
create policy "logo's: iedereen mag lezen (publieke bucket)"
  on storage.objects for select
  using (bucket_id = 'logos');

drop policy if exists "logo's: alleen eigenaar mag uploaden/wijzigen/verwijderen" on storage.objects;
create policy "logo's: alleen eigenaar mag uploaden/wijzigen/verwijderen"
  on storage.objects for all
  using (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text);
