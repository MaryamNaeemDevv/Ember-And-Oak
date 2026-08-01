import Nav from "@/components/Nav";
import { createClient } from "@/lib/supabase/server";
import { updateCartItem, removeFromCart } from "@/app/cart/actions";
import { effectivePrice } from "@/lib/pricing";
import type { Product } from "@/lib/types";
import { redirect } from "next/navigation";

export default async function CartPage() {
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

  const subtotal = cartItems.reduce(
    (sum, item) => sum + effectivePrice(item.product) * item.quantity,
    0
  );

  return (
    <>
      <Nav />
      <div className="cart-page">
        <h1>Your Cart</h1>

        {cartItems.length === 0 ? (
          <p className="shop-empty">
            Your cart is empty. <a href="/shop">Browse the shop →</a>
          </p>
        ) : (
          <>
            <div className="cart-list">
              {cartItems.map((item) => (
                <div className="cart-row" key={item.id}>
                  <div className="cart-row__image">
                    {item.product.image_urls[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.product.image_urls[0]}
                        alt={item.product.name}
                      />
                    )}
                  </div>
                  <div className="cart-row__info">
                    <span className="cart-row__name">
                      {item.product.name}
                    </span>
                    <span className="cart-row__price">
                      ${effectivePrice(item.product).toFixed(2)}
                    </span>
                  </div>

                  <form action={updateCartItem} className="cart-row__qty">
                    <input type="hidden" name="itemId" value={item.id} />
                    <input
                      type="number"
                      name="quantity"
                      defaultValue={item.quantity}
                      min={0}
                      max={item.product.stock}
                    />
                    <button type="submit" className="nav__cart">
                      Update
                    </button>
                  </form>

                  <form action={removeFromCart}>
                    <input type="hidden" name="itemId" value={item.id} />
                    <button type="submit" className="cart-row__remove">
                      Remove
                    </button>
                  </form>

                  <span className="cart-row__line-total">
                    ${(effectivePrice(item.product) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            <a href="/checkout" className="cta">
              Proceed to checkout →
            </a>
          </>
        )}
      </div>
    </>
  );
}
