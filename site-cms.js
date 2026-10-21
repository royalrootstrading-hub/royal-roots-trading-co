import{createClient}from"https://esm.sh/@supabase/supabase-js@2";
const url=window.SUPABASE_URL,key=window.SUPABASE_ANON_KEY;
if(url&&key){try{
const sb=createClient(url,key);
const [{data:s},{data:rows},{data:cards}]=await Promise.all([sb.from("site_settings").select("*").eq("id","main").maybeSingle(),sb.from("site_sections").select("*").order("sort_order").order("created_at"),sb.from("site_cards").select("*").order("group_key").order("sort_order")]);
if(s){
document.documentElement.style.setProperty("--rr-primary",s.primary_color||"#071b62");document.documentElement.style.setProperty("--rr-accent",s.accent_color||"#d4a127");document.documentElement.style.setProperty("--navy",s.primary_color||"#071b62");document.documentElement.style.setProperty("--blue",s.primary_color||"#12358e");document.documentElement.style.setProperty("--gold",s.accent_color||"#d4a127");
if(s.site_title)document.title=s.site_title;
if(s.meta_description){let m=document.querySelector('meta[name="description"]');if(!m){m=document.createElement("meta");m.name="description";document.head.append(m)}m.content=s.meta_description}
document.querySelectorAll("header .brand,.navbar-brand,.logo").forEach(el=>{const small=el.querySelector("small");if(el.classList.contains("logo")&&s.site_title){el.textContent=s.site_title;const sub=document.createElement("small");sub.textContent=s.tagline||"TRADING & CO.";el.append(sub)}else if(s.logo_url&&el.classList.contains("brand")){const im=document.createElement("img");im.src=s.logo_url;im.alt=s.site_title||"Logo";im.style.cssText="max-height:64px;max-width:220px;object-fit:contain";el.replaceChildren(im)}else if(s.site_title&&el.textContent.trim().toLowerCase().includes("royal roots")){el.textContent=s.site_title;if(small){small.textContent=s.tagline||"TRADING & CO.";el.append(small)}}});
}
ensureGallerySection(cards||[]);
const builtins=(rows||[]).filter(x=>x.target_id);
for(const x of builtins)applyBuiltin(x);
if(s?.about_text){const p=document.querySelector("#about .about p, #about .wrap > div:first-child p");if(p)p.textContent=s.about_text}
arrange(builtins);
(rows||[]).filter(x=>!x.target_id&&x.visible).forEach(x=>addCustom(x));renderCards(cards||[]);
if(s){applyGlobalSettings(s);updateContact(s)}
await renderPublishedProducts(sb);
syncSocialLinks(s);
function enableSupplyCarousel(){
 const candidates=new Set([...document.querySelectorAll(".gallery-grid,#gallery .rr-cms-gallery-grid,.rr-cms-gallery-grid")]);
 for(const heading of document.querySelectorAll("h1,h2,h3")){if((heading.textContent||"").trim().toLowerCase().includes("see what we supply")){const section=heading.closest("section")||heading.parentElement?.parentElement;if(section)for(const grid of section.querySelectorAll(".gallery-grid,.rr-cms-gallery-grid,.grid,[class*='gallery']"))candidates.add(grid)}}
 for(const grid of candidates){if(grid.dataset.horizontalCarousel==="true"||!grid.children.length)continue;grid.dataset.horizontalCarousel="true";grid.classList.add("rr-supply-horizontal-scroll");const controls=document.createElement("div");controls.className="rr-supply-carousel-controls";controls.setAttribute("aria-label","Scroll supplied products left or right");for(const [direction,label,symbol] of [[-1,"Scroll supplied products left","‹"],[1,"Scroll supplied products right","›"]]){const button=document.createElement("button");button.type="button";button.className="rr-supply-scroll-btn";button.setAttribute("aria-label",label);button.textContent=symbol;button.addEventListener("click",()=>grid.scrollBy({left:direction*Math.max(250,grid.clientWidth*.8),behavior:"smooth"}));controls.append(button)}grid.parentElement.insertBefore(controls,grid)}
}
const supplyStyle=document.createElement("style");supplyStyle.textContent=".rr-supply-carousel-controls{display:flex;justify-content:flex-end;gap:10px;margin:0 0 12px}.rr-supply-scroll-btn{width:42px;height:42px;border:0;border-radius:50%;background:#e9edf5;color:#071b62;font-size:30px;line-height:1;cursor:pointer}.rr-supply-scroll-btn:focus-visible{outline:3px solid #d4a127;outline-offset:2px}.rr-supply-horizontal-scroll{display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;gap:18px;overflow-x:auto!important;overflow-y:hidden!important;scroll-snap-type:x mandatory;scroll-behavior:smooth;padding:8px 2px 18px;overscroll-behavior-inline:contain;-webkit-overflow-scrolling:touch;scrollbar-width:thin;max-width:100%}.rr-supply-horizontal-scroll>*{display:block;flex:0 0 clamp(230px,22vw,280px)!important;width:clamp(230px,22vw,280px);min-width:0;scroll-snap-align:start}.rr-supply-horizontal-scroll::-webkit-scrollbar{height:8px}.rr-supply-horizontal-scroll::-webkit-scrollbar-thumb{background:#c4cbd8;border-radius:99px}.rr-supply-horizontal-scroll img{max-width:100%}@media(max-width:600px){.rr-supply-horizontal-scroll>*{flex-basis:78vw!important;width:78vw}.rr-supply-carousel-controls{margin-bottom:8px}}";document.head.append(supplyStyle);enableSupplyCarousel();

function syncSocialLinks(settings){
 const groups=[...document.querySelectorAll(".social")],visible=settings?.social_links_visible!==false;
 for(const group of groups){group.hidden=!visible;if(!visible)continue;for(const link of group.querySelectorAll("a")){const label=(link.textContent||link.getAttribute("aria-label")||"").toLowerCase();const url=label.includes("youtube")?settings?.social_youtube_url:label.includes("instagram")?settings?.social_instagram_url:label.includes("facebook")?settings?.social_facebook_url:null;if(url&&/^https?:\/\//i.test(url))link.href=url}}
 if(visible&&!groups.length)addSocialFooter();
}
function addSocialFooter(){
 const existing=document.querySelector("#rr-social-footer");if(existing)existing.remove();if(s?.social_links_visible===false)return;
 const footer=document.querySelector("footer")||document.body,section=document.createElement("section");section.id="rr-social-footer";section.setAttribute("aria-label","Follow Royal Roots on social media");
 const title=document.createElement("h2");title.textContent="Follow Royal Roots";section.append(title);
 const links=[{label:"YouTube",url:s?.social_youtube_url||"https://youtube.com/@royalrootstradingco",icon:"▶"},{label:"Instagram",url:s?.social_instagram_url||"https://www.instagram.com/royalroots_trading/",icon:"◎"},{label:"Facebook",url:s?.social_facebook_url||"https://www.facebook.com/profile.php?id=61595561580640",icon:"f"}].filter(item=>/^https?:\/\//i.test(item.url));
 const nav=document.createElement("nav");nav.setAttribute("aria-label","Social media links");
 for(const item of links){const link=document.createElement("a");link.href=item.url;link.target="_blank";link.rel="noopener noreferrer";link.className="rr-social-link rr-social-"+item.label.toLowerCase();link.title="Royal Roots on "+item.label;link.setAttribute("aria-label","Open Royal Roots on "+item.label);const icon=document.createElement("span");icon.className="rr-social-icon";icon.setAttribute("aria-hidden","true");icon.textContent=item.icon;const label=document.createElement("span");label.className="rr-social-label";label.textContent=item.label;link.append(icon,label);nav.append(link)}
 section.append(nav);footer.append(section);
 const style=document.createElement("style");style.id="rr-social-footer-style";style.textContent="#rr-social-footer{clear:both;display:block;width:100%;box-sizing:border-box;margin:0;padding:18px 12px calc(18px + env(safe-area-inset-bottom,0px));background:#071b62;color:#fff;text-align:center}#rr-social-footer h2{font-size:clamp(1rem,3vw,1.3rem);line-height:1.3;margin:0 0 10px;color:inherit}#rr-social-footer nav{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:8px}#rr-social-footer a.rr-social-link{display:inline-flex;align-items:center;justify-content:center;width:42px;height:42px;min-width:42px;min-height:42px;box-sizing:border-box;padding:0;border:0;border-radius:50%;color:#fff;text-decoration:none;font-weight:700;line-height:1;overflow:hidden;transition:transform .15s ease}#rr-social-footer a.rr-social-facebook{background:#1877f2}#rr-social-footer a.rr-social-instagram{background:linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)}#rr-social-footer a.rr-social-youtube{background:#ff0033}#rr-social-footer a:focus-visible{outline:3px solid #d4a127;outline-offset:3px}#rr-social-footer a:hover{transform:scale(1.07)}#rr-social-footer .rr-social-icon{display:inline-grid;place-items:center;width:22px;height:22px;font-size:21px;font-weight:800;flex:0 0 22px;color:#fff}#rr-social-footer .rr-social-label{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}@media(max-width:480px){#rr-social-footer{padding:12px 8px calc(12px + env(safe-area-inset-bottom,0px))}#rr-social-footer nav{gap:7px}#rr-social-footer a.rr-social-link{width:40px;height:40px;min-width:40px;min-height:40px}}";document.head.append(style);
}
async function renderPublishedProducts(client){
 try{
  const {data:products,error}=await client.from("products").select("id,name,category,description,image_urls").eq("published",true).order("created_at",{ascending:false});
  if(error)throw error;
  const section=document.querySelector("#products");if(!section)return;
  let root=document.querySelector("#rr-live-products");
  if(!root){root=document.createElement("div");root.id="rr-live-products";root.setAttribute("aria-label","Published products");section.append(root)}
  root.replaceChildren();
  if(!products?.length){root.hidden=true;return}root.hidden=false;
  const heading=document.createElement("h2");heading.textContent="Our Products";root.append(heading);
  const grid=document.createElement("div");grid.className="rr-live-products-grid";
  for(const p of products){const card=document.createElement("article");card.className="rr-live-product-card";
   if(p.image_urls?.[0]){const im=document.createElement("img");im.src=p.image_urls[0];im.alt=p.name||"Product";im.loading="lazy";card.append(im)}
   const body=document.createElement("div");body.className="rr-live-product-body";
   const h=document.createElement("h3");h.textContent=p.name||"Product";body.append(h);
   if(p.category){const category=document.createElement("p");category.className="rr-live-product-category";category.textContent=p.category;body.append(category)}
   if(p.description){const desc=document.createElement("p");desc.textContent=p.description;body.append(desc)}
   card.append(body);grid.append(card)
  }
  root.append(grid);
  const controls=document.createElement("div");controls.className="product-carousel-controls";controls.setAttribute("aria-label","Product scrolling controls");for(const [direction,label,symbol] of [[-1,"Scroll products left","‹"],[1,"Scroll products right","›"]]){const b=document.createElement("button");b.type="button";b.className="product-scroll-btn";b.setAttribute("aria-label",label);b.textContent=symbol;b.addEventListener("click",()=>grid.scrollBy({left:direction*Math.max(240,grid.clientWidth*.8),behavior:"smooth"}));controls.append(b)}root.insertBefore(controls,grid);
  if(!document.querySelector("#rr-live-products-style")){const style=document.createElement("style");style.id="rr-live-products-style";style.textContent="#rr-live-products{width:100%;padding:24px 0}#rr-live-products>h2{text-align:center;margin:12px 0 24px;color:var(--rr-primary,#071b62)}.rr-live-products-grid{display:flex;gap:18px;width:100%;margin:0 auto;padding:8px 16px 18px;box-sizing:border-box;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;scroll-behavior:smooth;overscroll-behavior-inline:contain;-webkit-overflow-scrolling:touch;scrollbar-width:thin}.rr-live-products-grid>.rr-live-product-card{flex:0 0 clamp(230px,28vw,300px);min-width:0;scroll-snap-align:start}.rr-live-products-grid::-webkit-scrollbar{height:8px}.rr-live-products-grid::-webkit-scrollbar-thumb{background:#c4cbd8;border-radius:99px}@media(max-width:600px){.rr-live-products-grid>.rr-live-product-card{flex-basis:78vw}}.rr-live-product-card{overflow:hidden;border:1px solid #e2e7f0;border-radius:12px;background:#fff;box-shadow:0 4px 16px rgba(7,27,98,.08)}.rr-live-product-card>img{display:block;width:100%;height:200px;object-fit:cover;background:#f4f6fa}.rr-live-product-body{padding:16px}.rr-live-product-body h3{margin:0 0 8px;color:var(--rr-primary,#071b62)}.rr-live-product-body p{line-height:1.6;white-space:pre-line}.rr-live-product-category{font-size:.9em;font-weight:600;color:var(--rr-accent,#d4a127)}";document.head.append(style)}
 }catch(error){console.warn("Published products could not be loaded",error)}
}
function ensureGallerySection(allCards){
 if(document.querySelector("#gallery"))return;
 if(!(allCards||[]).some(x=>x.group_key==="gallery"))return;
 const products=document.querySelector("#products");if(!products)return;
 const section=document.createElement("section");section.id="gallery";section.className="rr-cms-gallery";
 const wrap=document.createElement("div");wrap.className="wrap";const head=document.createElement("div");head.className="head";
 const h=document.createElement("h2");h.textContent="Gallery & feature cards";const p=document.createElement("p");p.textContent="Explore our products and solutions.";
 head.append(h,p);wrap.append(head);const grid=document.createElement("div");grid.className="rr-cms-gallery-grid";wrap.append(grid);section.append(wrap);
 products.parentElement.insertBefore(section,products.nextSibling);
}
function renderCards(allCards){
 const galleryCards=allCards.filter(x=>x.group_key==="gallery"&&x.visible),featureCards=allCards.filter(x=>x.group_key==="features"&&x.visible),hasGallery=allCards.some(x=>x.group_key==="gallery"),hasFeatures=allCards.some(x=>x.group_key==="features");
 let gallery=document.querySelector(".gallery-grid");
 if(!gallery&&hasGallery){ensureGallerySection(allCards);gallery=document.querySelector("#gallery .rr-cms-gallery-grid")}
 if(gallery&&hasGallery){gallery.replaceChildren();for(const card of galleryCards){const item=document.createElement("article");item.className="rr-cms-card";
  if(card.image_url){const im=document.createElement("img");im.src=card.image_url;im.alt=card.title||"";im.loading="lazy";item.append(im)}else{const visual=document.createElement("div");visual.className="rr-cms-card-icon";visual.textContent=card.icon||"▦";visual.setAttribute("aria-hidden","true");item.append(visual)}
  const body=document.createElement("div");body.className="rr-cms-card-body";const h=document.createElement("h3");h.textContent=card.title||"";body.append(h);if(card.body){const p=document.createElement("p");p.textContent=card.body;body.append(p)}item.append(body);gallery.append(item)}enableSupplyCarousel()}
 let features=document.querySelector(".feature-grid")||document.querySelector(".adv");
 if(features&&hasFeatures){features.replaceChildren();for(const card of featureCards){const item=document.createElement("div");item.className="rr-cms-feature";if(card.image_url){const im=document.createElement("img");im.src=card.image_url;im.alt=card.title||"";im.loading="lazy";im.style.cssText="width:56px;height:56px;object-fit:contain;margin-bottom:8px";item.append(im)}else if(card.icon){const icon=document.createElement("div");icon.className="rr-cms-feature-icon";icon.textContent=card.icon;icon.setAttribute("aria-hidden","true");item.append(icon)}const h=document.createElement("h3");h.textContent=card.title||"";item.append(h);if(card.body){const p=document.createElement("p");p.textContent=card.body;item.append(p)}features.append(item)}}
 if(!document.querySelector("#rr-cms-cards-style")){const style=document.createElement("style");style.id="rr-cms-cards-style";style.textContent=".rr-cms-gallery-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:18px}.rr-cms-card{background:#fff;border:1px solid var(--line,#d9d6ca);border-radius:6px;overflow:hidden;min-width:0}.rr-cms-card>img,.rr-cms-card-icon{width:100%;height:150px;object-fit:cover;display:grid;place-items:center;background:#eef2fb;color:var(--gold,#c9a227);font-size:44px}.rr-cms-card-body{padding:16px}.rr-cms-card h3,.rr-cms-feature h3{margin:0 0 8px}.rr-cms-card p,.rr-cms-feature p{margin:0;color:var(--muted,#4b5568)}.rr-cms-feature{padding:22px 22px 22px 0;border-bottom:1px solid #2a3a63}.rr-cms-feature-icon{font-size:28px;color:var(--gold,#c9a227);margin-bottom:8px}.rr-cms-feature h3{font-size:18px;color:var(--gold,#c9a227)}.rr-cms-feature p{color:#c4cde2;font-size:15.5px}@media(max-width:640px){.rr-cms-gallery-grid{grid-template-columns:repeat(auto-fit,minmax(min(100%,160px),1fr));gap:12px}}";document.head.append(style)}
}
function applyGlobalSettings(s){
 const top=document.querySelector(".top .container span:first-child");
 if(top&&(s.announcement_text||s.tagline))top.textContent=s.announcement_text||s.tagline;
 const hero=document.querySelector("#home .hero")||document.querySelector(".hero")||document.querySelector("#home");
 if(hero){
  const h=hero.querySelector("h1")||document.querySelector("#home h1");
  if(s.hero_title&&h)h.textContent=s.hero_title;
  const p=hero.querySelector("p")||document.querySelector("#home p");
  if(s.hero_body&&p)p.textContent=s.hero_body;
  const a=hero.querySelector(".actions a")||hero.querySelector("a.btn")||hero.querySelector("a");
  if(a){if(s.hero_button_text)a.textContent=s.hero_button_text;if(s.hero_button_url)a.href=s.hero_button_url}
  if(s.hero_image_url){let image=hero.querySelector("img");if(image){image.src=s.hero_image_url;image.alt=s.hero_title||s.site_title||"Royal Roots"}else{hero.style.backgroundImage="linear-gradient(90deg,rgba(5,15,48,.68),rgba(5,15,48,.12)),url("+JSON.stringify(s.hero_image_url)+")";hero.style.backgroundSize="cover";hero.style.backgroundPosition="center"}}
 }
 const navMap=[["#products",s.nav_products_label],["#about",s.nav_about_label],["#video",s.nav_gallery_label],["#contact",s.nav_contact_label]];
 for(const [href,label] of navMap){if(!label)continue;document.querySelectorAll('header a[href="'+href+'"],nav a[href="'+href+'"]').forEach(a=>{a.textContent=label})}
 if(s.footer_text){let footer=document.querySelector("footer");if(footer){let p=footer.querySelector("#rr-footer-text");if(!p){p=document.createElement("p");p.id="rr-footer-text";footer.append(p)}p.textContent=s.footer_text}}
}

function updateContact(s){
 const contact=document.querySelector("#contact"),phone=(s.contact_phone||"").trim(),digits=phone.replace(/\D/g,""),email=(s.contact_email||"").trim(),address=(s.address||"").trim();
 if(contact&&phone){const telLinks=[...contact.querySelectorAll('a[href^="tel:"]')];if(telLinks.length===1){telLinks[0].href="tel:"+digits;telLinks[0].textContent=phone}}
 if(contact&&email)contact.querySelectorAll('a[href^="mailto:"]').forEach(a=>{a.href="mailto:"+email;a.textContent=email});
 if(contact&&address){const p=[...contact.querySelectorAll("p")].find(x=>/Padam Nagar|Karimnagar|Telangana/i.test(x.textContent));if(p)p.textContent=address}
 const mapFrame=document.querySelector(".location-map-frame iframe");if(mapFrame&&address){mapFrame.src="https://www.google.com/maps?q="+encodeURIComponent(address)+"&output=embed";mapFrame.title="Royal Roots Trading & Co. location: "+address}
 const mapLabel=document.querySelector(".location-map>p");if(mapLabel&&address)mapLabel.textContent=address;
 const raw=(s.whatsapp||phone).trim();let waUrl="";
 if(/^https?:\/\//i.test(raw)){try{const u=new URL(raw);if(u.protocol==="https:"&&/^(wa\.me|api\.whatsapp\.com|www\.whatsapp\.com)$/i.test(u.hostname))waUrl=u.href}catch{}}
 else{const d=raw.replace(/\D/g,"");if(d.length>=8)waUrl="https://wa.me/"+d}
 const fab=document.querySelector("#wafab");if(fab&&waUrl)fab.href=waUrl;
 const button=document.querySelector("#wa");if(button&&waUrl)button.onclick=()=>{const form=document.querySelector("#f"),d=form?Object.fromEntries(new FormData(form).entries()):{};const message="Hello Royal Roots, I need a quotation.\nName: "+(d.name||"")+"\nPhone: "+(d.phone||"")+"\nLocation: "+(d.location||"")+"\nProduct: "+(d.product||"Not sure yet")+"\nQuantity/area: "+(d.quantity||"-")+"\nRequirement: "+(d.requirement||"-");window.open(waUrl+(waUrl.includes("?")?"&":"?")+"text="+encodeURIComponent(message),"_blank","noopener")}
}
function applyBuiltin(x){let el;try{el=document.querySelector(x.target_id);if(!el){const aliases={"#home":".hero","#advantages":"#why",".stats":"#about .facts"};if(aliases[x.target_id])el=document.querySelector(aliases[x.target_id])}}catch{return}if(!el)return;el.hidden=!x.visible;if(!x.visible)return;
const heading=el.querySelector(".section-head h2")||el.querySelector(".about-copy h2")||el.querySelector("h1,h2,h3");if(x.title&&heading)heading.textContent=x.title;
const p=el.querySelector(".section-head p")||el.querySelector(".hero p")||el.querySelector(".about-copy p")||el.querySelector(".container > div p")||el.querySelector("p");if(x.body&&p)p.textContent=x.body;
if(x.image_url){let im=el.querySelector("img");if(!im){im=document.createElement("img");im.style.cssText="display:block;max-width:min(100%,480px);max-height:320px;object-fit:contain;margin:18px auto";const anchor=el.querySelector(".section-head")||el.firstElementChild;el.insertBefore(im,anchor||el.firstChild)}im.src=x.image_url;im.alt=x.title||""}
if(x.button_text){const a=el.querySelector(".actions a")||el.querySelector(".cta a")||el.querySelector(".about-copy a")||el.querySelector("a.btn");if(a){a.textContent=x.button_text;if(x.button_url)a.href=x.button_url}}
}
function arrange(items){const els=items.map(x=>{try{return document.querySelector(x.target_id)}catch{return null}}).filter(Boolean);if(els.length<2)return;const parent=els[0].parentElement;if(!parent||els.some(el=>el.parentElement!==parent))return;const marker=document.createComment("website section order");parent.insertBefore(marker,els[0]);const frag=document.createDocumentFragment();els.forEach(el=>frag.append(el));marker.replaceWith(frag)}
function addCustom(x){const sec=document.createElement("section");sec.className="rr-cms-section";if(x.image_url){const im=document.createElement("img");im.src=x.image_url;im.alt=x.title||"";im.loading="lazy";sec.append(im)}const box=document.createElement("div"),h=document.createElement("h2");h.textContent=x.title||"";box.append(h);if(x.body){const p=document.createElement("p");p.textContent=x.body;box.append(p)}if(x.button_text&&x.button_url){const a=document.createElement("a");a.textContent=x.button_text;a.href=x.button_url;if(/^https?:\/\//i.test(x.button_url)){a.target="_blank";a.rel="noopener noreferrer"}box.append(a)}sec.append(box);placeCustom(sec)}
function placeCustom(el){let root=document.querySelector("#rr-cms-content");if(!root){root=document.createElement("div");root.id="rr-cms-content";const products=document.querySelector("#products"),footer=document.querySelector("footer");if(products?.parentElement)products.parentElement.insertBefore(root,products.nextSibling);else if(footer)footer.before(root);else document.body.append(root)}root.append(el)}
const css=document.createElement("style");css.textContent='.rr-cms-section,.rr-cms-contact{display:flex;gap:28px;align-items:center;max-width:1160px;margin:28px auto;padding:clamp(22px,4vw,48px);border-radius:14px;background:#f7f8fb;color:#17223b;box-sizing:border-box}.rr-cms-section img{width:min(38%,380px);max-height:320px;object-fit:cover;border-radius:10px}.rr-cms-section h2,.rr-cms-contact h2{color:var(--rr-primary,#071b62);margin:0 0 12px}.rr-cms-section p,.rr-cms-contact p{white-space:pre-line;line-height:1.7}.rr-cms-section a{display:inline-block;background:var(--rr-primary,#071b62);color:white;padding:10px 16px;border-radius:6px;text-decoration:none;margin-top:8px}.rr-cms-contact{display:block}.rr-cms-contact p{margin:6px 0}@media(max-width:700px){.rr-cms-section{display:block;margin:20px 12px}.rr-cms-section img{width:100%;max-height:260px;margin-bottom:16px}.rr-cms-contact{margin:20px 12px}}';document.head.append(css);
}catch(e){console.warn("Website CMS content could not be loaded",e)}}
