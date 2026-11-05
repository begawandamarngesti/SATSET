const {db}=require('./_lib');
module.exports=async(req,res)=>{
 const [c,p,v]=await Promise.all([db.from('clusters').select('*').order('sort'),db.from('products').select('*').eq('active',true).order('id'),db.from('variants').select('*').eq('active',true)]);
 res.json({clusters:c.data||[],products:p.data||[],variants:v.data||[]});
};
