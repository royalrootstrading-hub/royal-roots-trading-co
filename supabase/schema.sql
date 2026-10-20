-- Supabase schema for the Royal Roots product catalogue.
create extension if not exists pgcrypto;
create table if not exists public.products(
 id uuid primary key default gen_random_uuid(),
 name text not null check(char_length(trim(name)) between 1 and 160),
 category text not null default 'General',
 description text not null default '',
 image_urls text[] not null default '{}',
 published boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.product_admins(
 user_id uuid primary key references auth.users(id) on delete cascade,
 created_at timestamptz not null default now()
);
alter table public.products enable row level security;
alter table public.product_admins enable row level security;
grant select on public.products to anon,authenticated;
grant insert,update,delete on public.products to authenticated;
grant select on public.product_admins to authenticated;
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;
create or replace function private.is_product_admin()
returns boolean language sql stable security definer set search_path=''
as $$ select exists(select 1 from public.product_admins pa where pa.user_id=(select auth.uid())); $$;
revoke all on function private.is_product_admin() from public;
grant execute on function private.is_product_admin() to anon, authenticated;
drop policy if exists "Published products are public; admins can read all" on public.products;
create policy "Published products are public; admins can read all" on public.products for select to anon,authenticated using(published=true or private.is_product_admin());
drop policy if exists "Admins insert products" on public.products;
create policy "Admins insert products" on public.products for insert to authenticated with check(private.is_product_admin());
drop policy if exists "Admins update products" on public.products;
create policy "Admins update products" on public.products for update to authenticated using(private.is_product_admin()) with check(private.is_product_admin());
drop policy if exists "Admins delete products" on public.products;
create policy "Admins delete products" on public.products for delete to authenticated using(private.is_product_admin());
drop policy if exists "Users read own admin row" on public.product_admins;
create policy "Users read own admin row" on public.product_admins for select to authenticated using(user_id=(select auth.uid()));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('product-images','product-images',true,8388608,array['image/jpeg','image/png','image/webp','image/gif'])
on conflict(id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "Public view product images" on storage.objects;
create policy "Public view product images" on storage.objects for select to anon,authenticated using(bucket_id='product-images');
drop policy if exists "Admins upload own folder images" on storage.objects;
create policy "Admins upload own folder images" on storage.objects for insert to authenticated with check(bucket_id='product-images' and (storage.foldername(name))[1]=(select auth.uid())::text and private.is_product_admin());
drop policy if exists "Admins update own folder images" on storage.objects;
create policy "Admins update own folder images" on storage.objects for update to authenticated using(bucket_id='product-images' and (storage.foldername(name))[1]=(select auth.uid())::text and private.is_product_admin()) with check(bucket_id='product-images' and (storage.foldername(name))[1]=(select auth.uid())::text and private.is_product_admin());
drop policy if exists "Admins delete own folder images" on storage.objects;
create policy "Admins delete own folder images" on storage.objects for delete to authenticated using(bucket_id='product-images' and (storage.foldername(name))[1]=(select auth.uid())::text and private.is_product_admin());
