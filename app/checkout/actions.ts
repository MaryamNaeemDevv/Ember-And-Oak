"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

import { effectivePrice } from "@/lib/pricing";

export async function placeOrder(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: items } = await supabase
    .from("cart_items")
    .select("id, quantity, product:products(*)")
    .eq("user_id", user.id);

  const cartItems = (items ?? []) as unknown as {
    id: string;
    quantity: number;
    product: Product;
  }[];

  if (cartItems.length === 0) {
    redirect("/cart");
  }

  // Re-check stock at checkout time, not just at add-to-cart time — stock
  // may have changed (another customer bought it, admin adjusted it) since
  // the item was added to this cart.
  const outOfStock = cartItems.find(
    (item) => item.quantity > item.product.stock
  );
  if (outOfStock) {
    redirect(
      `/checkout?error=${encodeURIComponent(
        `${outOfStock.product.name} only has ${outOfStock.product.stock} left in stock. Please update your cart.`
      )}`
    );
  }

  const name = (formData.get("name") as string)?.trim();
  const line1 = (formData.get("line1") as string)?.trim();
  const city = (formData.get("city") as string)?.trim();
  const postalCode = (formData.get("postalCode") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();

  const fieldErrors: string[] = [];
  if (!name || name.length < 2) fieldErrors.push("Enter your full name.");
  if (!line1 || line1.length < 5) fieldErrors.push("Enter a valid address.");
  if (!city) fieldErrors.push("Enter your city.");
  if (!postalCode || postalCode.length < 3) {
    fieldErrors.push("Enter a valid postal code.");
  }
  if (!phone || phone.length < 7) fieldErrors.push("Enter a valid phone number.");

  if (fieldErrors.length > 0) {
    redirect(`/checkout?error=${encodeURIComponent(fieldErrors.join(" "))}`);
  }

  const total = cartItems.reduce(
    (sum, item) => sum + effectivePrice(item.product) * item.quantity,
    0
  );

  const shippingAddress = {
    name,
    line1,
    city,
    postal_code: postalCode,
    phone,
  };

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      total,
      shipping_address: shippingAddress,
      status: "pending",
    })
    .select()
    .single();

  if (orderError || !order) {
    redirect("/checkout?error=Could not place order, please try again");
  }

  const orderItems = cartItems.map((item) => ({
    order_id: order.id,
    product_id: item.product.id,
    quantity: item.quantity,
    price_at_purchase: effectivePrice(item.product),
  }));

  await supabase.from("order_items").insert(orderItems);

  // Decrement stock for each product ordered. Done as individual updates
  // rather than a single bulk query since each product decrements by a
  // different quantity.
  for (const item of cartItems) {
    await supabase
      .from("products")
      .update({ stock: Math.max(0, item.product.stock - item.quantity) })
      .eq("id", item.product.id);
  }

  await supabase.from("cart_items").delete().eq("user_id", user.id);

  redirect(`/orders/${order.id}`);
}
