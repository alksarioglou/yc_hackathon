import Image from "next/image";

export function LopusAttribution({
  variant = "dark",
  className = "",
}: {
  variant?: "dark" | "light";
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-2 ${variant === "dark" ? "text-white/45" : "text-muted"} ${className}`}
    >
      <span className="text-[10px] font-medium uppercase tracking-[0.16em]">
        Powered by{" "}
        <span className={variant === "dark" ? "text-white/80" : "text-ink"}>
          Lopus
        </span>
      </span>
      <Image
        src="/lopus.webp"
        alt=""
        aria-hidden
        width={80}
        height={24}
        className="h-5 w-auto object-contain"
      />
    </div>
  );
}