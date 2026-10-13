# Royal Roots Trading & Co. — Supabase admin setup

This branch preserves the existing large HTML site as `legacy-site.html`. The small `index.html` loader serves that same page and injects the catalogue script. After merging, configure Supabase before the database catalogue is activated.

## 1. Configure Supabase
Create a project at https://supabase.com/. Copy the Project URL and publishable key (or legacy anon key) from Project Settings / API. Edit `supabase-config.js`:
- `SUPABASE_URL`: your project URL
- `SUPABASE_ANON_KEY`: the browser-safe publishable/anon key

Never put a `service_role` or secret key in frontend files.

## 2. Create one administrator
In Supabase Authentication → Users, create the admin account. Copy that user's UUID. Run `supabase/schema.sql` in SQL Editor, then run:
```sql
insert into public.product_admins(user_id) values ('REPLACE-WITH-ADMIN-AUTH-USER-UUID');
```
Replace the placeholder with the real Auth user UUID. Do not create any self-service policy for this table. Disable public sign-ups after creating the admin.

## 3. Deploy
Merge this pull request into `main`. GitHub Pages should then serve:
- Public site: https://royalrootstrading-hub.github.io/royal-roots-trading-co/
- Admin: https://royalrootstrading-hub.github.io/royal-roots-trading-co/admin.html

The public site continues to show the existing static catalogue until the project URL/key are configured and published products exist in Supabase. Admin access is enforced by Supabase Auth and RLS, not by hiding the page.

## 4. Test
Sign in to admin.html with the authorized account. Add a draft with several images; it should not show publicly until published. Test editing, unpublishing and deleting. Unauthorized users must not be able to write products or upload images.

Image uploads accept JPEG/PNG/WebP/GIF up to 8 MB each. The image bucket is publicly readable for the public catalogue; uploads and modifications are restricted to the admin's UUID folder. Deleting a product row does not automatically delete stored image files.

## 5. Full website editor

Open https://royalrootstrading-hub.github.io/royal-roots-trading-co/website-admin.html and sign in with the same authorized administrator account.

The editor supports:
- Brand name, tagline, logo, colours, contact details, About text and search description
- Editing, hiding/showing and reordering the main homepage sections
- Adding, editing, hiding/showing, reordering and deleting custom content sections with optional images and buttons
- Product catalogue management through `admin.html`

The website editor schema is documented in `supabase/website-cms.sql`; the live project has already had this migration applied. Major page sections are editable, while some nested prebuilt gallery/advantage tiles and embedded third-party forms/videos remain part of the static page.
