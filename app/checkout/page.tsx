import Nav from "@/components/Nav";
import { createClient } from "@/lib/supabase/server";
import { placeOrder } from "@/app/checkout/actions";
import { effectivePrice } from "@/lib/pricing";
import { redirect } from "next/navigation";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: items } = await supabase
    .from("cart_items")
    .select("id, quantity, product:products(price, sale_price)")
    .eq("user_id", user.id);

  const cartItems = (items ?? []) as unknown as {
    id: string;
    quantity: number;
    product: { price: number; sale_price: number | null };
  }[];

  const subtotal = cartItems.reduce(
    (sum, item) => sum + effectivePrice(item.product) * item.quantity,
    0
  );

  if (cartItems.length === 0) redirect("/cart");

  return (
    <>
      <Nav />
      <div className="auth-page">
        <form className="auth-form" action={placeOrder}>
          <span className="panel__eyebrow">CHECKOUT</span>
          <h2>Shipping details</h2>

          {error && <p className="auth-form__error">{error}</p>}

          <label>
            Full name
            <input type="text" name="name" required />
          </label>
          <label>
            Address
            <input type="text" name="line1" required />
          </label>
          <label>
            City
            <input type="text" name="city" required />
          </label>
          <label>
            Postal code
            <input type="text" name="postalCode" required />
          </label>
          <label>
            Phone
            <input type="tel" name="phone" required />
          </label>

          <div className="cart-summary">
            <span>Total</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <button className="cta" type="submit">
            Place order
          </button>
        </form>
      </div>
    </>
  );
}
