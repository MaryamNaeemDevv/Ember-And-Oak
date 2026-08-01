import Nav from "@/components/Nav";
import ProductCard from "@/components/ProductCard";
import { createClient } from "@/lib/supabase/server";
import type { Category, Product } from "@/lib/types";

async function getTopSellers(
  supabase: Awaited<ReturnType<typeof createClient>>,
  limit: number
) {
  // Real top-sellers, computed from actual order history rather than a
  // manually-flagged badge: sum quantity sold per product, take the top N,
  // then fetch those products' current details.
  const { data: orderItems } = await supabase
    .from("order_items")
    .select("product_id, quantity");

  const totals = new Map<string, number>();
  for (const item of orderItems ?? []) {
    if (!item.product_id) continue;
    totals.set(
      item.product_id,
      (totals.get(item.product_id) ?? 0) + item.quantity
    );
  }

  const topIds = [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);

  if (topIds.length === 0) return [];

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .in("id", topIds)
    .eq("is_active", true);

  // Preserve the sales-rank order rather than whatever order Supabase returns.
  const byId = new Map((products as Product[] | null)?.map((p) => [p.id, p]));
  return topIds.map((id) => byId.get(id)).filter(Boolean) as Product[];
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; error?: string }>;
}) {
  const { category, error } = await searchParams;
  const supabase = await createClient();

  const { data: categoriesData } = await supabase
    .from("categories")
    .select("*")
    .order("name");
  const categories = (categoriesData ?? []) as Category[];

  const activeCategory = categories.find((c) => c.slug === category);

  return (
    <>
      <Nav />
      <div className="shop-page">
        <h1>Shop</h1>

        {error && <p className="auth-form__error">{error}</p>}

        {/* Category tile grid — always visible, doubles as the way to switch categories */}
        <div className="category-grid">
          <a
            href="/shop"
            className={`category-tile ${!category ? "category-tile--active" : ""}`}
          >
            <div className="category-tile__image category-tile__image--all">
              <span>ALL</span>
            </div>
            <span className="category-tile__label">All Products</span>
          </a>

          {categories.map((c) => (
            <a
              key={c.id}
              href={`/shop?category=${c.slug}`}
              className={`category-tile ${
                category === c.slug ? "category-tile--active" : ""
              }`}
            >
              <div className="category-tile__image">
                {c.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.image_url} alt={c.name} />
                )}
              </div>
              <span className="category-tile__label">{c.name}</span>
            </a>
          ))}
        </div>

        {category ? (
          <FilteredListing supabase={supabase} categoryId={activeCategory?.id} />
        ) : (
          <CuratedSections supabase={supabase} />
        )}
      </div>
    </>
  );
}

async function FilteredListing({
  supabase,
  categoryId,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  categoryId?: string;
}) {
  let query = supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data: products } = await query;

  return (
    <div className="product-grid">
      {(products as Product[] | null)?.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
      {products?.length === 0 && (
        <p className="shop-empty">No products in this category yet.</p>
      )}
    </div>
  );
}

async function CuratedSections({
  supabase,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>;
}) {
  const [{ data: newArrivals }, { data: onSale }, topSellers] =
    await Promise.all([
      supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .not("sale_price", "is", null)
        .limit(8),
      getTopSellers(supabase, 8),
    ]);

  return (
    <>
      <ShopSection title="New Arrivals" products={newArrivals as Product[]} />
      <ShopSection title="On Sale" products={onSale as Product[]} />
      <ShopSection title="Top Sellers" products={topSellers} />
    </>
  );
}

function ShopSection({
  title,
  products,
}: {
  title: string;
  products: Product[] | null;
}) {
  if (!products || products.length === 0) return null;

  return (
    <section className="shop-section">
      <span className="panel__eyebrow">{title.toUpperCase()}</span>
      <div className="product-grid">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
