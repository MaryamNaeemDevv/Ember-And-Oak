"use client";

import { useEffect, useState } from "react";
import type { Category } from "@/lib/types";

export default function CategoryCarousel({
  categories,
}: {
  categories: Category[];
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (categories.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % categories.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [categories.length]);

  if (categories.length === 0) return null;

  return (
    <section className="category-carousel">
      {categories.map((c, i) => (
        <div
          key={c.id}
          className="category-carousel__slide"
          data-active={i === index}
        >
          {c.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={c.image_url} alt={c.name} />
          )}
          <div className="category-carousel__overlay" />
        </div>
      ))}

      <div className="category-carousel__content">
        <span className="panel__eyebrow">SHOP BY CATEGORY</span>
        <h2>{categories[index].name}</h2>
        <a href={`/shop?category=${categories[index].slug}`} className="cta">
          Shop {categories[index].name} →
        </a>
      </div>

      <div className="category-carousel__dots">
        {categories.map((c, i) => (
          <button
            key={c.id}
            className="category-carousel__dot"
            data-active={i === index}
            aria-label={`Show ${c.name}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>

      <div className="category-carousel__scroll-hint">
        <span>SCROLL TO EXPLORE</span>
        <span className="category-carousel__scroll-line" />
      </div>
    </section>
  );
}