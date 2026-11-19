import{createClient}from"https://esm.sh/@supabase/supabase-js@2";
/* Projects manager for website-admin.html. Pictures go to the public "product-images" bucket
   (same bucket and 8 MB / JPEG-PNG-WebP-GIF rules as the rest of the website editor). */
const $=s=>document.querySelector(s),BUCKET="product-images",MAX_PICS=12,TYPES=["image/jpeg","image/png","image/webp","image/gif"];
const sb=createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY,{auth:{persistSession:true,autoRefreshToken:true}});
let uid=null,rows=[],editRow=null,kept=[],removed=[];
const note=(m,t="")=>{const n=$("#notice");n.textContent=m;n.className=t;n.hidden=!m};
const isHttp=u=>/^https?:\/\//i.test(u||"");
const pathOf=u=>{const i=(u||"").indexOf("/object/public/"+BUCKET+"/");return i<0?"":decodeURIComponent(u.slice(i+("/object/public/"+BUCKET+"/").length).split("?")[0])};
function renderPics(){
 const root=$("#project-pics");root.replaceChildren();
 if(!kept.length){root.textContent="No pictures yet. Choose files below.";return}
 kept.forEach((u,i)=>{const f=document.createElement("figure");f.className="proj-pic";const im=document.createElement("img");im.src=u;im.alt="Project picture "+(i+1);im.loading="lazy";const b=document.createElement("button");b.type="button";b.className="danger";b.textContent="Remove";b.onclick=()=>{removed.push(u);kept.splice(i,1);renderPics()};const m=document.createElement("button");m.type="button";m.className="secondary";m.textContent=i===0?"Cover":"Make cover";m.disabled=i===0;m.onclick=()=>{kept.unshift(kept.splice(i,1)[0]);renderPics()};f.append(im,m,b);root.append(f)})
}
function clearForm(){editRow=null;kept=[];removed=[];$("#project-form").reset();$("#project-visible").checked=true;$("#project-editor-title").textContent="Add project";$("#project-save").textContent="Save project";$("#project-editor").hidden=true;renderPics()}
function edit(r){editRow=r;kept=(r.image_urls||[]).filter(isHttp);removed=[];$("#project-title").value=r.title||"";$("#project-category").value=r.category||"";$("#project-location").value=r.location||"";$("#project-description").value=r.description||"";$("#project-visible").checked=!!r.visible;$("#project-files").value="";$("#project-editor-title").textContent="Edit project";$("#project-save").textContent="Save changes";$("#project-editor").hidden=false;renderPics();$("#project-editor").scrollIntoView({behavior:"smooth"})}
async function removeFiles(urls){const paths=urls.map(pathOf).filter(p=>p&&p.startsWith(uid+"/"));if(paths.length)await sb.storage.from(BUCKET).remove(paths)}
async function load(){
 const{data,error}=await sb.from("site_projects").select("*").order("sort_order").order("created_at",{ascending:false});if(error)throw error;rows=data||[];
 const list=$("#project-list");list.replaceChildren();if(!rows.length){list.textContent="No projects yet. Click + Add project.";return}
 rows.forEach((r,i)=>{
  const row=document.createElement("article");row.className="section-row";const info=document.createElement("div"),h=document.createElement("h3"),p=document.createElement("p"),actions=document.createElement("div");
  h.textContent=r.title;p.textContent=[r.category,r.location].filter(Boolean).join(" · ")+(r.category||r.location?" · ":"")+(r.image_urls?.length||0)+" picture(s) · "+(r.visible?"Visible":"Hidden");info.append(h,p);actions.className="section-actions";
  const btn=(t,fn,cl="secondary")=>{const b=document.createElement("button");b.type="button";b.className=cl;b.textContent=t;b.onclick=fn;actions.append(b)};
  btn("↑",()=>move(i,-1));btn("↓",()=>move(i,1));btn("Edit",()=>edit(r));
  btn(r.visible?"Hide":"Show",async()=>{const q=await sb.from("site_projects").update({visible:!r.visible,updated_at:new Date().toISOString()}).eq("id",r.id);if(q.error)note(q.error.message,"error");else{await load();note("Visibility updated.","success")}});
  btn("Delete",async()=>{if(!confirm('Delete project "'+r.title+'" and its pictures?'))return;try{const q=await sb.from("site_projects").delete().eq("id",r.id);if(q.error)throw q.error;await removeFiles(r.image_urls||[]);await load();note("Project deleted.","success")}catch(e){note(e.message,"error")}},"danger");
  row.append(info,actions);list.append(row)})
}
async function move(i,d){const j=i+d;if(j<0||j>=rows.length)return;const a=rows[i],b=rows[j];const order=rows.map((_,k)=>k);/* rewrite 0..n so equal sort_orders cannot stall a swap */order[i]=j;order[j]=i;try{for(let k=0;k<rows.length;k++){const id=rows[k].id;const q=await sb.from("site_projects").update({sort_order:order[k]}).eq("id",id);if(q.error)throw q.error}await load();note("Project order updated.","success")}catch(e){note(e.message,"error")}}
async function uploadFile(f){if(!TYPES.includes(f.type)||f.size>8*1024*1024)throw Error('"'+f.name+'": use JPEG, PNG, WebP or GIF under 8 MB.');const path=uid+"/project-"+crypto.randomUUID()+"-"+f.name.replace(/[^a-zA-Z0-9._-]/g,"-").slice(-80);const q=await sb.storage.from(BUCKET).upload(path,f,{contentType:f.type});if(q.error)throw q.error;return{path,url:sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl}}
$("#project-add").onclick=()=>{clearForm();$("#project-editor").hidden=false;$("#project-editor").scrollIntoView({behavior:"smooth"})};$("#project-cancel").onclick=clearForm;
$("#project-form").onsubmit=async e=>{
 e.preventDefault();const b=$("#project-save");b.disabled=true;const fresh=[];
 try{
  const files=[...$("#project-files").files];if(kept.length+files.length>MAX_PICS)throw Error("A project can have at most "+MAX_PICS+" pictures.");
  const urls=[...kept];for(const f of files){const u=await uploadFile(f);fresh.push(u.path);urls.push(u.url)}
  const p={title:$("#project-title").value.trim(),category:$("#project-category").value.trim(),location:$("#project-location").value.trim(),description:$("#project-description").value.trim(),image_urls:urls,visible:$("#project-visible").checked,sort_order:editRow?.sort_order??rows.length,updated_at:new Date().toISOString()};
  const q=editRow?await sb.from("site_projects").update(p).eq("id",editRow.id):await sb.from("site_projects").insert(p);if(q.error)throw q.error;
  await removeFiles(removed);clearForm();await load();note("Project saved. Refresh the public website to see it.","success")
 }catch(err){if(fresh.length)await sb.storage.from(BUCKET).remove(fresh);note(err.message||"Save failed.","error")}finally{b.disabled=false}
};
async function start(s){
 if(!s?.user){uid=null;$("#project-add").disabled=true;$("#project-list").textContent="Sign in with an authorized administrator account to manage projects.";return}
 const q=await sb.from("product_admins").select("user_id").eq("user_id",s.user.id).maybeSingle();
 if(q.error||!q.data){uid=null;$("#project-add").disabled=true;$("#project-list").textContent="This account is not authorized to manage projects.";return}
 uid=s.user.id;$("#project-add").disabled=false;try{await load()}catch(e){note(e.message,"error")}
}
sb.auth.onAuthStateChange((ev,s)=>setTimeout(()=>start(s),0));const{data:{session}}=await sb.auth.getSession();await start(session);
