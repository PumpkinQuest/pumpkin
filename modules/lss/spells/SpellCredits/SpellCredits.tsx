import { CONTRIBUTORS } from "../constants";

export default function SpellCredits() {
  return (
    <p className="text-sm text-pumpkin-muted">
      Спасибо: {CONTRIBUTORS.join(", ")}
    </p>
  );
}
