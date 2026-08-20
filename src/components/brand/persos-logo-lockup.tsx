import Image from "next/image";

type PersosLogoLockupProps = {
  className?: string;
  iconClassName?: string;
  wordmarkClassName?: string;
};

export function PersosLogoLockup({
  className = "",
  iconClassName = "size-9",
  wordmarkClassName = "text-2xl",
}: PersosLogoLockupProps) {
  return (
    <span className={`inline-flex items-center justify-center gap-1.5 ${className}`}>
      <span className={`relative shrink-0 ${iconClassName}`}>
        <Image
          alt=""
          className="object-contain"
          fill
          sizes="48px"
          src="/brand/persos-icon.png"
          unoptimized
        />
      </span>
      <span
        className={`font-semibold lowercase leading-none tracking-[-0.045em] text-white ${wordmarkClassName}`}
      >
        persos
      </span>
    </span>
  );
}
