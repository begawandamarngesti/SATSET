// Sinkron 1 pesanan ke Google Sheets: 1 baris per item. Idempotent (aman dipanggil berulang).
const HEAD=['Waktu','No Pesanan','Nama','No HP','Produk','Model','Ukuran','Warna','Jumlah','Harga Satuan','Status'];
exports.syncOrder=async o=>{
 const {google}=require('googleapis'); // dimuat saat perlu saja
 const auth=new google.auth.GoogleAuth({credentials:JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT),scopes:['https://www.googleapis.com/auth/spreadsheets']});
 const sh=google.sheets({version:'v4',auth}),spreadsheetId=process.env.SHEET_ID;
 const st=({menunggu:'MENUNGGU CEK',lunas:'LUNAS',batal:'BATAL'})[o.status]||o.status;
 const g=await sh.spreadsheets.values.get({spreadsheetId,range:'B:B'}),col=g.data.values||[];
 const rows=[];col.forEach((r,i)=>{if(String(r[0])===String(o.id))rows.push(i+1)});
 if(rows.length)return sh.spreadsheets.values.batchUpdate({spreadsheetId,requestBody:{valueInputOption:'USER_ENTERED',data:rows.map(n=>({range:'K'+n,values:[[st]]}))}});
 const t=new Date(o.created_at).toLocaleString('id-ID',{timeZone:'Asia/Jakarta'});
 const values=o.items.map(i=>[t,o.id,o.name,"'"+o.phone,i.pname||i.name,i.model||'',i.size||'',i.color||'',i.qty,i.price||'',st]);
 if(!col.length)values.unshift(HEAD);
 return sh.spreadsheets.values.append({spreadsheetId,range:'A1',valueInputOption:'USER_ENTERED',insertDataOption:'INSERT_ROWS',requestBody:{values}});
};
