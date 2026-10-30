import{createClient}from"https://esm.sh/@supabase/supabase-js@2";
import{applyCms}from"./cms-apply.js";
const url=window.SUPABASE_URL,key=window.SUPABASE_ANON_KEY;
if(url&&key){try{
 const sb=createClient(url,key);
 const ok=r=>r&&!r.error?r.data:null;
 const [s,sec,cards,prod,vid]=await Promise.all([
  sb.from("site_settings").select("*").eq("id","main").maybeSingle(),
  sb.from("site_sections").select("*").order("sort_order").order("created_at"),
  sb.from("site_cards").select("*").order("group_key").order("sort_order"),
  sb.from("products").select("id,name,category,description,image_urls").eq("published",true).order("created_at",{ascending:false}),
  sb.from("site_videos").select("id,title,description,source_type,video_url,thumbnail_url").eq("visible",true).order("sort_order").order("created_at")
 ]);
 applyCms(document,{settings:ok(s)||{},sections:ok(sec)||[],cards:ok(cards)||[],products:ok(prod)||[],videos:ok(vid)||[]});
}catch(e){console.warn("Website editor content could not be loaded; showing default content.",e)}}
