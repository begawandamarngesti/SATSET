-- Jalankan SEKALI di Supabase > SQL Editor, SETELAH migration.sql (aman diulang)
alter table products add column if not exists size_img text;
alter table products add column if not exists size_v bigint default 0;
alter table orders add column if not exists sheet_ok boolean default false;
create table if not exists settings(key text primary key, value text);
alter table settings enable row level security;

create or replace function add_stock(vid bigint, q int) returns void
language sql as $$ update variants set stock=stock+q where id=vid $$;

-- buat pesanan + kunci & kurangi stok dalam SATU transaksi (anti stok kejual dobel)
create or replace function create_order(p_name text,p_phone text,p_items jsonb,p_proof text)
returns table(order_id bigint, order_total int, order_items jsonb)
language plpgsql as $$
declare e jsonb; v record; q int; tot int:=0; lines jsonb:='[]'::jsonb; oid bigint;
begin
 for e in select x.value from jsonb_array_elements(p_items) as x order by (x.value->>'variant_id')::bigint loop
  q:=(e->>'qty')::int;
  select vr.id,vr.model,vr.size,vr.color,vr.price,vr.stock,pr.name as pname into v
   from variants vr join products pr on pr.id=vr.product_id
   where vr.id=(e->>'variant_id')::bigint and vr.active and pr.active
   for update of vr;
  if not found then raise exception 'STOK:ada produk yang sudah tidak tersedia'; end if;
  if q is null or q<=0 or v.stock<q then
   raise exception 'STOK:%', concat_ws(' ',v.pname,v.model,v.size,v.color);
  end if;
  update variants set stock=stock-q where id=v.id;
  tot:=tot+v.price*q;
  lines:=lines||jsonb_build_object('variant_id',v.id,'name',concat_ws(' ',v.pname,v.model,v.size,v.color),
    'pname',v.pname,'model',v.model,'size',v.size,'color',v.color,'qty',q,'price',v.price);
 end loop;
 if jsonb_array_length(lines)=0 then raise exception 'STOK:keranjang kosong'; end if;
 insert into orders(name,phone,items,total,proof) values(p_name,p_phone,lines,tot,p_proof) returning orders.id into oid;
 return query select oid,tot,lines;
end $$;
