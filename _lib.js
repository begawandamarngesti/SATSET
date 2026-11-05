const {createClient}=require('@supabase/supabase-js');
const crypto=require('crypto');
exports.db=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_KEY,{auth:{persistSession:false}});
exports.isAdmin=req=>{const a=Buffer.from(req.headers.authorization||''),b=Buffer.from('Bearer '+(process.env.ADMIN_PASSWORD||'x'));return a.length===b.length&&crypto.timingSafeEqual(a,b)};
