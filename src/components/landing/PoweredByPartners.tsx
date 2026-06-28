import Image from "next/image";

const PARTNERS = [
  {
    src: "/orangeslice.ai.png",
    alt: "Orange Slice AI",
    href: "https://orangeslice.ai/",
    width: 88,
    height: 24,
  },
  {
    src: "/fiber_ai.jpeg",
    alt: "Fiber AI",
    href: "https://fiber.ai/",
    width: 72,
    height: 24,
  },
  {
    src: "/lopus.webp",
    alt: "Lopus",
    href: "https://lopus.ai/",
    width: 72,
    height: 24,
  },
] as const;

export function PoweredByPartners({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 rounded-sm bg-paper/70 px-3 py-2 backdrop-blur-[2px] ${className}`}
    >
      <span className="label text-[0.5rem] text-ink/60">Powered by</span>
      <div className="flex items-center gap-3">
        {PARTNERS.map((partner) => (
          <a
            key={partner.src}
            href={partner.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={partner.alt}
            className="opacity-90 transition hover:opacity-100"
          >
            <Image
              src={partner.src}
              alt=""
              aria-hidden
              width={partner.width}
              height={partner.height}
              className="h-5 w-auto max-w-[5.5rem] object-contain"
            />
          </a>
        ))}
      </div>
    </div>
  );
}