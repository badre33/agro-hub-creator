import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Charge l'état stock de tous les produits depuis Supabase.
 * Retourne un Set des product_id en RUPTURE (out of stock).
 */
export const useStockOverrides = () => {
  const [outOfStock, setOutOfStock] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    const { data } = await supabase
      .from("product_stock_overrides")
      .select("product_id, in_stock")
      .eq("in_stock", false);
    if (data) {
      setOutOfStock(new Set(data.map((r) => r.product_id)));
    }
    setLoading(false);
  };

  useEffect(() => {
    reload();
  }, []);

  return { outOfStock, loading, reload };
};
