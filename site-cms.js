import{createClient}from"https://esm.sh/@supabase/supabase-js@2";
const url=window.SUPABASE_URL,key=window.SUPABASE_ANON_KEY;
if(url&&key){try{
const sb=createClient(url,key);
const [{data:s},{data:sections}]=await Promise.all([sb.from("site_settings").select("*").eq("id","main").maybeSingle(),sb.from("site_sections").select("*").eq("visible",true).order("sort_order").order("created_at")]);
if(s){
document.documentElement.style.setProperty("--rr-primary",s.primary_color||"#071b62");document.documentElement.style.setProperty("--rr-accent",s.accent_color||"#d4a127");
if(s.site_title)document.title=s.site_title;
if(s.meta_description){let m=document.querySelector('meta[name="description"]');if(!m){m=document.createElement("meta");m.name="description";document.head.append(m)}m.content=s.meta_description}
document.querySelectorAll("header .brand,.navbar-brand,.logo").forEach(el=>{if(s.logo_url){const im=document.createElement("img");im.src=s.logo_url;im.alt=s.site_title||"Logo";im.style.cssText="max-height:64px;max-width:220px;object-fit:contain";el.replaceChildren(im)}});
if(s.about_text)add({title:"About us",body:s.about_text},true);
const details=[["Email",s.contact_email],["Phone",s.contact_phone],["WhatsApp",s.whatsapp],["Address",s.address]].filter(x=>x[1]);
if(details.length){const c=document.createElement("section");c.className="rr-cms-contact";const h=document.createElement("h2");h.textContent="Contact us";c.append(h);details.forEach(([label,value])=>{const p=document.createElement("p");p.textContent=label+": "+value;c.append(p)});place(c)}
}
(sections||[]).forEach(x=>add(x,false));
function add(x,about){const sec=document.createElement("section");sec.className="rr-cms-section"+(about?" rr-cms-about":"");if(x.image_url){const im=document.createElement("img");im.src=x.image_url;im.alt=x.title||"";im.loading="lazy";sec.append(im)}const box=document.createElement("div"),h=document.createElement("h2");h.textContent=x.title||"";box.append(h);if(x.body){const p=document.createElement("p");p.textContent=x.body;box.append(p)}if(x.button_text&&x.button_url){const a=document.createElement("a");a.textContent=x.button_text;a.href=x.button_url;if(/^https?:\/\//i.test(x.button_url)){a.target="_blank";a.rel="noopener noreferrer"}box.append(a)}sec.append(box);place(sec)}
function place(el){let root=document.querySelector("#rr-cms-content");if(!root){root=document.createElement("div");root.id="rr-cms-content";const products=document.querySelector("#products"),footer=document.querySelector("footer");if(products?.parentElement)products.parentElement.insertBefore(root,products.nextSibling);else if(footer)footer.before(root);else document.body.append(root)}root.append(el)}
const css=document.createElement("style");css.textContent='.rr-cms-section,.rr-cms-contact{display:flex;gap:28px;align-items:center;max-width:1160px;margin:28px auto;padding:clamp(22px,4vw,48px);border-radius:14px;background:#f7f8fb;color:#17223b;box-sizing:border-box}.rr-cms-section img{width:min(38%,380px);max-height:320px;object-fit:cover;border-radius:10px}.rr-cms-section h2,.rr-cms-contact h2{color:var(--rr-primary,#071b62);margin:0 0 12px}.rr-cms-section p,.rr-cms-contact p{white-space:pre-line;line-height:1.7}.rr-cms-section a{display:inline-block;background:var(--rr-primary,#071b62);color:white;padding:10px 16px;border-radius:6px;text-decoration:none;margin-top:8px}.rr-cms-about{border-left:5px solid var(--rr-accent,#d4a127)}.rr-cms-contact{display:block}.rr-cms-contact p{margin:6px 0}@media(max-width:700px){.rr-cms-section{display:block;margin:20px 12px}.rr-cms-section img{width:100%;max-height:260px;margin-bottom:16px}.rr-cms-contact{margin:20px 12px}}';document.head.append(css);
}catch(e){console.warn("Website editor content could not be loaded",e)}}
