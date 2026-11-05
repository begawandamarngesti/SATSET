const {db}=require('./_lib');
module.exports=async(req,res)=>{
 if(req.method!=='POST')return res.status(405).end();
 const {name,phone,items,proof}=req.body||{};
 if(!name||!phone||!Array.isArray(items)||!items.length||items.length>50||!proof||proof.length>3e6)return res.status(400).json({error:'Data belum lengkap'});
 const {data:vs}=await db.from('variants').select('*, products(name)').in('id',items.map(i=>+i.variant_id)).eq('active',true);
 let total=0;const lines=[];
 for(const i of items){
  const v=(vs||[]).find(x=>x.id==i.variant_id),q=Math.floor(+i.qty);
  if(!v||!(q>0)||q>v.stock)return res.status(400).json({error:'Stok atau varian tidak valid'});
  total+=v.price*q;
  lines.push({variant_id:v.id,name:[v.products.name,v.model,v.size,v.color].filter(Boolean).join(' '),qty:q,price:v.price});
 }
 const {data:o,error}=await db.from('orders').insert({name:String(name).slice(0,100),phone:String(phone).slice(0,30),items:lines,total,proof}).select().single();
 if(error)return res.status(500).json({error:'Gagal menyimpan pesanan'});
 res.json({ok:true,id:o.id,total});
};
