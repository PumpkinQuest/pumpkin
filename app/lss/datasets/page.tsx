import type { Metadata } from "next";
import DatasetsPage from "@/modules/lss/datasets/DatasetsPage";

export const metadata: Metadata = {
  title: "Датасеты JSON — LSS",
  description: "JSON-файлы датасетов для листа Long Story Short",
  alternates: {
    canonical: "/lss/datasets/",
  },
};

export default DatasetsPage;
