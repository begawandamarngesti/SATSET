const {db}=require('./_lib');

module.exports=async(req,res)=>{
 res.setHeader('Cache-Control','no-store');
 const words=String(req.query.q||'').toLowerCase().replace(/[^a-z0-9\u00c0-\u024f\s.'-]/g,' ').split(/\s+/).filter(Boolean).slice(0,5);
 if(words.join('').length<3)return res.status(400).json({error:'Ketik minimal 3 huruf'});
 let q=db.from('orders').select('id,created_at,name,items,status,total');
 words.forEach(w=>{q=q.ilike('name','%'+w+'%')});
 const {data,error}=await q.order('id',{ascending:false}).limit(15);
 if(error)return res.status(500).json({error:'Gagal memuat, coba lagi'});
 const list=data||[],eo={};
 if(list.length){
  const r=await db.from('settings').select('key,value').in('key',list.map(o=>'eo:'+o.id));
  (r.data||[]).forEach(x=>{try{eo[x.key.slice(3)]=typeof x.value==='string'?JSON.parse(x.value):x.value}catch(e){}});
 }
 res.json({orders:list.map(o=>{
  const e=eo[o.id],src=e&&Array.isArray(e.items)?e.items:(o.items||[]);
  const items=src.map(i=>({name:String(i.name||''),qty:+i.qty||0,price:+i.price||0}));
  const calc=items.reduce((s,i)=>s+i.qty*i.price,0);
  return {id:o.id,created_at:o.created_at,name:(e&&e.name)||o.name,status:o.status,items,total:e?calc:(+o.total||calc)};
 })});
};
