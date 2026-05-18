DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;

CREATE POLICY "Public can create orders"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Public can create order items"
ON public.order_items
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

NOTIFY pgrst, 'reload schema';