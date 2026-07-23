import { Moon } from "lucide-react";

type NidoLogoProps = {
  compact?: boolean;
};

export function NidoLogo({ compact = false }: NidoLogoProps) {
  return (
    <div className={`nido-logo ${compact ? "compact-logo" : ""}`} aria-label="Nido">
      <span className="nido-logo-mark">
        <Moon size={compact ? 17 : 21} strokeWidth={2.4} aria-hidden="true" />
      </span>
      <span className="nido-logo-text">Nido</span>
    </div>
  );
}
