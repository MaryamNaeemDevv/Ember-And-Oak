"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Shared validation for create/update — returns error strings, empty array
// means valid. Centralized so both actions enforce the same rules rather
// than relying on the <input min="0"> etc, which only stops the normal
// form UI, not a directly-submitted request.
function validateProductFields({
  name,
  price,
  salePrice,
  stock,
}: {
  name: string;
  price: number;
  salePrice: number | null;
  stock: number;
}) {
  const errors: string[] = [];
  if (!name || name.trim().length < 2) {
    errors.push("Product name must be at least 2 characters.");
  }
  if (!Number.isFinite(price) || price < 0) {
    errors.push("Price must be a positive number.");
  }
  if (!Number.isInteger(stock) || stock < 0) {
    errors.push("Stock must be a non-negative whole number.");
  }
  if (salePrice != null) {
    if (!Number.isFinite(salePrice) || salePrice < 0) {
      errors.push("Sale price must be a positive number.");
    } else if (salePrice >= price) {
      errors.push("Sale price must be lower than the regular price.");
    }
  }
  return errors;
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const imageUrls = (formData.get("imageUrls") as string)
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean);

  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));
  const salePriceRaw = formData.get("salePrice") as string;
  const salePrice = salePriceRaw ? Number(salePriceRaw) : null;

  const errors = validateProductFields({ name, price, salePrice, stock });
  if (errors.length > 0) {
    redirect(`/admin/products/new?error=${encodeURIComponent(errors.join(" "))}`);
  }

  const { error } = await supabase.from("products").insert({
    name,
    slug: slugify(name),
    description: formData.get("description") as string,
    price,
    sale_price: salePrice,
    stock,
    category_id: (formData.get("categoryId") as string) || null,
    image_urls: imageUrls,
    is_active: formData.get("isActive") === "on",
  });

  if (error) {
    const message = error.message.includes("duplicate")
      ? "A product with a similar name already exists (slug conflict)."
      : error.message;
    redirect(`/admin/products/new?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect("/admin/products");
}

export async function updateProduct(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const imageUrls = (formData.get("imageUrls") as string)
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean);

  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));
  const salePriceRaw = formData.get("salePrice") as string;
  const salePrice = salePriceRaw ? Number(salePriceRaw) : null;

  const errors = validateProductFields({ name, price, salePrice, stock });
  if (errors.length > 0) {
    redirect(
      `/admin/products/${id}/edit?error=${encodeURIComponent(errors.join(" "))}`
    );
  }

  const { error } = await supabase
    .from("products")
    .update({
      name,
      slug: slugify(name),
      description: formData.get("description") as string,
      price,
      sale_price: salePrice,
      stock,
      category_id: (formData.get("categoryId") as string) || null,
      image_urls: imageUrls,
      is_active: formData.get("isActive") === "on",
    })
    .eq("id", id);

  if (error) {
    redirect(
      `/admin/products/${id}/edit?error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  await supabase.from("products").delete().eq("id", id);

  revalidatePath("/admin/products");
  revalidatePath("/shop");
}
