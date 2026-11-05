const {db,isAdmin}=require('./_lib');
const {syncOrder}=require('./_sheet');
const T=['clusters','products'],OF='id,created_at,name,phone,items,status,prodi,gugus';
module.exports=async(req,res)=>{
 if(!isAdmin(req))return res.status(401).json({error:'Password salah'});
 if(req.method==='GET'){
  const w=req.query.w;
  if(w==='orders'){
   let q=db.from('orders').select(OF+',total,sheet_ok').order('id',{ascending:false}).limit(40);
   if(req.query.status)q=q.eq('status',req.query.status);
   if(req.query.before)q=q.lt('id',+req.query.before);
   const cnt=req.query.before?null:await Promise.all(['menunggu','lunas','batal'].map(s=>db.from('orders').select('id',{count:'exact',head:true}).eq('status',s)));
   const o=await q;
   return res.json({orders:o.data||[],counts:cnt&&{menunggu:cnt[0].count,lunas:cnt[1].count,batal:cnt[2].count}});
  }
  if(w==='proof'){const o=await db.from('orders').select('proof').eq('id',+req.query.id).single();return res.json({proof:o.data&&o.data.proof})}
  const [c,p,v,s]=await Promise.all([db.from('clusters').select('*').order('sort'),db.from('products').select('id,cluster_id,name,description,active,image_v,size_v').order('id'),db.from('variants').select('*').order('id'),db.from('settings').select('key,value').in('key',['wa_link','qris_v'])]);
  return res.json({clusters:c.data||[],products:p.data||[],variants:v.data||[],settings:Object.fromEntries((s.data||[]).map(x=>[x.key,x.value]))});
 }
 const {a,t,row,id,rows,del,product_id}=req.body||{};
 if(a==='save'&&T.includes(t)){const r=await db.from(t).upsert(row).select('id').single();return r.error?res.status(400).json({error:r.error.message}):res.json(r.data)}
 if(a==='del'&&T.includes(t)){await db.from(t).delete().eq('id',id);return res.json({ok:true})}
 if(a==='settings'){
  const wa=String(req.body.wa_link||'').trim();
  if(wa&&!/^https:\/\//.test(wa))return res.status(400).json({error:'Link grup harus diawali https://'});
  const rs=[{key:'wa_link',value:wa}];
  if(req.body.qris){if(!/^data:image\//.test(req.body.qris))return res.status(400).json({error:'File QRIS tidak valid'});rs.push({key:'qris',value:req.body.qris},{key:'qris_v',value:String(Date.now())})}
  const r=await db.from('settings').upsert(rs);
  return r.error?res.status(400).json({error:r.error.message}):res.json({ok:true});
 }
 if(a==='variants'){
  const pid=+product_id,clean=r=>({model:r.model||null,size:r.size||null,color:r.color||null,price:Math.max(0,Math.floor(+r.price)||0),stock:Math.max(0,Math.floor(+r.stock)||0),active:!!r.active,product_id:pid});
  const ups=(rows||[]).filter(r=>r.id).map(r=>({...clean(r),id:r.id})),ins=(rows||[]).filter(r=>!r.id).map(clean);
  const ops=[];
  if(del&&del.length)ops.push(db.from('variants').delete().in('id',del).eq('product_id',pid));
  if(ups.length)ops.push(db.from('variants').upsert(ups));
  if(ins.length)ops.push(db.from('variants').insert(ins));
  const rs=await Promise.all(ops),e=rs.find(x=>x.error);
  return e?res.status(400).json({error:e.error.message}):res.json({ok:true});
 }
 if(a==='paid'||a==='cancel'){
  // klaim atomik: hanya satu request yang bisa mengubah status
  const lunas=a==='paid';
  let q=db.from('orders').update({status:lunas?'lunas':'batal'}).eq('id',id);
  q=lunas?q.eq('status','menunggu'):q.in('status',['menunggu','lunas']);
  const {data:o}=await q.select(OF).single();
  if(!o)return res.json({ok:true});
  if(!lunas)await Promise.all(o.items.map(l=>db.rpc('add_stock',{vid:l.variant_id,q:l.qty}))); // kembalikan stok
  let sheet='ok',err='';
  try{await syncOrder(o);await db.from('orders').update({sheet_ok:true}).eq('id',id)}catch(e){sheet='gagal';err=String(e.message||e).slice(0,300);await db.from('orders').update({sheet_ok:false}).eq('id',id)}
  return res.json({ok:true,sheet,err});
 }
 if(a==='resync'){
  const {data:os}=await db.from('orders').select(OF).eq('sheet_ok',false).order('id').limit(10);
  let ok=0,fail=0,err='';
  for(const o of os||[]){try{await syncOrder(o);await db.from('orders').update({sheet_ok:true}).eq('id',o.id);ok++}catch(e){fail++;err=String(e.message||e).slice(0,300)}}
  const {count}=await db.from('orders').select('id',{count:'exact',head:true}).eq('sheet_ok',false);
  return res.json({ok,fail,left:count||0,err});
 }
 res.status(400).json({error:'Aksi tidak dikenal'});
};
