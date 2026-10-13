-- Additional schema for full website content management.
-- Requires the existing private.is_product_admin() helper from schema.sql.
create table if not exists public.site_settings (
 id text primary key default 'main' check (id = 'main'),
 site_title text not null default 'Royal Roots Trading & Co.',
 tagline text not null default '',
 logo_url text not null default '',
 primary_color text not null default '#071b62' check (primary_color ~ '^#[0-9A-Fa-f]{6}$'),
 accent_color text not null default '#d4a127' check (accent_color ~ '^#[0-9A-Fa-f]{6}$'),
 contact_email text not null default '', contact_phone text not null default '',
 whatsapp text not null default '', address text not null default '',
 about_text text not null default '', meta_description text not null default '',
 updated_at timestamptz not null default now()
);
create table if not exists public.site_sections (
 id uuid primary key default gen_random_uuid(),
 title text not null default '' check (char_length(title) <= 180),
 body text not null default '' check (char_length(body) <= 6000),
 image_url text not null default '', button_text text not null default '',
 button_url text not null default '', sort_order integer not null default 0,
 visible boolean not null default true, created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;
alter table public.site_sections enable row level security;
grant select on public.site_settings, public.site_sections to anon, authenticated;
grant insert, update, delete on public.site_settings, public.site_sections to authenticated;
drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings" on public.site_settings for select to anon, authenticated using (true);
drop policy if exists "Admins manage site settings" on public.site_settings;
create policy "Admins manage site settings" on public.site_settings for all to authenticated using (private.is_product_admin()) with check (private.is_product_admin());
drop policy if exists "Public can read visible site sections" on public.site_sections;
create policy "Public can read visible site sections" on public.site_sections for select to anon, authenticated using (visible = true or private.is_product_admin());
drop policy if exists "Admins manage site sections" on public.site_sections;
create policy "Admins manage site sections" on public.site_sections for all to authenticated using (private.is_product_admin()) with check (private.is_product_admin());
insert into public.site_settings (id) values ('main') on conflict (id) do nothing;
