/* Applies Royal Roots website-editor (Supabase) content to the new /website/ page.
   Only values that differ from the editor's built-in defaults are applied, so the
   page keeps its own design/text until something is actually edited. */
const SEED_SECTIONS={
"#home":["Building a stronger future, together.","Quality building materials and modern construction solutions for homes, commercial spaces and industrial projects. Build with confidence. Build with Royal Roots."],
"#products":["Complete building solutions","Explore our range of walling, board, ceiling, flooring and structural solutions for modern construction requirements."],
"#video":["See it in action","Watch our video to learn more about boards and panels from Royal Roots Trading & Co."],
"#about":["Your trusted building material partner","Royal Roots Trading & Co. is a building material company focused on supplying quality products and practical solutions for construction, renovation, interiors and commercial projects."],
"#advantages":["Advantages that build confidence","Solutions selected with your construction goals, performance requirements and project needs in mind."],
"#enquiry":["Enquiry & quotation form","Use the full form below to tell us the product, thickness, quantity and delivery details so we can prepare an accurate quotation."]};
const SEED_ORDER=["#home",".stats","#products","#gallery","#video","#about","#advantages",".cta","#enquiry","#contact"];
const SEED_FEATURES=[["Stronger Walls","Explore dependable walling and panel solutions for suitable construction needs."],["Fire Resistant Options","Ask about products with tested fire-performance properties for your application."],["Sound Insulation","Discover material options designed to help improve acoustic comfort."],["Thermal Insulation","Explore solutions that can support thermal comfort and building efficiency."],["Eco Friendly Choices","Consider modern materials and responsible building approaches."],["Engineered Solutions","Get help selecting suitable products for specific project requirements."],["Design Flexibility","Bring your ideas to life with versatile boards, panels and finishes."],["Customer Support","Speak with our team about products, availability and quotations."]];
const TARGET={"#home":".hero",".stats":".stats","#products":"#products","#video":"#video","#about":"#about","#advantages":"#why","#enquiry":"#enquiry"};
const OLD={phone:"+91 86884 75976",email:"Royalrootstrading@gmail.com"};
const isHttp=u=>typeof u==="string"&&/^https?:\/\//i.test(u.trim());
const isLink=u=>typeof u==="string"&&/^(https?:\/\/|mailto:|tel:|#|\/|\.\.?\/)/i.test(u.trim());
const isHex=c=>typeof c==="string"&&/^#[0-9a-f]{6}$/i.test(c.trim());
const txt=v=>typeof v==="string"&&v.trim()!==""?v.trim():"";
function shade(c,f){const n=parseInt(c.slice(1),16);let r=n>>16,g=(n>>8)&255,b=n&255;const t=f<0?0:255,p=Math.abs(f);r=Math.round((t-r)*p+r);g=Math.round((t-g)*p+g);b=Math.round((t-b)*p+b);return"#"+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1)}
export function embedUrl(u){try{const x=new URL(u);if(x.hostname==="youtu.be")return"https://www.youtube-nocookie.com/embed/"+encodeURIComponent(x.pathname.slice(1));if(["youtube.com","www.youtube.com","m.youtube.com"].includes(x.hostname)){const v=x.searchParams.get("v");if(v)return"https://www.youtube-nocookie.com/embed/"+encodeURIComponent(v);const m=x.pathname.match(/^\/(?:embed|shorts)\/([\w-]+)/);if(m)return"https://www.youtube-nocookie.com/embed/"+m[1]}if(x.hostname==="vimeo.com"&&/^\d+$/.test(x.pathname.slice(1)))return"https://player.vimeo.com/video/"+x.pathname.slice(1)}catch{}return""}
export function applyCms(d,data){
 const q=(s,r=d)=>{try{return r.querySelector(s)}catch{return null}};
 const qa=(s,r=d)=>{try{return[...r.querySelectorAll(s)]}catch{return[]}};
 const set=(el,t)=>{t=txt(t);if(el&&t)el.textContent=t};
 const s=data.settings||{},rows=data.sections||[],cards=data.cards||[];
 const root=d.documentElement;
 if(!q("#rr-cms-style")){const st=d.createElement("style");st.id="rr-cms-style";st.textContent="[hidden]{display:none!important}.rr-cms-section{display:flex;gap:28px;align-items:center;max-width:1140px;margin:0 auto;padding:clamp(22px,4vw,48px) 20px;box-sizing:border-box}.rr-cms-section img{width:min(38%,380px);max-height:320px;object-fit:cover;border-radius:10px}.rr-cms-section h2{margin:0 0 12px}.rr-cms-section p{white-space:pre-line;margin:0 0 12px}.rr-cms-section a{display:inline-block;background:var(--blue);color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:700}.rr-video-extra{grid-column:1/-1;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:18px}.rr-video-extra iframe,.rr-video-extra video{width:100%;aspect-ratio:16/9;border:0;border-radius:10px;background:#111}.logo b{text-transform:uppercase}@media(max-width:700px){.rr-cms-section{display:block}.rr-cms-section img{width:100%;margin-bottom:16px}}";d.head.append(st)}
 /* colours */
 if(isHex(s.primary_color)&&s.primary_color.toLowerCase()!=="#071b62"){const c=s.primary_color;root.style.setProperty("--blue",c);root.style.setProperty("--deep",shade(c,-.55));root.style.setProperty("--blue2",shade(c,.2))}
 if(isHex(s.accent_color)&&s.accent_color.toLowerCase()!=="#d4a127"){const c=s.accent_color;root.style.setProperty("--gold",c);root.style.setProperty("--gold2",shade(c,.25))}
 /* brand */
 const title=txt(s.site_title);
 if(title&&title!=="Royal Roots Trading & Co."){d.title=title;set(q(".logo b"),title);set(q("footer strong"),title)}
 if(txt(s.meta_description)){let m=q('meta[name="description"]');if(!m){m=d.createElement("meta");m.name="description";d.head.append(m)}m.content=s.meta_description.trim()}
 set(q(".logo small"),s.tagline);
 if(isHttp(s.logo_url)){const mark=q(".logo .mark");if(mark){const im=d.createElement("img");im.className="mark";im.src=s.logo_url.trim();im.alt=title||"Royal Roots";im.style.cssText="width:40px;height:40px;object-fit:contain;flex:none";mark.replaceWith(im)}}
 /* built-in sections */
 const hero=q(".hero"),h1=q(".hero h1"),lead=q(".hero p.lead"),heroBtn=q(".hero .cta a.btn");
 const textTargets={"#home":[h1,lead],"#products":[q("#products .head h2"),q("#products .head p")],"#video":[q("#video h2"),q("#video .wrap>div p")],"#about":[q("#about h2"),q("#about .about>div p")||q("#about p")],"#advantages":[q("#why .head h2"),q("#why .head p")],"#enquiry":[q("#contact h2"),q("#contact>p")]};
 const have=new Set();
 for(const x of rows){
  if(!x.target_id)continue;const key=x.target_id,el=q(TARGET[key]||"__none__");
  if(TARGET[key])have.add(key);
  if(el)el.hidden=x.visible===false;
  if(x.visible===false)continue;
  const seed=SEED_SECTIONS[key],tt=textTargets[key];
  if(seed&&tt){if(txt(x.title)&&x.title.trim()!==seed[0])set(tt[0],x.title);if(txt(x.body)&&x.body.trim()!==seed[1])set(tt[1],x.body)}
  if(key==="#home"&&txt(x.button_text)&&heroBtn){heroBtn.textContent=x.button_text.trim();if(isLink(x.button_url))heroBtn.href=x.button_url.trim()}
  if(key==="#video"&&txt(x.button_text)){const a=q("#video a.btn");if(a){a.textContent=x.button_text.trim();if(isLink(x.button_url))a.href=x.button_url.trim()}}
  if(el&&key!=="#home"&&key!==".stats"&&isHttp(x.image_url)){const im=d.createElement("img");im.src=x.image_url.trim();im.alt=txt(x.title);im.style.cssText="display:block;max-width:min(100%,480px);max-height:320px;object-fit:contain;margin:18px auto";el.insertBefore(im,el.firstChild)}
 }
 if(txt(s.about_text)&&s.about_text.trim()!==SEED_SECTIONS["#about"][1])set(textTargets["#about"][1],s.about_text);
 /* section order: only when the editor order differs from its default */
 const used=rows.filter(x=>x.target_id&&x.target_id!=="#advantages"&&TARGET[x.target_id]&&q(TARGET[x.target_id])).map(x=>x.target_id);
 const seedSeq=SEED_ORDER.filter(k=>used.includes(k));
 if(used.length>1&&used.join("|")!==seedSeq.join("|")){
  const els=used.map(k=>q(TARGET[k])),parent=els[0].parentElement;
  if(parent&&els.every(e=>e.parentElement===parent)){const slots=[...els].sort((a,b)=>a.compareDocumentPosition(b)&4?-1:1);const mark=slots.map(()=>d.createComment("slot"));slots.forEach((e,i)=>e.replaceWith(mark[i]));mark.forEach((m,i)=>m.replaceWith(els[i]))}
 }
 /* hero from settings */
 set(h1,s.hero_title);set(lead,s.hero_body);
 if(heroBtn){set(heroBtn,s.hero_button_text);if(isLink(s.hero_button_url))heroBtn.href=s.hero_button_url.trim()}
 if(hero&&isHttp(s.hero_image_url)){hero.style.backgroundImage="linear-gradient(rgba(6,26,61,.74),rgba(6,26,61,.74)),url("+JSON.stringify(s.hero_image_url.trim())+")";hero.style.backgroundSize="cover";hero.style.backgroundPosition="center"}
 /* navigation labels */
 const nav=(sel,l)=>{if(txt(l))qa(sel).forEach(a=>a.textContent=l.trim())};
 nav('header nav a[href="#products"]',s.nav_products_label);nav('header nav a[href="#about"]',s.nav_about_label);nav("header nav a.btn",s.nav_contact_label);
 /* advantages cards (only when edited) */
 const feats=cards.filter(c=>c.group_key==="features"&&c.visible!==false);
 const edited=feats.length!==SEED_FEATURES.length||feats.some((c,i)=>c.title!==SEED_FEATURES[i][0]||c.body!==SEED_FEATURES[i][1]);
 const adv=q("#why .adv");
 if(adv&&cards.some(c=>c.group_key==="features")&&edited){adv.replaceChildren();for(const c of feats){const div=d.createElement("div"),h=d.createElement("h3"),p=d.createElement("p");h.textContent=c.title||"";p.textContent=c.body||"";div.append(h,p);adv.append(div)}}
 /* custom sections */
 const custom=rows.filter(x=>!x.target_id&&x.visible!==false);
 if(custom.length){let box=q("#rr-cms-content");if(!box){box=d.createElement("div");box.id="rr-cms-content";const after=q("#products");if(after&&after.parentElement)after.parentElement.insertBefore(box,after.nextSibling);else d.body.append(box)}
  for(const x of custom){const sec=d.createElement("section");sec.className="rr-cms-section";if(isHttp(x.image_url)){const im=d.createElement("img");im.src=x.image_url.trim();im.alt=txt(x.title);im.loading="lazy";sec.append(im)}const w=d.createElement("div"),h=d.createElement("h2");h.textContent=x.title||"";w.append(h);if(txt(x.body)){const p=d.createElement("p");p.textContent=x.body;w.append(p)}if(txt(x.button_text)&&isLink(x.button_url)){const a=d.createElement("a");a.textContent=x.button_text;a.href=x.button_url.trim();if(/^https?:/i.test(a.href)){a.target="_blank";a.rel="noopener noreferrer"}w.append(a)}sec.append(w);box.append(sec)}}
 /* footer text and social links */
 if(txt(s.footer_text)){const f=q("footer .wrap");if(f){let p=q("#rr-footer-text");if(!p){p=d.createElement("div");p.id="rr-footer-text";p.style.flexBasis="100%";f.append(p)}p.textContent=s.footer_text.trim()}}
 const soc={youtube:s.social_youtube_url,instagram:s.social_instagram_url,facebook:s.social_facebook_url};
 qa(".follow .social a").forEach(a=>{const k=a.textContent.trim().toLowerCase();if(isHttp(soc[k]))a.href=soc[k].trim()});
 if(s.social_links_visible===false){const f=q(".follow");if(f)f.hidden=true}
 /* contact details */
 const phone=txt(s.contact_phone)||txt(s.whatsapp);
 if(phone){
  const norm=x=>{const g=x.replace(/\D/g,"");return g.length===10?"91"+g:g};
  let parts=phone.split(/\s*(?:\/|,|;|\||&|\n|\band\b|\bor\b)\s*/i).map(x=>x.trim()).filter(x=>x.replace(/\D/g,"").length>=7);
  if(parts.length===1&&parts[0].replace(/\D/g,"").length===20){const g=parts[0].replace(/\D/g,"");parts=[g.slice(0,10),g.slice(10)]}
  const nums=[...new Set(parts.map(norm).filter(n=>/^\d{7,15}$/.test(n)))];
  if(nums.length){
   const wa=txt(s.whatsapp).replace(/\D/g,"");const waN=wa?(wa.length===10?"91"+wa:wa):nums[0];
   d.defaultView?.rrSetPhone?.(waN);
   d.defaultView?.rrSetPhones?.(nums);
   const show=n=>n.length===12&&n.startsWith("91")?"+91 "+n.slice(2,7)+" "+n.slice(7):"+"+n;
   qa('a[href^="tel:"]').filter(a=>!a.closest("#rr-cms-content")).forEach(a=>{
    if(a.textContent.includes(OLD.phone)){
     const frag=d.createDocumentFragment();
     nums.forEach((n,i)=>{if(i)frag.append(d.createTextNode(" · "));const l=d.createElement("a");l.href="tel:+"+n;l.textContent=show(n);frag.append(l)});
     a.replaceWith(frag)}
    else a.href="tel:+"+nums[0]});
   const label=nums.map(show).join(" / ");
   const w=d.createTreeWalker(d.body,4);let n;while((n=w.nextNode())){if(n.parentElement&&!n.parentElement.closest("#rr-cms-content")&&!/^(SCRIPT|STYLE)$/.test(n.parentElement.tagName)&&n.nodeValue.includes(OLD.phone))n.nodeValue=n.nodeValue.split(OLD.phone).join(label)}}}
 if(txt(s.contact_email)&&/^[^\s@]+@[^\s@]+$/.test(s.contact_email.trim())){const e=s.contact_email.trim();qa('a[href^="mailto:"]').filter(a=>!a.closest("#rr-cms-content")).forEach(a=>{if(a.textContent.trim().toLowerCase()===OLD.email.toLowerCase()){a.href="mailto:"+e;a.textContent=e}});const w=d.createTreeWalker(d.body,4);let n;while((n=w.nextNode())){if(n.parentElement&&!n.parentElement.closest("#rr-cms-content")&&!/^(SCRIPT|STYLE|A)$/.test(n.parentElement.tagName)&&n.nodeValue.includes(OLD.email))n.nodeValue=n.nodeValue.split(OLD.email).join(e)}}
 if(txt(s.address)){const p=qa("#contact p").find(x=>x.textContent.includes("Padam Nagar"));if(p){p.replaceChildren();s.address.trim().split(/\r?\n/).forEach((line,i)=>{if(i)p.append(d.createElement("br"));p.append(d.createTextNode(line))})}}
 /* published products and videos */
 if(Array.isArray(data.products)&&data.products.length)d.defaultView?.rrSetProducts?.(data.products);
 const vids=(data.videos||[]).filter(v=>v&&v.video_url);
 if(vids.length){const sec=q("#video");if(sec){const frame=q("#video .vframe"),btn=q("#video a.btn");const make=v=>{const e=embedUrl(v.video_url);let m;if(e){m=d.createElement("iframe");m.src=e;m.title=v.title||"Royal Roots video";m.loading="lazy";m.allowFullscreen=true;m.setAttribute("referrerpolicy","strict-origin-when-cross-origin")}else if(v.source_type==="upload"||/\.(mp4|webm|mov)(\?|$)/i.test(v.video_url)){m=d.createElement("video");m.src=v.video_url;m.controls=true;m.preload="metadata";if(isHttp(v.thumbnail_url))m.poster=v.thumbnail_url}return m};
  const first=make(vids[0]);if(first&&frame){frame.replaceChildren(first);if(btn&&isHttp(vids[0].video_url))btn.href=vids[0].video_url}
  const rest=vids.slice(1).map(make).filter(Boolean);if(rest.length){const wrap=q("#video .wrap");if(wrap){const g=d.createElement("div");g.className="rr-video-extra";rest.forEach(m=>g.append(m));wrap.append(g)}}}}
}
