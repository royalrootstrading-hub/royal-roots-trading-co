-- Projects portfolio for the /website/ page. Pictures live in the existing public
-- "product-images" storage bucket (uploaded from website-admin.html, Projects tab).
-- Requires private.is_product_admin() from schema.sql.
create table if not exists public.site_projects (
 id uuid primary key default gen_random_uuid(),
 title text not null default '' check (char_length(title) between 1 and 180),
 location text not null default '' check (char_length(location) <= 180),
 category text not null default '' check (char_length(category) <= 80),
 description text not null default '' check (char_length(description) <= 3000),
 image_urls text[] not null default '{}' check (cardinality(image_urls) <= 12),
 sort_order integer not null default 0,
 visible boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.site_projects enable row level security;
grant select on public.site_projects to anon, authenticated;
grant insert, update, delete on public.site_projects to authenticated;
drop policy if exists "Public can read visible projects" on public.site_projects;
create policy "Public can read visible projects" on public.site_projects
 for select to anon, authenticated using (visible = true or private.is_product_admin());
drop policy if exists "Admins manage projects" on public.site_projects;
create policy "Admins manage projects" on public.site_projects
 for all to authenticated using (private.is_product_admin()) with check (private.is_product_admin());
