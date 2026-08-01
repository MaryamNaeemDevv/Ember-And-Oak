import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/types";

export default async function Footer() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name")
    .limit(5);

  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <div className="site-footer__brand">
          <span className="nav__mark">EMBER & OAK</span>
          <p>Modern craftsmanship, timeless design.</p>
        </div>

        <div className="site-footer__column">
          <span className="site-footer__heading">SHOP</span>
          <a href="/shop">All Products</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
        </div>

        <div className="site-footer__column">
          <span className="site-footer__heading">CATEGORIES</span>
          {(categories as Category[] | null)?.map((c) => (
            <a key={c.id} href={`/shop?category=${c.slug}`}>
              {c.name}
            </a>
          ))}
        </div>

        <div className="site-footer__column">
          <span className="site-footer__heading">CONTACT</span>
          <p className="site-footer__note">
            Have a question about an order or product?
          </p>
          <a href="/contact">Get in touch →</a>
        </div>
      </div>

      <div className="site-footer__bottom">
        © {new Date().getFullYear()} Ember & Oak. All rights reserved.
      </div>
    </footer>
  );
}