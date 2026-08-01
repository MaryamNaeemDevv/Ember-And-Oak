import Nav from "@/components/Nav";

export default function AboutPage() {
  return (
    <>
      <Nav />
      <div className="shop-page">
        <span className="panel__eyebrow">ABOUT</span>
        <h1>Furniture built from the frame out.</h1>
        <p style={{ maxWidth: "60ch", lineHeight: 1.6, marginTop: 16 }}>
          Ember & Oak started with a simple frustration: most furniture
          shopping tells you nothing about how a piece is actually built.
          We show you — every frame, cushion, and joint — before it ever
          reaches your living room.
        </p>
        <p style={{ maxWidth: "60ch", lineHeight: 1.6, marginTop: 16 }}>
          Every product on this site is sourced from makers who use
          kiln-dried hardwood frames, hand-tied springs, and high-density
          foam. Nothing here is decorative filler — every layer earns its
          place.
        </p>
      </div>
    </>
  );
}
