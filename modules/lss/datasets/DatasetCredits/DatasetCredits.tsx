import { CONTRIBUTORS } from "../constants";

export default function DatasetCredits() {
  return (
    <p className="text-sm text-pumpkin-muted">
      Спасибо: {CONTRIBUTORS.join(", ")}<br/>
      Если у вас есть, что сюда добавить, зайдите ко мне в Discord: <span className="text-pumpkin-orange">peter_the_pumpkin</span>.
    </p>
  );
}
