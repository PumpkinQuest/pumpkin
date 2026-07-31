import { ChevronDown } from "lucide-react";
import type { AccordionItemProps } from "./types";

export default function AccordionItem({ title, children, defaultOpen, groupName }: AccordionItemProps) {
    return (
        <details
            className="group border border-pumpkin-orange/20 rounded-lg bg-pumpkin-orange/5 open:bg-pumpkin-orange/10 transition-colors"
            open={defaultOpen}
            name={groupName}
        >
            <summary className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer list-none font-medium text-pumpkin-text [&::-webkit-details-marker]:hidden">
                <span>{title}</span>
                <ChevronDown
                    size={18}
                    className="shrink-0 text-pumpkin-muted transition-transform duration-200 group-open:rotate-180"
                />
            </summary>
            <div className="flex flex-col gap-3 px-4 pb-4 text-sm text-pumpkin-muted leading-relaxed">
                {children}
            </div>
        </details>
    );
}
