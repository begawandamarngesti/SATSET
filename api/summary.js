const {db}=require('./_lib');
// jumlah dipesan per produk (tanpa data pribadi), pesanan batal tidak dihitung
module.exports=async(req,res)=>{
 const r=await db.from('orders').select('items').neq('status','batal').order('id',{ascending:false}).limit(5000);
 if(r.error)return res.status(500).json({error:'Gagal memuat'});
 const m={};let n=0;
 for(const o of r.data||[]){n++;for(const i of o.items||[]){const k=i.pname||i.name;m[k]=(m[k]||0)+(+i.qty||0)}}
 res.setHeader('Cache-Control','s-maxage=30, stale-while-revalidate=120');
 res.json({orders:n,items:Object.entries(m).map(([name,qty])=>({name,qty})).sort((a,b)=>b.qty-a.qty)});
};
