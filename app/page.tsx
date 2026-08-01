import FrameSequence from "@/components/FrameSequence";
import CategoryCarousel from "@/components/CategoryCarousel";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/types";

export default async function Home() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name")
    .limit(5);

  return (
    <>
      <Nav />

      <CategoryCarousel categories={(categories ?? []) as Category[]} />

      <FrameSequence />

      <section className="panel panel--materials" id="materials">
        <span className="panel__eyebrow">01 — QUALITY & MATERIALS</span>
        <h2>Built from the frame out.</h2>
        <p>
          Kiln-dried hardwood base, hand-tied springs, high-density foam
          under every cushion. Nothing about this sofa is decorative —
          every layer earns its place.
        </p>
      </section>

      <section className="panel panel--comfort" id="comfort">
        <span className="panel__eyebrow">02 — COMFORT</span>
        <h2>Sit-tested, not just spec-tested.</h2>
        <p>
          Foam density is tuned by zone: firmer at the edge for support,
          softer at the center where you actually sit.
        </p>
      </section>

      <Footer />
    </>
  );
}