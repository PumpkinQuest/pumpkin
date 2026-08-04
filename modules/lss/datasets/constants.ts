export type Edition = "2014" | "2024";

export interface DatasetFile {
  slug: string;
  name: string;
  description: string;
  path: string;
}

export const CONTRIBUTORS = ["DesPro111"];

export const DATASET_FILES: Record<Edition, DatasetFile[]> = {
  "2014": [
      // { slug: "PHB", name: "Книга игрока 2014", description: "Player's Handbook 2014", path: "/data/datasets/2014/PHB.json" },
      { slug: "LaserLlama", name: "LaserLlama", description: "Годнота от одного из самых популярных хоумбрю-авторов", path: "/data/datasets/2014/LaserLlama.json" },
      { slug: "SRD", name: "SRD 2014", description: "Это пример, не добавляйте его в лист LSS. Там эти данные уже включены по умолчанию.", path: "/data/datasets/2014/SRD.json" },
  ],
  "2024": [
    { slug: "SRD", name: "SRD 2024", description: "Это пример, не добавляйте его в лист LSS. Там эти данные уже включены по умолчанию.", path: "/data/datasets/2024/SRD.json" },
  ],
};
