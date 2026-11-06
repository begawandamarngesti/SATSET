const {db}=require('./_lib');
// sajikan gambar (produk / panduan ukuran / QRIS) sebagai file biasa -> di-cache browser & CDN
module.exports=async(req,res)=>{
 const {id,k}=req.query;let v;
 if(k==='qris'){const r=await db.from('settings').select('value').eq('key','qris').single();v=r.data&&r.data.value}
 else if(k==='pimg'){const r=await db.from('product_images').select('data').eq('id',+id).single();v=r.data&&r.data.data}
 else{const col=k==='size'?'size_img':'image';const r=await db.from('products').select(col).eq('id',+id).single();v=r.data&&r.data[col]}
 const m=/^data:(image\/[\w+.-]+);base64,(.+)$/.exec(v||'');
 if(!m)return res.status(404).end();
 res.setHeader('Content-Type',m[1]);
 res.setHeader('Cache-Control','public, max-age=31536000, s-maxage=31536000, immutable');
 res.send(Buffer.from(m[2],'base64'));
};
