export function HeroFallback() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Static hero background image for mobile / reduced-motion */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hero-fallback.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-60"
      />
      {/* Gradient overlays for depth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 45%, rgba(0,255,200,0.08) 0%, rgba(0,255,200,0.02) 40%, transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 40% 35% at 50% 45%, rgba(0,255,200,0.05) 0%, transparent 60%)",
        }}
      />
    </div>
  );
}
