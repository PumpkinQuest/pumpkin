import { CONTRIBUTORS } from "../constants";

export default function DatasetCredits() {
  return (
    <p className="text-sm text-pumpkin-muted">
      Спасибо: {CONTRIBUTORS.join(", ")}
    </p>
  );
}
