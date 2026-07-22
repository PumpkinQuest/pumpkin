"use client";

import { HelpCircle } from "lucide-react";

type Props = {
    /** Tooltip text. Keep it short — this is not a place for long prose. */
    text: string;
    className?: string;
};

/**
 * A small "?" hint icon that reveals a tooltip on hover/focus.
 * Use next to labels/headings that aren't self-explanatory to a dataset
 * author (e.g. jargon like "Гранты", or format quirks like expr syntax).
 * Don't slap it on every field — only where the meaning genuinely isn't
 * obvious from the label + placeholder alone.
 */
export default function InfoTooltip({ text, className }: Props) {
    return (
        <span className={`relative inline-flex group ${className ?? ''}`}>
            <button
                type="button"
                tabIndex={0}
                className="flex items-center justify-center text-pumpkin-muted/60 hover:text-pumpkin-orange focus:text-pumpkin-orange focus:outline-none transition-colors cursor-help"
            >
                <HelpCircle size={12} />
            </button>
            <span
                role="tooltip"
                className="pointer-events-none absolute z-30 left-1/2 -translate-x-1/2 bottom-full mb-1.5 w-56 rounded-md border border-pumpkin-border bg-pumpkin-surface px-2.5 py-1.5 text-[11px] leading-snug text-pumpkin-text opacity-0 shadow-lg transition-opacity duration-100 group-hover:opacity-100 group-focus-within:opacity-100"
            >
                {text}
            </span>
        </span>
    );
}
