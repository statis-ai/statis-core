export function SectionDivider() {
  return (
    <div className="relative mx-auto max-w-5xl px-6">
      <div className="relative h-px">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(200,92,26,0.5) 50%, transparent 100%)",
          }}
        />
        <div
          className="absolute inset-x-0 -top-px h-[3px]"
          style={{
            background:
              "linear-gradient(90deg, transparent 30%, rgba(200,92,26,0.18) 50%, transparent 70%)",
            filter: "blur(4px)",
          }}
        />
      </div>
    </div>
  );
}
