type AnalyticsEvents = {
  npc_generate: undefined;
  npc_clear_history: undefined;
  npc_lock: undefined;
  npc_reroll_field: { field: string };
  spell_download: { book: string; edition: string };
};

export function track<E extends keyof AnalyticsEvents>(
  ...args: AnalyticsEvents[E] extends undefined
    ? [event: E]
    : [event: E, data: AnalyticsEvents[E]]
): void {
  window.umami?.track(args[0], args[1] as Record<string, string>);
}
