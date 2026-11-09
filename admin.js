<!doctype html><html lang=id><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><title>Admin v4 (server)</title>
<style>
body{font:15px system-ui;margin:0;background:#f4f4f8;color:#222}main{max-width:960px;margin:auto;padding:12px}
.c{background:#fff;border-radius:10px;padding:12px;margin:10px 0}
input,select,textarea,button{font:inherit;padding:7px;margin:2px;border:1px solid #ccc;border-radius:6px}
button{background:#4f46e5;color:#fff;border:0;cursor:pointer}button.g{background:#888}button.r{background:#d33}button:disabled{background:#bbb}
table{width:100%;border-collapse:collapse}th{font-size:12px;color:#666;text-align:left;padding:2px}td{padding:2px}
td input[type=number]{width:100px}.row{display:flex;flex-wrap:wrap;gap:6px;align-items:center}.sm{font-size:12px;color:#666}
img{max-width:110px;border-radius:6px;display:block}.sticky{position:sticky;bottom:0;background:#f4f4f8;padding:8px 0}
.tg{background:#eef;padding:6px 8px;border-radius:6px;display:inline-block;margin:2px}.tg input{width:90px}.gal{display:flex;flex-wrap:wrap;gap:8px;margin:6px 0}.th{width:110px}.th img{width:110px;height:110px;object-fit:cover}.th button{padding:4px 8px}
#dl{position:fixed;inset:0;background:#0008;display:none;overflow:auto;z-index:9}#dl .box{background:#fff;max-width:900px;margin:16px auto;border-radius:12px;padding:14px}
.bx{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;margin:8px 0}.bx label{border:2px solid #ddd;border-radius:10px;padding:8px;cursor:pointer;display:block;font-size:13px}.bx label.on{border-color:#4f46e5;background:#eef}
.rb{border-top:1px solid #e5e5ee;padding:10px 0}.rb:first-of-type{border-top:0}
.rt{margin-top:4px}.rt th{background:#1b4fa8;color:#fff;padding:5px 6px;font-size:12px}.rt td{border-bottom:1px solid #eee;padding:4px 6px}.rt .n{text-align:right;white-space:nowrap}
.rt tr.tt td{background:#eef;font-weight:700}.rt input{width:100%;margin:0;box-sizing:border-box}.rt input[type=number]{width:90px}
.sx{padding:2px 9px;font-size:12px}.ok{color:#118a3e;font-weight:700}.bad{color:#d33;font-weight:700}.wr{color:#c2410c;font-weight:700}
.rt tr.hl td{background:#fef08a}
.rt tr.dn td{background:#dbeafe;color:#111;opacity:.72}
#dm{position:fixed;inset:0;background:#0008;display:none;align-items:center;justify-content:center;z-index:20}.box2{background:#fff;border-radius:12px;padding:16px;max-width:340px;width:90%}
</style>
<main id=app>Memuat...</main><div id=dl></div><div id=dm></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js"></script>
<script>
let K=sessionStorage.k||'',S={clusters:[],products:[],variants:[],settings:{}},O=null,NQ=null,E=null,tab='p',busy=false;
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';'),rp=n=>'Rp'+(+n||0).toLocaleString('id-ID');
const img=(f,w,ql)=>new Promise(r=>{const i=new Image();i.onload=()=>{const k=Math.min(1,w/i.width),c=document.createElement('canvas');c.width=i.width*k;c.height=i.height*k;c.getContext('2d').drawImage(i,0,0,c.width,c.height);r(c.toDataURL('image/jpeg',ql||.7))};i.src=URL.createObjectURL(f)});
async function api(b,qs){
 const r=await fetch('/api/admin'+(qs||''),{method:b?'POST':'GET',headers:{Authorization:'Bearer '+K,'Content-Type':'application/json'},body:b&&JSON.stringify(b)});
 const j=await r.json();
 if(r.status===401){K=prompt('Password admin')||'';sessionStorage.k=K;return api(b,qs)}
 if(!r.ok)alert(j.error);return j;
}
async function load(){S={...S,...await api()};render()}
async function loadOrders(more){
 if(!more||!O)O={list:[],st:O?O.st:'',more:false,counts:O&&O.counts};
 const b=more&&O.list.length?'&before='+O.list[O.list.length-1].id:'';
 const r=await api(null,'?w=orders&status='+O.st+b);
 O.list=O.list.concat(r.orders);O.more=r.orders.length>=40;if(r.counts)O.counts=r.counts;render();
}
function setSt(s){O.st=s;loadOrders()}
function go(t){tab=t;E=null;ED=null;if(t==='o'){$('#app').innerHTML='Memuat pesanan...';loadOrders()}else if(t==='r'||t==='d')loadRecap();else render()}
function render(){
 $('#app').innerHTML=`<button onclick="go('p')">Produk</button><button onclick="go('o')">Pesanan</button><button onclick="go('r')">Rekap</button><button style="background:#16a34a" onclick="go('d')">Distribusi Barang</button><button class=g onclick="go('s')">Pengaturan</button>`+(tab==='o'?orders():tab==='s'?settings():tab==='r'?recapView():tab==='d'?distView():E?editor():list());if(tab==='d')applyDF();if(tab==='r')applyRF();
}
/* ---------- produk ---------- */
function list(){
 return `<div class=c><input id=cn placeholder="Nama klaster"><button onclick=addC()>Tambah klaster</button></div>`+S.clusters.map(c=>`<div class=c><b>${esc(c.name)}</b> <button onclick="edit(0,${c.id})">Tambah produk</button> <button class=r onclick=delC(${c.id})>Hapus klaster</button>${S.products.filter(p=>p.cluster_id==c.id).map(p=>{const vs=S.variants.filter(v=>v.product_id==p.id),pr=vs.map(v=>v.price);return `<div style="margin-top:6px">${esc(p.name)} <span class=sm>${vs.length} varian${pr.length?' · '+rp(Math.min(...pr))+(Math.max(...pr)>Math.min(...pr)?' – '+rp(Math.max(...pr)):''):''}${p.active?'':' · disembunyikan'}</span> <button class=g onclick=edit(${p.id})>Edit</button> <button class="${p.active?'':'r'}" onclick=tgl(${p.id})>${p.active?'Sembunyikan':'Tampilkan'}</button></div>`}).join('')}</div>`).join('');
}
async function addC(){const n=$('#cn').value.trim();if(!n)return;await api({a:'save',t:'clusters',row:{name:n,sort:S.clusters.length}});load()}
async function delC(id){if(confirm('Hapus klaster beserta produknya?')){await api({a:'del',t:'clusters',id});load()}}
async function tgl(id){
 const p=S.products.find(x=>x.id==id);
 await api({a:'save',t:'products',row:{id:p.id,cluster_id:p.cluster_id,name:p.name,description:p.description,active:!p.active}});
 load();
}
function edit(id,cid){E={p:id?{...S.products.find(x=>x.id==id)}:{cluster_id:cid,active:true},vs:S.variants.filter(v=>v.product_id==id).map(v=>({...v})),del:[],bp:0,ao:{},idel:[],imgs:(S.images||[]).filter(m=>m.product_id==id).map(m=>({id:m.id,url:'/api/img?k=pimg&id='+m.id}))};
 if(id&&E.p.image_v)E.p.preview='/api/img?id='+id+'&v='+E.p.image_v;
 if(id&&E.p.size_v)E.p.sizePrev='/api/img?k=size&id='+id+'&v='+E.p.size_v;
 // isi harga dasar = harga termurah supaya tidak mulai dari nol
 const pr=E.vs.map(v=>v.price).filter(Boolean);if(pr.length)E.bp=Math.min(...pr);
 render()}
function sync(){if($('#n')){E.p.name=$('#n').value;E.p.description=$('#d').value;E.p.cluster_id=+$('#cl').value;E.p.active=$('#ac').checked;document.querySelectorAll('[data-vi]').forEach(el=>{const v=E.vs[+el.dataset.vi];if(!v)return;const f=el.dataset.f;v[f]=f==='active'?el.checked:(+el.value||0)})}}
const AT=[['model','Model'],['size','Ukuran'],['color','Warna']];
function addons(){
 const out=AT.map(([k,l])=>{const o=[...new Set(E.vs.map(v=>v[k]).filter(Boolean))];return o.length?`<div class=sm style="margin-top:6px">Tambahan harga ${l}:</div>`+o.map(x=>`<span class=tg>${esc(x)} +<input type=number placeholder=0 data-k="${esc(k+':'+x)}" value="${E.ao[k+':'+x]||''}" onchange="E.ao[this.dataset.k]=+this.value||0"></span>`).join(''):''}).join('');
 return out;
}
function editor(){
 return `<div class=c><input id=n placeholder="Nama produk" value="${esc(E.p.name)}"><select id=cl>${S.clusters.map(c=>`<option value=${c.id} ${c.id==E.p.cluster_id?'selected':''}>${esc(c.name)}</option>`).join('')}</select><br><textarea id=d placeholder=Deskripsi style="width:95%">${esc(E.p.description)}</textarea><div class=sm style="margin-top:6px">Foto produk (${E.imgs.length}/10). Foto pertama jadi foto utama.</div><div class=gal>${E.imgs.map((m,i)=>`<div class=th><img src="${esc(m.url)}">${i?`<button class=g onclick=imgMv(${i})>Jadikan utama</button>`:'<span class=sm>Foto utama</span>'} <button class=r onclick=imgRm(${i})>Hapus</button></div>`).join('')}</div><input type=file accept=image/* multiple onchange=pics(this) ${E.imgs.length>=10?'disabled':''}><div class=sm style="margin-top:6px">Tabel panduan ukuran (opsional):</div><div>${E.p.size||E.p.sizePrev?`<img src="${esc(E.p.size||E.p.sizePrev)}" style="max-width:200px">`:''}<input type=file accept=image/* onchange=picSize(this)></div><label><input type=checkbox id=ac ${E.p.active?'checked':''}> Tampil di toko</label></div>
<div class=c><b>1. Buat kombinasi</b> <span class=sm>(pisahkan dengan koma, kosongkan yang tidak perlu)</span><br><input id=m placeholder="Model: Pendek,Panjang"><input id=s placeholder="Ukuran: M,L,XL"><input id=w placeholder="Warna: Hitam,Putih"><button onclick=gen()>Buat kombinasi</button><button class=g onclick=noVar()>Produk tanpa pilihan</button></div>
<div class=c><b>2. Atur harga massal</b><div class=row>Harga dasar <input type=number id=bp value="${E.bp||''}" placeholder="mis. 75000" onchange="E.bp=+this.value||0"></div>${addons()||'<div class=sm>Buat kombinasi dulu.</div>'}<div class=row style="margin-top:6px"><button onclick=applyPrice()>Terapkan harga ke semua baris</button>Stok semua <input type=number id=bs placeholder="mis. 20" style="width:90px"><button class=g onclick=applyStock()>Set stok</button></div><div class=sm>Harga baris = harga dasar + tambahan model + ukuran + warna. Setelah itu tiap baris masih bisa diedit manual.</div></div>
<div class=c><b>3. Daftar varian</b> (${E.vs.length})<div style="overflow-x:auto"><table><tr><th>Model<th>Ukuran<th>Warna<th>Harga<th>Stok<th>Aktif<th>${E.vs.map((v,i)=>`<tr><td>${v.model||v.size||v.color?esc(v.model):'<i class=sm>(tanpa pilihan)</i>'}<td>${esc(v.size)}<td>${esc(v.color)}<td><input type=number placeholder=Harga data-vi=${i} data-f=price value=${v.price||''} ${v.price>0?'':'style="border-color:#d33"'}><td><input type=number data-vi=${i} data-f=stock value=${v.stock}><td><input type=checkbox data-vi=${i} data-f=active ${v.active?'checked':''}><td><button class=r onclick=rmv(${i})>x</button>`).join('')}</table></div></div>
<div class=sticky><button id=sv onclick=save()>Simpan</button><button class=g onclick="E=null;render()">Batal</button>${E.p.id?`<button class=r onclick=delP()>Hapus produk</button>`:''}</div>`;
}
async function picSize(el){if(!el.files[0])return;sync();E.p.size=await img(el.files[0],1000,.85);render()}
async function pics(el){
 if(!el.files.length)return;sync();
 const fs=[...el.files].slice(0,10-E.imgs.length);
 if(el.files.length>fs.length)alert('Maksimal 10 foto per produk. Sisanya diabaikan.');
 for(const f of fs){const d=await img(f,600,.75);E.imgs.push({data:d,url:d})}
 el.value='';render();
}
function imgRm(i){sync();const m=E.imgs.splice(i,1)[0];if(m.id)E.idel.push(m.id);render()}
function imgMv(i){sync();E.imgs.unshift(E.imgs.splice(i,1)[0]);render()}
function gen(){
 sync();const L=q=>$(q).value.split(',').map(x=>x.trim()).filter(Boolean),M=L('#m'),Z=L('#s'),W=L('#w');
 if(!M.length&&!Z.length&&!W.length)return alert('Isi minimal salah satu: model, ukuran, atau warna.\nUntuk produk tanpa pilihan (1 harga saja), klik tombol "Produk tanpa pilihan".');
 for(const m of M.length?M:[''])for(const s of Z.length?Z:[''])for(const w of W.length?W:[''])
  if(!E.vs.some(v=>(v.model||'')==m&&(v.size||'')==s&&(v.color||'')==w))E.vs.push({model:m||null,size:s||null,color:w||null,price:0,stock:99,active:true});
 render();
}
function noVar(){sync();if(E.vs.some(v=>!v.model&&!v.size&&!v.color))return;E.vs.push({model:null,size:null,color:null,price:0,stock:99,active:true});render()}
function applyPrice(){sync();E.bp=+$('#bp').value||0;if(!E.bp)return alert('Isi harga dasar dulu.');
 E.vs.forEach(v=>v.price=E.bp+(E.ao['model:'+v.model]||0)+(E.ao['size:'+v.size]||0)+(E.ao['color:'+v.color]||0));render()}
function applyStock(){sync();const n=$('#bs').value;if(n==='')return;E.vs.forEach(v=>v.stock=Math.max(0,+n||0));render()}
function rmv(i){sync();const v=E.vs.splice(i,1)[0];if(v.id)E.del.push(v.id);render()}
async function delP(){if(!confirm('Hapus produk ini beserta semua variannya?'))return;await api({a:'del',t:'products',id:E.p.id});E=null;load()}
async function save(){
 if(busy)return;sync();if(!E.p.name)return alert('Isi nama produk.');
 if(!E.vs.length)return alert('Belum ada varian. Buat kombinasi dulu, atau klik "Produk tanpa pilihan".');
 if(E.vs.some(v=>v.active&&!(v.price>0)))return alert('Masih ada varian aktif dengan harga 0 (kolom bergaris merah). Isi harganya atau hapus barisnya.');
 busy=true;$('#sv').disabled=true;$('#sv').textContent='Menyimpan...';
 try{
  const {id,cluster_id,name,description,active}=E.p,row={id,cluster_id,name,description,active};
  if(E.p.image){row.image=E.p.image;row.image_v=Date.now()}
  if(E.p.size){row.size_img=E.p.size;row.size_v=Date.now()}
  const p=await api({a:'save',t:'products',row});if(!p.id)return;
  await api({a:'variants',product_id:p.id,rows:E.vs,del:E.del});
  const add=[],order=[];E.imgs.forEach(m=>{if(m.id)order.push(m.id);else{order.push('n'+add.length);add.push(m.data)}});
  if(add.length||order.length||E.idel.length){const ri=await api({a:'images',product_id:p.id,add,del:E.idel,order});if(!ri.ok)return}
  E=null;await load();
 }finally{busy=false;if($('#sv')){$('#sv').disabled=false;$('#sv').textContent='Simpan'}}
}
/* ---------- pesanan ---------- */
function orders(){
 const c=O.counts||{},tb=[['','Semua'],['menunggu','Menunggu ('+(c.menunggu??0)+')'],['lunas','Lunas ('+(c.lunas??0)+')'],['batal','Batal ('+(c.batal??0)+')']];
 return `<div class=c>${tb.map(([v,l])=>`<button class="${O.st===v?'':'g'}" onclick="setSt('${v}')">${l}</button>`).join('')} <button class=g onclick=resync()>Sinkron ke Sheets</button></div>`+
 (O.list.map(o=>`<div class=c id=o${o.id}><b>#${o.id}</b> ${esc(o.name)}, ${esc(o.phone)}${o.prodi?' · '+esc(o.prodi)+' / '+esc(o.gugus):''} <span class=sm>${new Date(o.created_at).toLocaleString('id-ID')}</span><br>${o.items.map(i=>esc(i.name)+' x'+(+i.qty)).join('<br>')}<br><b>${rp(o.total)}</b> (${esc(o.status)}) ${o.sheet_ok?'':'<span class=sm style="color:#d33">belum masuk Sheets</span>'}<div class=pf><button class=g onclick=proof(${o.id})>Lihat bukti bayar</button></div>${o.status==='menunggu'?`<button onclick=paid(${o.id})>Tandai lunas</button>`:''}${o.status!=='batal'?`<button class=r onclick=cancelO(${o.id})>Batalkan</button>`:''}</div>`).join('')||'<p>Belum ada pesanan.</p>')+(O.more?`<button class=g onclick="loadOrders(true)">Muat lebih banyak</button>`:'');
}
async function proof(id){const el=$('#o'+id+' .pf');el.textContent='Memuat...';const r=await api(null,'?w=proof&id='+id);el.innerHTML=r.proof?`<img src="${esc(r.proof)}" style="max-width:260px">`:'Tidak ada bukti'}
async function paid(id){const r=await api({a:'paid',id});if(r.sheet==='gagal')alert('Status tersimpan, tapi gagal menulis ke Google Sheets. Klik "Sinkron ke Sheets" nanti.\n\nPenyebab: '+r.err);loadOrders()}
async function cancelO(id){if(!confirm('Batalkan pesanan ini? Stok dikembalikan.'))return;const r=await api({a:'cancel',id});if(r.sheet==='gagal')alert('Dibatalkan, tapi belum tersinkron ke Sheets.\n\nPenyebab: '+r.err);loadOrders()}
async function resync(){const r=await api({a:'resync'});alert(r.ok+' pesanan tersinkron, '+r.fail+' gagal, sisa '+r.left+(r.left?' (klik lagi).':'.')+(r.err?'\n\nPenyebab gagal: '+r.err:''));loadOrders()}
/* ---------- pengaturan ---------- */
function settings(){
 const q=NQ||(S.settings.qris_v?'/api/img?k=qris&v='+S.settings.qris_v:'');
 return `<div class=c><b>Link grup WhatsApp</b><div class=sm>Pembeli diarahkan ke sini setelah pesanan berhasil.</div><input id=wa style="width:95%" placeholder="https://chat.whatsapp.com/xxxx" value="${esc(S.settings.wa_link)}"></div>
<div class=c><b>Gambar QRIS</b>${q?`<img src="${esc(q)}" style="max-width:220px;margin:6px 0">`:'<div class=sm>Belum ada.</div>'}<input type=file accept=image/* onchange=picQ(this)></div><button id=ss onclick=saveSet()>Simpan pengaturan</button>`;
}
async function picQ(el){if(!el.files[0])return;S.settings.wa_link=$('#wa').value;NQ=await img(el.files[0],1000,.92);render()}
async function saveSet(){const b=$('#ss');b.disabled=true;b.textContent='Menyimpan...';const wa=$('#wa').value.trim();const r=await api({a:'settings',wa_link:wa,qris:NQ});if(r.ok){NQ=null;await load()}else{b.disabled=false;b.textContent='Simpan pengaturan'}}
/* ---------- rekap ---------- */
let R=null,RO=null,ED=null,RS='';const LBL={model:'Model',size:'Ukuran',color:'Warna'};
/* edit pesanan & stok disimpan di browser ini (localStorage) */
let DBG='',EO={},STK={},DST={},SYNC=false,LOC={eo:{},stk:{},dst:{}};const PT={};
try{LOC.eo=JSON.parse(localStorage.satset_eo||'{}');LOC.stk=JSON.parse(localStorage.satset_stk||'{}');LOC.dst=JSON.parse(localStorage.satset_dst||'{}')}catch(e){}
const svLocal=()=>{try{localStorage.satset_eo=JSON.stringify(EO);localStorage.satset_stk=JSON.stringify(STK);localStorage.satset_dst=JSON.stringify(DST)}catch(e){}};
const sbar=()=>SYNC?'<div class=c style="background:#dcfce7;border:2px solid #16a34a"><b style="color:#166534">✅ MODE SERVER (v4): edit, stok, dan centang tersimpan di server dan terlihat di semua laptop.</b></div>':'<div class=c style="background:#fee2e2;border:2px solid #dc2626"><b style="color:#b91c1c">⚠ MODE BROWSER SAJA: data cuma tersimpan di laptop ini dan TIDAK terlihat di laptop lain.</b><div class=sm style="color:#7f1d1d">Penyebab: file api/admin.js di server belum versi baru (belum ada w=state). Ganti api/admin.js dengan admin.js terbaru, tunggu deploy Vercel selesai, lalu hard refresh.</div><div class=sm style="color:#7f1d1d;margin-top:4px">Respon server untuk w=state: <code>'+esc(DBG)+'</code></div></div>';
const hasLoc=()=>SYNC&&Object.values(LOC).some(o=>Object.keys(o).length);
/* data edit/stok/distribusi disimpan di server (tabel settings) supaya dipakai bersama; kalau API belum ditambah, otomatis pakai browser saja */
async function loadState(){
 let st;try{st=await api(null,'?w=state')}catch(e){st={error:String(e)}}
 DBG=JSON.stringify(st).slice(0,160);
 if(st&&st.eo&&st.stk&&st.dst){EO=st.eo;STK=st.stk;DST=st.dst;SYNC=true}
 else{SYNC=false;EO=LOC.eo;STK=LOC.stk;DST=LOC.dst}
}
async function pst(kind,k,v){
 const M=kind==='eo'?EO:kind==='stk'?STK:DST;
 if(v==null)delete M[k];else M[k]=v;
 if(!SYNC){svLocal();return}
 const r=await api({a:'state_set',kind,k,v:v==null?null:v});
 if(!r||!r.ok)alert('Gagal menyimpan ke server. Coba lagi.');
}
function stkSave(k,v){clearTimeout(PT[k]);PT[k]=setTimeout(()=>{delete PT[k];pst('stk',k,v)},500)}
const migBtn=()=>hasLoc()?`<div style="margin-top:6px"><button class=g onclick=migrate()>⬆ Kirim data edit/stok/centang dari browser ini ke server</button></div>`:'';
async function migrate(){
 const it=[];for(const kd of ['eo','stk','dst'])for(const [k,v] of Object.entries(LOC[kd]))it.push({kind:kd,k,v});
 if(!it.length)return;
 if(!confirm('Kirim '+it.length+' data dari browser ini ke server? Data di server dengan kunci yang sama akan tertimpa.'))return;
 for(let i=0;i<it.length;i+=100){const r=await api({a:'state_bulk',items:it.slice(i,i+100)});if(!r||!r.ok)return}
 try{localStorage.removeItem('satset_eo');localStorage.removeItem('satset_stk');localStorage.removeItem('satset_dst')}catch(e){}
 LOC={eo:{},stk:{},dst:{}};await loadRecap();alert('Data terkirim ke server.');
}
const tot=it=>it.reduce((s,i)=>s+(+i.qty||0)*(+i.price||0),0);
const ov=o=>{const e=EO[o.id];return e?{...o,name:e.name,items:e.items,total:tot(e.items),edited:true}:o};
const byDate=(a,b)=>(new Date(a.created_at)-new Date(b.created_at))||(a.id-b.id);
async function loadRecap(){R=null;RO=null;$('#app').innerHTML='Memuat rekap...';await loadState();R=await api(null,'?w=recap&status='+RS);RO=(await allRaw()).sort(byDate);RT=new Date();render()}
function setRS(s){RS=s;ED=null;loadRecap()}
let RT=null,rbusy=false;
async function refreshRecap(silent){
 if(rbusy)return;rbusy=true;
 try{
  if(Object.keys(PT).length)await new Promise(z=>setTimeout(z,900));await loadState();const r=await api(null,'?w=recap&status='+RS),o=(await allRaw()).sort(byDate);
  R=r;RO=o;RT=new Date();if(tab==='r'||tab==='d')render();
 }finally{rbusy=false}
}
/* otomatis sinkron tiap 30 detik, tidak mengganggu kalau sedang edit/mengetik */
setInterval(()=>{if((tab==='r'||tab==='d')&&R&&!ED&&!rbusy&&$('#dl').style.display!=='block'&&$('#dm').style.display!=='flex'&&!/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName))refreshRecap(true)},30000);
function stat(q,k){
 const s=STK[k]||0;
 const d=q-s;return d>0?`<span class=bad>Kurang ${d}</span>`:d===0?'<span class=ok>Aman</span>':`<span class=ok>Aman (lebih ${-d})</span>`;
}
function stk(el){
 const k=el.dataset.n;const v=el.value===''?null:Math.max(0,+el.value||0);if(v===null)delete STK[k];else STK[k]=v;stkSave(k,v);
 el.closest('tr').querySelector('.ks').innerHTML=stat(+el.dataset.q,k);
}
function viewBox(o){
 return `<div class=rb id=rb${o.id} data-p="${esc(pkey(o))}" data-b="${esc(o.items.map(i=>String(i.name).toLowerCase()).join('|'))}"><div class=row><b>${esc(o.name)}</b><span class=sm>${esc([o.prodi,o.gugus].filter(Boolean).join(' / '))} | WA: ${esc(o.phone)} | ${new Date(o.created_at).toLocaleDateString('id-ID')} | ${esc(o.status)}</span>${o.edited?'<span class=sm style="color:#c60">(diedit)</span>':''}<button class="g sx" onclick=edO(${o.id})>Edit</button></div><table class=rt><tr><th>Barang<th class=n>Jml<th class=n>Harga<th class=n>Subtotal</tr>${o.items.map(i=>`<tr data-n="${esc(String(i.name).toLowerCase())}"><td>${esc(i.name)}<td class=n>${+i.qty||0}<td class=n>${(+i.price||0)?rp(i.price):'-'}<td class=n>${(+i.price||0)?rp(i.price*i.qty):'-'}</tr>`).join('')}<tr class=tt><td colspan=3 class=n>Total<td class=n>${rp(o.total)}</tr></table></div>`;
}
function editBox(){
 const rows=ED.items.map((it,i)=>`<tr><td><input value="${esc(it.name)}" oninput="edIt(${i},'name',this.value)"><td><input type=number min=0 value="${it.qty}" oninput="edIt(${i},'qty',this.value)"><td><input type=number min=0 value="${it.price}" oninput="edIt(${i},'price',this.value)"><td class=n id=st${i}>${rp(it.qty*it.price)}<td><button class="r sx" onclick=edDel(${i})>x</button></tr>`).join('');
 return `<div class=rb id=rb${ED.id} style="background:#fffbe6"><div class=row>Nama pembeli <input value="${esc(ED.name)}" style="width:260px" oninput="ED.name=this.value"></div><table class=rt><tr><th>Barang<th>Jml<th>Harga<th class=n>Subtotal<th></tr>${rows}<tr class=tt><td colspan=3 class=n>Total<td class=n id=edtot>${rp(tot(ED.items))}<td></tr></table><div class=row><button class=g onclick=edAdd()>+ Barang</button><button onclick=edSave()>Simpan</button><button class=g onclick=edCancel()>Batal</button>${EO[ED.id]?'<button class=r onclick=edReset()>Kembalikan ke asli</button>':''}</div></div>`;
}
function edO(id){const v=ov(RO.find(x=>x.id==id));ED={id,name:v.name,items:v.items.map(i=>({name:i.name,qty:+i.qty||0,price:+i.price||0}))};render()}
function edIt(i,f,v){const it=ED.items[i];it[f]=f==='name'?v:(+v||0);$('#st'+i).textContent=rp(it.qty*it.price);$('#edtot').textContent=rp(tot(ED.items))}
function refreshBox(){$('#rb'+ED.id).outerHTML=editBox()}
function edAdd(){ED.items.push({name:'',qty:1,price:0});refreshBox()}
function edDel(i){ED.items.splice(i,1);refreshBox()}
async function edSave(){
 const items=ED.items.filter(i=>String(i.name).trim()).map(i=>({name:String(i.name).trim(),qty:+i.qty||0,price:+i.price||0}));
 if(!items.length)return alert('Minimal harus ada 1 barang.');
 await pst('eo',String(ED.id),{name:ED.name.trim()||'(tanpa nama)',items});ED=null;render();
}
function edCancel(){ED=null;render()}
function edReset(){if(!confirm('Kembalikan pesanan ini ke data asli?'))return;pst('eo',String(ED.id),null);ED=null;render()}
function rekapAdmin(){
 const L=RO.map(ov),m={};
 L.forEach(o=>o.items.forEach(i=>{const k=String(i.name),x=m[k]||(m[k]={q:0,r:0});x.q+=+i.qty||0;x.r+=(+i.qty||0)*(+i.price||0)}));
 const bl=Object.entries(m).sort((a,b)=>a[0].localeCompare(b[0])),qB=sm(bl,e=>e[1].q),rB=sm(bl,e=>e[1].r);
 return `<div class=c><b style="font-size:17px">Rekap Admin (bisa diedit)</b><div class=sm>${L.length} pembeli · urut dari beli paling awal sampai terbaru. ${SYNC?'Hasil edit, stok, dan centang distribusi tersimpan di server (dipakai bersama)':'Hasil edit dan stok tersimpan di browser ini saja'} dan ikut ke file download.</div><div class=row style="margin-top:8px"><input placeholder="🔍 Cari orang (nama / gugus / WA)" value="${esc(RQP)}" oninput="RQP=this.value;applyRF()" style="min-width:230px"><input placeholder="🔍 Cari barang (mis. kaos polos L)" value="${esc(RQB)}" oninput="RQB=this.value;applyRF()" style="min-width:230px"></div>${migBtn()}<div id=rsum></div></div>
 <div class=c><b style="color:#1b4fa8">A. Pesanan per Pembeli</b>${L.map(o=>ED&&ED.id==o.id?editBox():viewBox(o)).join('')||'<div class=sm>Belum ada pesanan.</div>'}</div>
 <div class=c><b style="color:#1b4fa8">B. Resume per Barang</b><div class=sm>Isi kolom Stok dengan jumlah yang sudah kamu beli.</div><div style="overflow-x:auto"><table class=rt><tr><th>Barang<th class=n>Dibeli<th>Stok<th>Status<th class=n>Subtotal</tr>${bl.map(([k,x])=>`<tr><td>${esc(k)}<td class=n>${x.q}<td><input type=number min=0 data-n="${esc(k)}" data-q=${x.q} placeholder=0 value="${STK[k]??''}" oninput=stk(this)><td class=ks>${stat(x.q,k)}<td class=n>${x.r?rp(x.r):'-'}</tr>`).join('')}<tr class=tt><td>Total<td class=n>${qB}<td><td><td class=n>${rp(rB)}</tr></table></div></div>`;
}
function recapView(){
 if(!R||!R.products||!RO)return 'Rekap gagal dimuat.';
 const bd=o=>Object.entries(o).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<span class=tg>${esc(k)}: <b>${v}</b></span>`).join('');
 return sbar()+`<div class=c><button class="${RS===''?'':'g'}" onclick="setRS('')">Menunggu + Lunas</button><button class="${RS==='lunas'?'':'g'}" onclick="setRS('lunas')">Lunas saja</button> <button class=g onclick=openPick()>Download rekap...</button> <button onclick="refreshRecap()">🔄 Refresh</button><div class=sm>${R.orders} pesanan dihitung (yang sudah kirim pesanan dianggap sudah bayar). Pesanan batal tidak ikut. Diperbarui ${RT?RT.toLocaleTimeString('id-ID'):'-'}, otomatis cek tiap 30 detik.</div></div>`+rekapAdmin()+
 `<div class=c><b>Ringkasan per produk &amp; varian</b></div>`+
 (R.products.map(p=>`<div class=c><b>${esc(p.name)}</b> &mdash; <b>${p.qty} unit</b> <span class=sm>${rp(p.rev)}</span>${['model','size','color'].map(a=>Object.keys(p[a]).length?`<div class=sm style="margin-top:6px">Per ${LBL[a]}:</div>${bd(p[a])}`:'').join('')}<div class=sm style="margin-top:6px">Per kombinasi:</div>${p.combos.map(c=>`<span class=tg>${esc(c.label)}: <b>${c.qty}</b></span>`).join('')}</div>`).join('')||'<div class=c>Belum ada pesanan.</div>');
}
/* ---------- pencarian rekap: orang & barang ---------- */
let RQP='',RQB='';
const pkey=o=>(o.name+' '+(o.prodi||'')+' '+(o.gugus||'')+' '+o.phone).toLowerCase();
const mt=(t,q)=>q.split(/\s+/).filter(Boolean).every(w=>t.includes(w));
function applyRF(){
 const p=RQP.trim().toLowerCase(),b=RQB.trim().toLowerCase();
 document.querySelectorAll('#app .rb[data-p]').forEach(e=>{
  const ok=(!p||mt(e.dataset.p,p))&&(!b||e.dataset.b.split('|').some(n=>mt(n,b)));
  e.style.display=ok?'':'none';
  e.querySelectorAll('tr[data-n]').forEach(r=>r.classList.toggle('hl',!!b&&mt(r.dataset.n,b)));
 });
 const box=$('#rsum');if(!box)return;
 if(!b){box.innerHTML=p?'<div class=sm style="margin-top:6px">Menampilkan pembeli yang cocok dengan pencarian orang.</div>':'';return}
 const rows=[];
 RO.map(ov).forEach(o=>{if(p&&!mt(pkey(o),p))return;o.items.forEach(i=>{if(mt(String(i.name).toLowerCase(),b))rows.push([o,i])})});
 const u=new Set(rows.map(r=>r[0].id)).size,q=sm(rows,r=>+r[1].qty||0);
 box.innerHTML=`<div style="background:#fffbe6;border-radius:8px;padding:8px;margin-top:8px"><b>Hasil barang "${esc(RQB)}"</b>: ${u} pembeli · <b>${q}</b> unit`+(rows.length?`<div style="overflow-x:auto"><table class=rt><tr><th>Pembeli<th>No. WA<th>Prodi / Gugus<th>Tanggal<th>Barang<th class=n>Jml</tr>${rows.map(([o,i])=>`<tr><td>${esc(o.name)}<td>${esc(o.phone)}<td>${esc([o.prodi,o.gugus].filter(Boolean).join(' / '))}<td>${new Date(o.created_at).toLocaleDateString('id-ID')}<td>${esc(i.name)}<td class=n>${+i.qty||0}</tr>`).join('')}</table></div>`:'<div class=sm>Tidak ada yang cocok.</div>')+'</div>';
}
/* ---------- distribusi barang ---------- */
const dk=(o,i)=>o.id+'|'+i.name;
const dgot=(o,i)=>Math.min(+DST[dk(o,i)]||0,+i.qty||0);
const dfull=(o,i)=>(+i.qty||0)>0&&dgot(o,i)>=(+i.qty||0);
let DH=false,DQ='';
const ordOf=id=>ov(RO.find(r=>r.id==id));
function dBox(o){
 const n=o.items.length,dn=o.items.filter(i=>dfull(o,i)).length;
 const key=esc((o.name+' '+(o.prodi||'')+' '+(o.gugus||'')+' '+o.phone).toLowerCase());
 return `<div class=rb id=db${o.id} data-done=${dn===n?1:0} data-s="${key}"><div class=row><b>${esc(o.name)}</b><span class=sm>${esc([o.prodi,o.gugus].filter(Boolean).join(' / '))} | WA: ${esc(o.phone)} | ${new Date(o.created_at).toLocaleDateString('id-ID')}</span><span class=sm>${dn}/${n} barang selesai</span>${dn===n?'<span class=ok>✔ Selesai</span>':''}</div><table class=rt><tr><th>Barang<th class=n>Jml<th class=n>Harga<th class=n>Subtotal<th>Distribusi</tr>${o.items.map((i,x)=>{const g=dgot(o,i),f=dfull(o,i),h=+i.price||0;return `<tr class="${f?'dn':''}"><td>${esc(i.name)}<td class=n>${+i.qty||0}<td class=n>${h?rp(h):'-'}<td class=n>${h?rp(h*i.qty):'-'}<td><label style="display:flex;gap:6px;align-items:center;margin:0;cursor:pointer"><input type=checkbox ${f?'checked':''} style="width:20px;height:20px;margin:0" onclick="event.preventDefault();dClick(${o.id},${x})">${f?'Selesai':g?`<span class=wr>${g}/${+i.qty}</span>`:''}</label></tr>`}).join('')}</table></div>`;
}
function dResume(){
 const m={};
 RO.map(ov).forEach(o=>o.items.forEach(i=>{const k=String(i.name),x=m[k]||(m[k]={q:0,d:0});x.q+=+i.qty||0;x.d+=dgot(o,i)}));
 const bl=Object.entries(m).sort((a,b)=>a[0].localeCompare(b[0])),tq=sm(bl,e=>e[1].q),td=sm(bl,e=>e[1].d);
 return `<div class=sm style="margin:4px 0"><b>${td}</b> dari <b>${tq}</b> unit sudah terdistribusi · belum: <b class=wr>${tq-td}</b> unit</div><div style="overflow-x:auto"><table class=rt><tr><th>Barang<th class=n>Dibutuhkan<th class=n>Tersedia (stok)<th class=n>Terdistribusi<th>Belum distribusi</tr>${bl.map(([k,x])=>{const s=STK[k]||0,b=x.q-x.d;return `<tr class="${b===0?'dn':''}"><td>${esc(k)}<td class=n>${x.q}<td class=n>${s}<td class=n>${x.d}<td>${b===0?'<span class=ok>Selesai</span>':`<span class=wr>Belum ${b}</span>`+(x.q>s?` <span class=bad style="font-size:12px">· stok kurang ${x.q-s}</span>`:'')}</tr>`}).join('')}<tr class=tt><td>Total<td class=n>${tq}<td><td class=n>${td}<td>Belum ${tq-td}</tr></table></div>`;
}
function distView(){
 if(!RO)return 'Memuat...';
 const L=RO.map(ov);
 return sbar()+`<div class=c><div class=row><button onclick="refreshRecap()">🔄 Refresh</button><input id=dq placeholder="🔍 Cari nama / gugus / WA" value="${esc(DQ)}" oninput="DQ=this.value;applyDF()" style="min-width:220px"><label class=row style="gap:4px;margin:0"><input type=checkbox ${DH?'checked':''} onchange="DH=this.checked;applyDF()"> Sembunyikan yang sudah selesai</label></div><div class=sm>${L.length} pembeli · urut dari beli paling awal · diperbarui ${RT?RT.toLocaleTimeString('id-ID'):'-'}. ${SYNC?'Tersimpan di server (dipakai bersama).':'Tersimpan di browser ini saja.'}</div>${migBtn()}</div>
 <div class=c><b style="color:#118a3e;font-size:17px">Distribusi per Pembeli</b>${L.map(o=>dBox(o)).join('')||'<div class=sm>Belum ada pesanan.</div>'}</div>
 <div class=c><b style="color:#118a3e;font-size:17px">Resume Barang</b><div id=dres>${dResume()}</div></div>`;
}
function applyDF(){
 const q=DQ.trim().toLowerCase();
 document.querySelectorAll('#app .rb[data-s]').forEach(e=>{e.style.display=((!q||e.dataset.s.includes(q))&&!(DH&&e.dataset.done==='1'))?'':'none'});
}
function refreshD(id){
 const e=$('#db'+id);if(e)e.outerHTML=dBox(ordOf(id));
 const r=$('#dres');if(r)r.innerHTML=dResume();
}
function dClick(id,x){
 const o=ordOf(id),i=o.items[x];
 if(dfull(o,i)){
  if(!confirm('Yakin membatalkan distribusi "'+i.name+'" untuk '+o.name+'?'))return;
  pst('dst',dk(o,i),null);refreshD(id);return;
 }
 const q=+i.qty||0,g=dgot(o,i);
 $('#dm').style.display='flex';
 $('#dm').innerHTML=`<div class=box2><b>Distribusi barang</b><div class=sm style="margin:4px 0">${esc(o.name)} · ${esc(i.name)}</div><div>Dibeli: <b>${q}</b>. Berapa yang sudah didistribusikan?</div><input type=number id=dmq min=0 max=${q} value="${g||q}" style="width:120px;font-size:18px" onkeydown="if(event.key==='Enter')dmSave(${id},${x})"><div class=sm>Kalau semua, biarkan angka ini lalu Simpan.</div><div class=row><button onclick="dmSave(${id},${x})">Simpan</button><button class=g onclick=dmX()>Batal</button></div></div>`;
 setTimeout(()=>{const e=$('#dmq');if(e){e.focus();e.select()}},30);
}
function dmX(){$('#dm').style.display='none';$('#dm').innerHTML=''}
function dmSave(id,x){
 const o=ordOf(id),i=o.items[x],q=+i.qty||0;let v=Math.floor(+$('#dmq').value);
 if(isNaN(v)||v<0)v=0;if(v>q)v=q;
 pst('dst',dk(o,i),v>0?v:null);dmX();refreshD(id);
}
/* ---------- download rekap (popup pilihan) ---------- */
async function allRaw(){
 let L=[],b='';
 for(;;){const r=await api(null,'?w=orders&status='+RS+b);L=L.concat(r.orders);if(r.orders.length<40)break;b='&before='+r.orders[r.orders.length-1].id}
 return L.filter(o=>o.status!=='batal');
}
async function allOrders(){return (await allRaw()).map(ov)}
let X=null;
const day=o=>{const d=new Date(o.created_at);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
async function openDl(){
 $('#dl').style.display='block';$('#dl').innerHTML='<div class=box>Memuat pesanan...</div>';
 const L=(await allOrders()).sort(byDate);
 X={all:L,vis:L,sel:new Set(L.map(o=>o.id)),d1:'',d2:'',a:0,b:Math.max(0,L.length-1)};dlr();
}
function dlx(){$('#dl').style.display='none'}
function dlf(){
 X.d1=$('#d1').value;X.d2=$('#d2').value;X.a=+$('#fa').value;X.b=+$('#fb').value;
 const lo=Math.min(X.a,X.b),hi=Math.max(X.a,X.b);
 X.vis=X.all.filter((o,i)=>i>=lo&&i<=hi&&(!X.d1||day(o)>=X.d1)&&(!X.d2||day(o)<=X.d2));
 X.sel=new Set(X.vis.map(o=>o.id));dlr();
}
function dlt(id){X.sel.has(id)?X.sel.delete(id):X.sel.add(id);dlr()}
function dlAll(on){X.sel=on?new Set(X.vis.map(o=>o.id)):new Set();dlr()}
const picked=()=>X.vis.filter(o=>X.sel.has(o.id));
const sm=(a,f)=>a.reduce((s,x)=>s+f(x),0);
function dlr(){
 const P=picked(),opt=v=>X.all.map((o,i)=>`<option value=${i} ${i==v?'selected':''}>${esc(o.name)}${o.gugus?' ('+esc(o.gugus)+')':''}</option>`).join('');
 $('#dl').innerHTML=`<div class=box><b style="font-size:17px">Rekap Admin: pilih isi rekap</b>
 <div class=row style="margin-top:8px">Dari pembeli <select id=fa onchange=dlf()>${opt(X.a)}</select> sampai <select id=fb onchange=dlf()>${opt(X.b)}</select></div>
 <div class=row>Tanggal beli <input type=date id=d1 value="${X.d1}" onchange=dlf()> s/d <input type=date id=d2 value="${X.d2}" onchange=dlf()></div>
 <div class=row><button class=g onclick=dlAll(true)>Pilih semua</button><button class=g onclick=dlAll(false)>Kosongkan</button><span class=sm>Klik kotak untuk centang/batal per pembeli</span></div>
 <div class=bx>${X.vis.map(o=>`<label class="${X.sel.has(o.id)?'on':''}" onclick="dlt(${o.id})"><b>${X.sel.has(o.id)?'☑':'☐'} ${esc(o.name)}</b><br>${esc(o.gugus||o.prodi||'')} · ${esc(o.phone)}<br><span class=sm>${new Date(o.created_at).toLocaleDateString('id-ID')} · ${sm(o.items,i=>+i.qty||0)} unit</span><br><b>${rp(o.total)}</b></label>`).join('')||'<div class=sm>Tidak ada pesanan di rentang ini.</div>'}</div>
 <div class=c style="background:#eef"><b>${P.length}</b> pembeli · <b>${sm(P,o=>sm(o.items,i=>+i.qty||0))}</b> unit · <b>${rp(sm(P,o=>+o.total||0))}</b></div>
 <div class=row><button onclick=dlPDF() ${P.length?'':'disabled'}>Download PDF</button><button class=g onclick=dlCSV() ${P.length?'':'disabled'}>Download Excel (CSV)</button><button class=g onclick=openPick()>Kembali</button><button class=r onclick=dlx()>Tutup</button></div></div>`;
}
function dlCSV(){
 const q=v=>'"'+String(v??'').replace(/"/g,'""')+'"',rows=[['Nama','Prodi','Gugus','WA','Tanggal','Barang','Jumlah','Harga','Subtotal']];
 picked().forEach(o=>o.items.forEach(i=>rows.push([o.name,o.prodi,o.gugus,o.phone,day(o),i.name,i.qty,i.price||'',(i.price||0)*i.qty])));
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+rows.map(r=>r.map(q).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'}));a.download='rekap-admin-satset.csv';a.click();
}
function dlPDF(){
 if(!(window.jspdf&&window.jspdf.jsPDF))return alert('Library PDF belum termuat. Cek koneksi internet lalu muat ulang halaman.');
 const os=picked(),m={};
 os.forEach(o=>o.items.forEach(i=>{const x=m[i.name]||(m[i.name]={q:0,r:0});x.q+=+i.qty||0;x.r+=(+i.price||0)*(+i.qty||0)}));
 const bl=Object.entries(m).sort((a,b)=>a[0].localeCompare(b[0]));
 const qA=sm(os,o=>sm(o.items,i=>+i.qty||0)),qB=sm(bl,e=>e[1].q),rA=sm(os,o=>+o.total||0),rB=sm(bl,e=>e[1].r);
 const ok=(a,b)=>a===b?'SESUAI':'SELISIH '+Math.abs(a-b).toLocaleString('id-ID');
 const per=(X.d1||X.d2)?(X.d1||'...')+' s/d '+(X.d2||'...'):'Semua tanggal';
 const doc=new window.jspdf.jsPDF({unit:'pt',format:'a4'}),M=36,W=doc.internal.pageSize.getWidth(),PH=doc.internal.pageSize.getHeight(),BLUE=[27,79,168];
 const H=(t,y)=>{doc.setFont('helvetica','bold');doc.setFontSize(13);doc.setTextColor(...BLUE);doc.text(t,M,y);doc.setTextColor(0)};
 let y=48;
 doc.setFont('helvetica','bold');doc.setFontSize(17);doc.setTextColor(...BLUE);doc.text('Rekap Admin SATSET',M,y);y+=16;
 doc.setFont('helvetica','normal');doc.setFontSize(10);doc.setTextColor(0);
 doc.text(os.length+' pembeli | '+per+' | '+new Date().toLocaleString('id-ID'),M,y);y+=26;
 H('A. Pesanan per Pembeli',y);y+=12;
 os.forEach(o=>{
  const info=doc.splitTextToSize(String(o.name)+(o.prodi?' | '+o.prodi:'')+(o.gugus?' / '+o.gugus:'')+' | WA: '+o.phone+' | '+new Date(o.created_at).toLocaleDateString('id-ID')+' | '+o.status,W-2*M);
  if(y+info.length*12+60>PH-40){doc.addPage();y=48}
  doc.setFont('helvetica','bold');doc.setFontSize(10);doc.setTextColor(0);doc.text(info,M,y+10);y+=info.length*12+4;
  doc.autoTable({startY:y,margin:{left:M,right:M},theme:'grid',styles:{fontSize:9,cellPadding:3},headStyles:{fillColor:BLUE,textColor:255},footStyles:{fillColor:[238,238,255],textColor:0},
   columnStyles:{1:{cellWidth:40,halign:'right'},2:{cellWidth:75,halign:'right'},3:{cellWidth:85,halign:'right'}},
   head:[['Barang','Jml','Harga','Subtotal']],
   body:o.items.map(i=>{const h=+i.price||0;return [String(i.name),String(+i.qty||0),h?rp(h):'-',h?rp(h*i.qty):'-']}),
   foot:[[{content:'Total',colSpan:3,styles:{halign:'right'}},{content:rp(o.total),styles:{halign:'right'}}]]});
  y=doc.lastAutoTable.finalY+16;
 });
 doc.addPage();y=48;
 H('B. Resume per Barang',y);
 doc.autoTable({startY:y+8,margin:{left:M,right:M},theme:'grid',styles:{fontSize:9,cellPadding:3},headStyles:{fillColor:BLUE,textColor:255},footStyles:{fillColor:[238,238,255],textColor:0},
  columnStyles:{1:{cellWidth:50,halign:'right'},2:{cellWidth:50,halign:'right'},3:{cellWidth:85},4:{cellWidth:90,halign:'right'}},
  head:[['Barang','Jumlah','Stok','Status','Subtotal']],
  body:bl.map(([n,x])=>{const s=STK[n]||0;return [n,String(x.q),String(s),(x.q>s?'KURANG '+(x.q-s):'AMAN'),x.r?rp(x.r):'-']}),
  foot:[['Total',String(qB),'','',rp(rB)]],
  didParseCell:d=>{if(d.section==='body'&&d.column.index===3&&d.cell.raw!=='-'){d.cell.styles.fontStyle='bold';d.cell.styles.textColor=String(d.cell.raw).startsWith('KURANG')?[221,51,51]:[17,138,62]}}});
 y=doc.lastAutoTable.finalY+24;
 if(y>PH-140){doc.addPage();y=48}
 H('C. Crosscheck',y);
 doc.autoTable({startY:y+8,margin:{left:M,right:M},theme:'grid',styles:{fontSize:9,cellPadding:3},headStyles:{fillColor:BLUE,textColor:255},
  head:[['Cek','A. Per pembeli','B. Per barang','Hasil']],
  body:[['Total unit',String(qA),String(qB),ok(qA,qB)],['Total rupiah',rp(rA),rp(rB),ok(rA,rB)]],
  didParseCell:d=>{if(d.section==='body'&&d.column.index===3){d.cell.styles.fontStyle='bold';d.cell.styles.textColor=d.cell.raw==='SESUAI'?[17,138,62]:[221,51,51]}}});
 doc.save('rekap-admin-satset.pdf');
}
/* ---------- pilihan rekap: admin / pembeli ---------- */
function openPick(){
 $('#dl').style.display='block';
 $('#dl').innerHTML=`<div class=box><b style="font-size:17px">Download rekap untuk siapa? (v3)</b>
 <div class=c style="background:#eef"><b>Rekap Admin</b><div class=sm>Pesanan per pembeli, resume per barang, dan crosscheck. Ada filter pembeli dan tanggal.</div><button onclick=openDl()>Buka rekap admin</button></div>
 <div class=c style="background:#eef"><b>Rekap Pembeli</b><div class=sm>Nama pembeli dan barang yang dibeli. Semua pembeli, langsung download tanpa filter.</div><div class=row><button onclick=pbPDF()>Download PDF</button><button class=g onclick=pbCSV()>Download Excel (CSV)</button></div></div>
 <button class=r onclick=dlx()>Tutup</button></div>`;
}
async function pbData(){
 const t=$('#dl .box');t.insertAdjacentHTML('beforeend','<div class=sm id=pbm>Memuat pesanan...</div>');
 const L=(await allOrders()).sort(byDate);
 const m=$('#pbm');if(m)m.remove();return L;
}
async function pbCSV(){
 const L=await pbData();
 const q=v=>'"'+String(v??'').replace(/"/g,'""')+'"',rows=[['Nama','Prodi','Gugus','Barang','Jumlah','Harga']];
 L.forEach(o=>o.items.forEach(i=>rows.push([o.name,o.prodi,o.gugus,i.name,i.qty,i.price||''])));
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+rows.map(r=>r.map(q).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'}));a.download='rekap-pembeli-satset.csv';a.click();
}
async function pbPDF(){
 if(!(window.jspdf&&window.jspdf.jsPDF))return alert('Library PDF belum termuat. Cek koneksi internet lalu muat ulang halaman.');
 const L=await pbData(),doc=new window.jspdf.jsPDF({unit:'pt',format:'a4'}),M=36,W=doc.internal.pageSize.getWidth(),PH=doc.internal.pageSize.getHeight(),BLUE=[27,79,168];
 let y=48;
 doc.setFont('helvetica','bold');doc.setFontSize(17);doc.setTextColor(...BLUE);doc.text('Rekap Pembeli SATSET',M,y);y+=26;
 L.forEach(o=>{
  const info=doc.splitTextToSize(String(o.name)+(o.prodi?' | '+o.prodi:'')+(o.gugus?' / '+o.gugus:''),W-2*M);
  if(y+info.length*12+60>PH-40){doc.addPage();y=48}
  doc.setFont('helvetica','bold');doc.setFontSize(11);doc.setTextColor(0);doc.text(info,M,y+10);y+=info.length*12+4;
  doc.autoTable({startY:y,margin:{left:M,right:M},theme:'grid',styles:{fontSize:9,cellPadding:3},headStyles:{fillColor:BLUE,textColor:255},
   columnStyles:{1:{cellWidth:40,halign:'right'},2:{cellWidth:85,halign:'right'}},
   head:[['Barang','Jml','Harga']],
   body:o.items.map(i=>{const h=+i.price||0;return [String(i.name),String(+i.qty||0),h?rp(h):'-']})});
  y=doc.lastAutoTable.finalY+16;
 });
 doc.save('rekap-pembeli-satset.pdf');
}
load();
</script>
