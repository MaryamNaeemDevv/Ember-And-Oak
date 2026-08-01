import { createClient } from "@/lib/supabase/server";
import { createProduct } from "@/app/admin/products/actions";
import type { Category } from "@/lib/types";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  return (
    <div>
      <span className="panel__eyebrow">PRODUCTS</span>
      <h1>New product</h1>

      {error && <p className="auth-form__error">{error}</p>}

      <form action={createProduct} className="admin-form">
        <label>
          Name
          <input type="text" name="name" required />
        </label>
        <label>
          Description
          <textarea name="description" rows={4} />
        </label>
        <label>
          Price (USD)
          <input type="number" name="price" step="0.01" min={0} required />
        </label>
        <label>
          Sale price (USD, optional — leave blank if not on sale)
          <input type="number" name="salePrice" step="0.01" min={0} />
        </label>
        <label>
          Stock
          <input type="number" name="stock" min={0} required />
        </label>
        <label>
          Category
          <select name="categoryId">
            <option value="">— none —</option>
            {(categories as Category[] | null)?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Image URLs (comma-separated)
          <input type="text" name="imageUrls" placeholder="https://..." />
        </label>
        <label className="admin-form__checkbox">
          <input type="checkbox" name="isActive" defaultChecked />
          Active (visible in shop)
        </label>

        <button type="submit" className="cta">
          Create product
        </button>
      </form>
    </div>
  );
}
