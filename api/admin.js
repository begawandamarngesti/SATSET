const {db,isAdmin}=require('./_lib');
const {google}=require('googleapis');
const T=['clusters','products','variants'];
module.exports=async(req,res)=>{
 if(!isAdmin(req))return res.status(401).json({error:'Password salah'});
 if(req.method==='GET'){
  const [c,p,v,o]=await Promise.all([db.from('clusters').select('*').order('sort'),db.from('products').select('*').order('id'),db.from('variants').select('*').order('id'),db.from('orders').select('*').order('id',{ascending:false}).limit(100)]);
  return res.json({clusters:c.data||[],products:p.data||[],variants:v.data||[],orders:o.data||[]});
 }
 const {a,t,row,id}=req.body||{};
 if(a==='save'&&T.includes(t)){const r=await db.from(t).upsert(row).select().single();return r.error?res.status(400).json({error:r.error.message}):res.json(r.data)}
 if(a==='del'&&T.includes(t)){await db.from(t).delete().eq('id',id);return res.json({ok:true})}
 if(a==='paid'){
  const {data:o}=await db.from('orders').select('*').eq('id',id).single();
  if(!o||o.status==='lunas')return res.json({ok:true});
  for(const l of o.items){const {data:v}=await db.from('variants').select('stock').eq('id',l.variant_id).single();if(v)await db.from('variants').update({stock:Math.max(0,v.stock-l.qty)}).eq('id',l.variant_id)}
  await db.from('orders').update({status:'lunas'}).eq('id',id);
  let sheet='ok';
  try{
   const auth=new google.auth.GoogleAuth({credentials:JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT),scopes:['https://www.googleapis.com/auth/spreadsheets']});
   await google.sheets({version:'v4',auth}).spreadsheets.values.append({spreadsheetId:process.env.SHEET_ID,range:'A1',valueInputOption:'USER_ENTERED',requestBody:{values:[[new Date().toISOString(),o.id,o.name,o.phone,o.items.map(i=>i.name+' x'+i.qty).join('; '),o.total,'LUNAS']]}});
  }catch(e){sheet='gagal'}
  return res.json({ok:true,sheet});
 }
 res.status(400).json({error:'Aksi tidak dikenal'});
};
