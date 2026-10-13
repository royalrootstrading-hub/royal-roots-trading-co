import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const url=window.SUPABASE_URL,key=window.SUPABASE_ANON_KEY;
const grid=document.querySelector("#products .product-grid");
if(grid&&url&&!url.includes("YOUR-PROJECT-REF")&&key&&!key.includes("YOUR_SUPABASE")&&key.length>20){
 const sb=createClient(url,key);
 const {data,error}=await sb.from("products").select("id,name,category,description,image_urls").eq("published",true).order("created_at",{ascending:false});
 if(error){console.warn("Product catalogue unavailable:",error.message);}
 else{
  grid.replaceChildren();
  for(const p of data||[]){
   const card=document.createElement("article");card.className="product";
   const imgs=Array.isArray(p.image_urls)?p.image_urls:[];
   if(imgs[0]){const img=document.createElement("img");img.src=imgs[0];img.alt=p.name||"Product";img.loading="lazy";img.style.cssText="width:100%;height:190px;object-fit:cover;border-radius:8px;margin-bottom:12px";card.append(img);}
   else{const icon=document.createElement("div");icon.className="icon";icon.textContent="▥";card.append(icon);}
   if(p.category){const cat=document.createElement("div");cat.className="eyebrow";cat.textContent=p.category;card.append(cat);}
   const title=document.createElement("h3");title.textContent=p.name||"";card.append(title);
   const desc=document.createElement("p");desc.textContent=p.description||"";card.append(desc);
   const link=document.createElement("a");link.href="#contact";link.textContent="Enquire now →";link.dataset.product=p.name||"";card.append(link);grid.append(card);
  }
  if(!data?.length){const empty=document.createElement("p");empty.textContent="Our product catalogue is being updated. Please contact us for current product information.";grid.append(empty);}
  grid.querySelectorAll("a[data-product]").forEach(a=>a.addEventListener("click",()=>{const sel=document.getElementById("f_product");if(!sel)return;let opt=[...sel.options].find(o=>o.value===a.dataset.product||o.text===a.dataset.product);if(!opt){opt=document.createElement("option");opt.value=a.dataset.product;opt.textContent=a.dataset.product;sel.append(opt);}sel.value=opt.value;}));
 }
}