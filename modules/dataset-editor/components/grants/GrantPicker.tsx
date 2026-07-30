"use client";

import { useCallback, useMemo, useState, type KeyboardEvent } from "react";
import { Search } from "lucide-react";
import type { Grant } from "../../lib/types";
import {
    groupGrantEntries, searchGrantEntries, type GrantPickerEntry,
} from "../../lib/registry/grantCatalog";

type Props = {
    /** Every `trait` grant of the entity — a new `resource` prefills its pairing from it. */
    siblingTraits: Array<{ id: string; name: string }>;
    /** Receives the whole bundle: recipes create more than one grant at a time. */
    onPick: (grants: Grant[]) => void;
    onCancel: () => void;
};

export default function GrantPicker({ siblingTraits, onPick, onCancel }: Props) {
    const [query, setQuery] = useState('');

    const groups = useMemo(() => groupGrantEntries(searchGrantEntries(query)), [query]);
    const firstMatch = groups[0]?.entries[0];

    const handlePick = useCallback((entry: GrantPickerEntry) => {
        onPick(entry.create({ siblingTraits }));
    }, [onPick, siblingTraits]);

    const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') onCancel();
        if (e.key === 'Enter' && firstMatch) handlePick(firstMatch);
    }, [onCancel, firstMatch, handlePick]);

    return (
        <div className="flex flex-col gap-2 p-3 rounded-lg border border-pumpkin-orange/40 bg-pumpkin-orange/5">
            <div className="relative">
                <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-pumpkin-muted/60" />
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Что должна давать сущность? «темновидение», «ярость», «навыки»…"
                    autoFocus
                    className="w-full rounded-md border border-pumpkin-border bg-pumpkin-bg pl-7 pr-2 py-1.5 text-xs text-pumpkin-text placeholder:text-pumpkin-muted/50 focus:outline-none focus:border-pumpkin-orange/50"
                />
            </div>

            <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto">
                {groups.map((group) => (
                    <div key={group.id} className="flex flex-col gap-0.5">
                        <span className="text-[10px] uppercase tracking-wide text-pumpkin-orange px-1">
                            {group.label}
                        </span>
                        {group.entries.map((entry) => (
                            <button
                                key={entry.id}
                                onClick={() => handlePick(entry)}
                                className="text-left px-2 py-1.5 rounded hover:bg-pumpkin-orange/10 transition-colors"
                            >
                                <span className="block text-xs text-pumpkin-text">
                                    {entry.label}
                                </span>
                                <span className="block text-[11px] leading-snug text-pumpkin-muted/70">
                                    {entry.hint}
                                </span>
                            </button>
                        ))}
                    </div>
                ))}
                {groups.length === 0 && (
                    <span className="text-xs text-pumpkin-muted/70 px-1">Ничего не найдено</span>
                )}
            </div>

            <button
                onClick={onCancel}
                className="text-xs text-pumpkin-muted hover:text-pumpkin-text self-start"
            >
                Отмена
            </button>
        </div>
    );
}
