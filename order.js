const {db}=require('./_lib');
const {syncOrder}=require('./_sheet');
let wu=null;try{wu=require('@vercel/functions').waitUntil}catch(e){}
module.exports=async(req,res)=>{
 if(req.method!=='POST')return res.status(405).end();
 const {name,phone,items,proof,prodi,gugus}=req.body||{};
 if(!name||!phone||!prodi||!gugus||!Array.isArray(items)||!items.length||items.length>50||typeof proof!=='string'||!proof.startsWith('data:image/')||proof.length>3e6)return res.status(400).json({error:'Data belum lengkap'});
 const m={};for(const i of items){const k=+i.variant_id,q=Math.floor(+i.qty);if(!(k>0)||!(q>0)||q>99)return res.status(400).json({error:'Data tidak valid'});m[k]=(m[k]||0)+q}
 const list=Object.keys(m).map(Number).sort((a,b)=>a-b).map(id=>({variant_id:id,qty:m[id]}));
 const {data,error}=await db.rpc('create_order',{p_name:String(name).slice(0,100),p_phone:String(phone).slice(0,30),p_items:list,p_proof:proof,p_prodi:String(prodi).slice(0,60),p_gugus:String(gugus).slice(0,30)});
 if(error){const s=/STOK:(.*)/.exec(error.message||'');return res.status(s?409:500).json({error:s?'Stok tidak cukup: '+s[1].trim()+'. Muat ulang halaman lalu coba lagi.':'Gagal menyimpan pesanan'})}
 const r=Array.isArray(data)?data[0]:data;
 // tulis ke Sheets di belakang layar (pembeli tidak menunggu). Kalau gagal, ditandai & bisa disinkron ulang dari admin.
 const job=(async()=>{try{await syncOrder({id:r.order_id,created_at:new Date().toISOString(),name:String(name).slice(0,100),phone:String(phone).slice(0,30),items:r.order_items,prodi:String(prodi).slice(0,60),gugus:String(gugus).slice(0,30),status:'menunggu'});await db.from('orders').update({sheet_ok:true}).eq('id',r.order_id)}catch(e){console.error('sheet',e.message)}})();
 if(wu)wu(job);else await job;
 res.json({ok:true,id:r.order_id,total:r.order_total});
};
