-- Jalankan SEKALI di Supabase > SQL Editor (aman diulang)
alter table products add column if not exists image_v bigint default 0;
update products set image_v=1 where image is not null and coalesce(image_v,0)=0;

create index if not exists variants_product_idx on variants(product_id);
create index if not exists products_cluster_idx on products(cluster_id);
create index if not exists orders_created_idx on orders(id desc);

-- kurangi stok secara atomik (anti balapan)
create or replace function dec_stock(vid bigint, q int) returns void
language sql as $$ update variants set stock=greatest(0,stock-q) where id=vid $$;
