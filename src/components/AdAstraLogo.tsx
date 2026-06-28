import Image from "next/image";

export const AD_ASTRA_LOGO_SRC = "/ad astra logo.png";

export function AdAstraLogo({
  markClassName = "h-9 w-9",
  markZoom = 2.15,
  showWordmark = false,
  wordmarkClassName = "font-display text-lg uppercase tracking-[0.14em] text-ink",
  size = 40,
}: {
  markClassName?: string;
  markZoom?: number;
  showWordmark?: boolean;
  wordmarkClassName?: string;
  size?: number;
}) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden ${markClassName}`}
      >
        <Image
          src={AD_ASTRA_LOGO_SRC}
          alt="Ad Astra"
          width={size}
          height={size}
          className="max-w-none object-contain"
          style={{
            width: `${markZoom * 100}%`,
            height: `${markZoom * 100}%`,
          }}
          priority
        />
      </span>
      {showWordmark ? (
        <span className={wordmarkClassName}>Ad Astra</span>
      ) : null}
    </span>
  );
}