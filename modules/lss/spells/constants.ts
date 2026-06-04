export type Edition = "2014" | "2024";

export interface SpellFile {
  slug: string;
  name: string;
  description: string;
  path: string;
}

export const CONTRIBUTORS = ["HoloLight17", "Ferylay"];

export const SPELL_FILES: Record<Edition, SpellFile[]> = {
  "2014": [
    { slug: "PHB",    name: "Книга игрока 2014",                         description: "Player's Handbook 2014",                     path: "/data/spells/2014/PHB.json" },
    { slug: "XGE",    name: "Руководство Занатара обо всём",             description: "Xanathar's Guide to Everything",        path: "/data/spells/2014/XGE.json" },
    { slug: "TCE",    name: "Котёл Таши со всякой всячиной",             description: "Tasha's Cauldron of Everything",        path: "/data/spells/2014/TCE.json" },
    { slug: "SCAG",   name: "Руководство приключенца по Побережью мечей",description: "Sword Coast Adventurer's Guide", path: "/data/spells/2014/SCAG.json" },
    { slug: "EGtW",   name: "Путеводитель исследователя по Дикогорью",   description: "Explorer's Guide to Wildemount",        path: "/data/spells/2014/EGtW.json" },
    { slug: "GGR",    name: "Руководство гильдмастеров по Равнике",      description: "Guildmasters' Guide to Ravnica",        path: "/data/spells/2014/GGR.json" },
    { slug: "FTD",    name: "Сокровищница драконов Физбана",             description: "Fizban's Treasury of Dragons",          path: "/data/spells/2014/FTD.json" },
    { slug: "SCC",    name: "Стриксхейвен: Учебная программа Хаоса",    description: "Strixhaven: A Curriculum of Chaos",     path: "/data/spells/2014/SCC.json" },
    { slug: "SatO",   name: "Spelljammer: Приключения в космосе",        description: "Spelljammer: Adventures in Space",      path: "/data/spells/2014/SatO.json" },
    { slug: "IDRotF", name: "Долина Ледяного Ветра: иней Морозной Девы", description: "Icewind Dale: Rime of the Frostmaiden", path: "/data/spells/2014/IDRotF.json" },
    { slug: "LLK",    name: "Потерянная лаборатория Квалиша",            description: "Lost Laboratory of Kwalish",            path: "/data/spells/2014/LLK.json" },
    { slug: "BMT",    name: "Книга многих вещей",                        description: "The Book of Many Things",               path: "/data/spells/2014/BMT.json" },
  ],
  "2024": [
    { slug: "PHB",    name: "Книга игрока 2024",                         description: "Player's Handbook 2024",                path: "/data/spells/2024/PHB.json" },
    { slug: "FRHoF",  name: "Забытые королевства: Герои Фаэруна",        description: "Forgotten Realms: Heroes of Faerûn",    path: "/data/spells/2024/FRHoF.json" },
    { slug: "EFA",    name: "Эберрон: кузница изобретателя",             description: "Eberron: Forge of the Artificer",       path: "/data/spells/2024/EFA.json" },
  ],
};
