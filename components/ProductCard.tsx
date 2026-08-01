import type { Product } from "@/lib/types";

export default function ProductCard({ product: p }: { product: Product }) {
  const onSale = p.sale_price != null && p.sale_price < p.price;

  return (
    <a href={`/shop/${p.slug}`} className="product-card">
      <div className="product-card__image">
        {p.image_urls[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.image_urls[0]} alt={p.name} />
        )}
        {onSale && <span className="product-card__badge">SALE</span>}
      </div>
      <span className="product-card__name">{p.name}</span>
      <span className="product-card__price">
        {onSale ? (
          <>
            <span className="product-card__price-was">
              ${p.price.toFixed(2)}
            </span>{" "}
            ${p.sale_price!.toFixed(2)}
          </>
        ) : (
          `$${p.price.toFixed(2)}`
        )}
      </span>
      {p.stock === 0 && (
        <span className="product-card__oos">Out of stock</span>
      )}
    </a>
  );
}
