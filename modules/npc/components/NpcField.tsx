import { RotateCcw } from "lucide-react";
import type { NpcField } from "../lib/types";

interface NpcFieldRowProps {
  field: NpcField;
  isName?: boolean;
  onReroll?: () => void;
}

export default function NpcFieldRow({ field, isName = false, onReroll }: NpcFieldRowProps) {
  return (
    <div className="flex flex-col gap-0.5 group/field">
      <div className="flex items-center gap-1">
        <span className="text-xs font-medium text-pumpkin-muted uppercase tracking-wider">
          {field.label}
        </span>
        {onReroll && (
          <button
            onClick={onReroll}
            title={`Перегенерировать: ${field.label}`}
            className="p-0.5 rounded text-pumpkin-muted hover:text-pumpkin-orange transition-colors duration-150"
          >
            <RotateCcw size={10} />
          </button>
        )}
      </div>
      <span
        className={
          isName
            ? "text-lg font-bold text-pumpkin-orange"
            : "text-sm text-pumpkin-text leading-relaxed"
        }
      >
        {field.value}
      </span>
    </div>
  );
}
