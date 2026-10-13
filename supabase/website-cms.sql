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

-- The built-in page sections can also be edited, hidden and reordered.
alter table public.site_sections add column if not exists target_id text;
create unique index if not exists site_sections_target_id_unique
 on public.site_sections(target_id) where target_id is not null;
drop policy if exists "Public can read visible site sections" on public.site_sections;
drop policy if exists "Public can read site sections" on public.site_sections;
create policy "Public can read site sections" on public.site_sections
 for select to anon, authenticated using (true);
insert into public.site_sections(target_id,title,body,sort_order,visible) values
('#home','Building a stronger future, together.','Quality building materials and modern construction solutions for homes, commercial spaces and industrial projects. Build with confidence. Build with Royal Roots.',0,true),
('.stats','Company statistics','',1,true),
('#products','Complete building solutions','Explore our range of walling, board, ceiling, flooring and structural solutions for modern construction requirements.',2,true),
('#gallery','See what we supply','A quick visual guide to our main boards and panels. Ask us for sizes, thicknesses and current rates.',3,true),
('#video','See it in action','Watch our video to learn more about boards and panels from Royal Roots Trading & Co.',4,true),
('#about','Your trusted building material partner','Royal Roots Trading & Co. is a building material company focused on supplying quality products and practical solutions for construction, renovation, interiors and commercial projects.',5,true),
('#advantages','Advantages that build confidence','Solutions selected with your construction goals, performance requirements and project needs in mind.',6,true),
('.cta','Ready to build something better?','Tell us about your project and let Royal Roots help you find the right solution.',7,true),
('#enquiry','Enquiry & quotation form','Use the full form below to tell us the product, thickness, quantity and delivery details so we can prepare an accurate quotation.',8,true),
('#contact','Let us discuss your project','Contact Royal Roots Trading & Co. for product information, availability and project enquiries.',9,true)
on conflict do nothing;

-- Editable gallery tiles and advantages cards.
create table if not exists public.site_cards (
 id uuid primary key default gen_random_uuid(),
 group_key text not null check (group_key in ('gallery','features')),
 title text not null default '' check (char_length(title) <= 180),
 body text not null default '' check (char_length(body) <= 2000),
 icon text not null default '', image_url text not null default '',
 sort_order integer not null default 0, visible boolean not null default true,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.site_cards enable row level security;
grant select on public.site_cards to anon, authenticated;
grant insert, update, delete on public.site_cards to authenticated;
drop policy if exists "Public can read site cards" on public.site_cards;
create policy "Public can read site cards" on public.site_cards for select to anon, authenticated using (true);
drop policy if exists "Admins manage site cards" on public.site_cards;
create policy "Admins manage site cards" on public.site_cards for all to authenticated using (private.is_product_admin()) with check (private.is_product_admin());
insert into public.site_cards(group_key,title,body,icon,sort_order,visible) values
('gallery','Rapicon wall partitions','Clean, flat panels laid side by side for quick space division.','▥',0,true),
('gallery','Cement wood planks','Wood-look cement planks for cladding and feature walls.','▤',1,true),
('gallery','2×2 grid ceiling','Modular tiles in a grid for tidy, serviceable ceilings.','⊞',2,true),
('gallery','Ceiling designer boards','Patterned boards for ceilings with a distinctive finish.','▦',3,true),
('gallery','Heavy duty boards','Thick, robust boards for demanding construction work.','▤',4,true),
('gallery','Mezzanine flooring','Board flooring that adds a usable level to your space.','▥',5,true),
('features','Stronger Walls','Explore dependable walling and panel solutions for suitable construction needs.','▦',0,true),
('features','Fire Resistant Options','Ask about products with tested fire-performance properties for your application.','♨',1,true),
('features','Sound Insulation','Discover material options designed to help improve acoustic comfort.','≋',2,true),
('features','Thermal Insulation','Explore solutions that can support thermal comfort and building efficiency.','♧',3,true),
('features','Eco Friendly Choices','Consider modern materials and responsible building approaches.','♻',4,true),
('features','Engineered Solutions','Get help selecting suitable products for specific project requirements.','⚙',5,true),
('features','Design Flexibility','Bring your ideas to life with versatile boards, panels and finishes.','◈',6,true),
('features','Customer Support','Speak with our team about products, availability and quotations.','✓',7,true)
on conflict do nothing;
