const {db}=require('./_lib');
module.exports=async(req,res)=>{
 const [c,p,v,s,pi]=await Promise.all([
  db.from('clusters').select('id,name,sort').order('sort'),
  db.from('products').select('id,cluster_id,name,description,image_v,size_v').eq('active',true).order('id'),
  db.from('variants').select('id,product_id,model,size,color,price,stock').eq('active',true),
  db.from('settings').select('key,value').in('key',['wa_link','qris_v']),
  db.from('product_images').select('id,product_id,pos').order('pos').order('id')]);
 if(c.error||p.error||v.error)return res.status(500).json({error:'Gagal memuat data'});
 const S=Object.fromEntries((s.data||[]).map(x=>[x.key,x.value]));
 const IM={};((pi&&pi.data)||[]).forEach(m=>(IM[m.product_id]=IM[m.product_id]||[]).push('/api/img?k=pimg&id='+m.id));
 res.setHeader('Cache-Control','s-maxage=15, stale-while-revalidate=120');
 res.json({clusters:c.data,variants:v.data,wa:S.wa_link||'',qris:S.qris_v?`/api/img?k=qris&v=${S.qris_v}`:'',
  products:p.data.map(x=>({id:x.id,cluster_id:x.cluster_id,name:x.name,description:x.description,
   images:IM[x.id]||(x.image_v?[`/api/img?id=${x.id}&v=${x.image_v}`]:[]),size_img:x.size_v?`/api/img?k=size&id=${x.id}&v=${x.size_v}`:null}))});
};
