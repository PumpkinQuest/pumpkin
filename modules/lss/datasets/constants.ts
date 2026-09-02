export type Edition = "2014" | "2024";

export interface DatasetFile {
  slug: string;
  name: string;
  description: string;
  path: string;
}

export const CONTRIBUTORS = ["DesPro111", "Ilia Antonov", "Andromeda"];

// Dataset JSON files are hosted on mana.pumpkin.quest rather than committed into this
// (public GitHub Pages) repo.
const DATASETS_BASE_URL = "https://mana.pumpkin.quest/datasets";

export const DATASET_FILES: Record<Edition, DatasetFile[]> = {
  "2014": [
        { slug: "PHB", name: "Книга игрока 2014", description: "Недостающие данные из Книги игрока: подклассы, подрасы, предыстории и черты.", path: `${DATASETS_BASE_URL}/2014/phb-2014.json` },
        { slug: "LaserLlama", name: "LaserLlama", description: "Годнота от одного из самых популярных хоумбрю-авторов.", path: `${DATASETS_BASE_URL}/2014/laser-llama.json` },
        { slug: "SRD", name: "SRD 2014", description: "Это пример, не добавляйте его в лист LSS. Там эти данные уже включены по умолчанию.", path: `${DATASETS_BASE_URL}/2014/srd-2014.json` },
    ],
    "2024": [
        { slug: "PHB", name: "Книга игрока 2024", description: "Недостающие данные из Книги игрока: подклассы, подрасы, предыстории и черты.", path: `${DATASETS_BASE_URL}/2024/phb-2024.json` },
        { slug: "SRD", name: "SRD 2024", description: "Это пример, не добавляйте его в лист LSS. Там эти данные уже включены по умолчанию.", path: `${DATASETS_BASE_URL}/2024/srd-2024.json` },
  ],
};
