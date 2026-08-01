"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function addToCart(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const productId = formData.get("productId") as string;
  let quantity = Number(formData.get("quantity") ?? 1);

  if (!Number.isFinite(quantity) || quantity < 1) quantity = 1;

  const { data: product } = await supabase
    .from("products")
    .select("stock")
    .eq("id", productId)
    .single();

  if (!product) {
    redirect("/shop?error=" + encodeURIComponent("That product no longer exists."));
  }

  // Upsert: if this product is already in the cart, bump the quantity
  // instead of creating a duplicate row (matches the unique constraint
  // on (user_id, product_id) from the schema).
  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .single();

  const currentQty = existing?.quantity ?? 0;
  // Clamp server-side to actual stock — the form's max="" is a UX hint
  // only and doesn't stop a request built without going through the form.
  const finalQty = Math.min(currentQty + quantity, product.stock);

  if (finalQty <= 0) {
    redirect(`/shop?error=${encodeURIComponent("That product is out of stock.")}`);
  }

  if (existing) {
    await supabase
      .from("cart_items")
      .update({ quantity: finalQty })
      .eq("id", existing.id);
  } else {
    await supabase
      .from("cart_items")
      .insert({ user_id: user.id, product_id: productId, quantity: finalQty });
  }

  revalidatePath("/cart");
  redirect("/cart");
}

export async function updateCartItem(formData: FormData) {
  const supabase = await createClient();
  const itemId = formData.get("itemId") as string;
  const requestedQty = Number(formData.get("quantity"));

  if (!Number.isFinite(requestedQty) || requestedQty <= 0) {
    await supabase.from("cart_items").delete().eq("id", itemId);
    revalidatePath("/cart");
    return;
  }

  // Clamp to actual current stock, same reasoning as addToCart above.
  const { data: item } = await supabase
    .from("cart_items")
    .select("product:products(stock)")
    .eq("id", itemId)
    .single();

  const stock = (item as unknown as { product: { stock: number } } | null)
    ?.product?.stock;
  const quantity = stock != null ? Math.min(requestedQty, stock) : requestedQty;

  await supabase.from("cart_items").update({ quantity }).eq("id", itemId);

  revalidatePath("/cart");
}

export async function removeFromCart(formData: FormData) {
  const supabase = await createClient();
  const itemId = formData.get("itemId") as string;

  await supabase.from("cart_items").delete().eq("id", itemId);
  revalidatePath("/cart");
}
