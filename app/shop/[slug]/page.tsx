import Nav from "@/components/Nav";
import { createClient } from "@/lib/supabase/server";
import { addToCart } from "@/app/cart/actions";
import type { Product } from "@/lib/types";
import { notFound } from "next/navigation";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!product) notFound();

  const p = product as Product;

  return (
    <>
      <Nav />
      <div className="product-page">
        <div className="product-page__gallery">
          {p.image_urls.length > 0 ? (
            p.image_urls.map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={url} alt={`${p.name} ${i + 1}`} />
            ))
          ) : (
            <div className="product-page__placeholder" />
          )}
        </div>

        <div className="product-page__info">
          <h1>{p.name}</h1>
          <p className="product-page__price">
            {p.sale_price != null && p.sale_price < p.price ? (
              <>
                <span className="product-card__price-was">
                  ${p.price.toFixed(2)}
                </span>{" "}
                ${p.sale_price.toFixed(2)}
              </>
            ) : (
              `$${p.price.toFixed(2)}`
            )}
          </p>
          <p className="product-page__description">{p.description}</p>

          {p.stock > 0 ? (
            <form action={addToCart} className="product-page__add-form">
              <input type="hidden" name="productId" value={p.id} />
              <label>
                Qty
                <input
                  type="number"
                  name="quantity"
                  defaultValue={1}
                  min={1}
                  max={p.stock}
                />
              </label>
              <button type="submit" className="cta">
                Add to cart
              </button>
              <span className="product-page__stock">
                {p.stock} in stock
              </span>
            </form>
          ) : (
            <p className="product-card__oos">Out of stock</p>
          )}
        </div>
      </div>
    </>
  );
}
