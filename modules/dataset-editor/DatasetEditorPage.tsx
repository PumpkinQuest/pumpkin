import { Database } from "lucide-react";
import type { Metadata } from "next";
import Breadcrumbs from "@/shared/components/Breadcrumbs";
import DatasetManager from "./components/DatasetManager";

export const metadata: Metadata = {
    title: "Редактор датасетов LSS",
    description: "Создание и редактирование датасетов Long Story Short — наборов классов, рас, предысторий и черт для конструктора персонажей.",
    alternates: {
        canonical: "/lss/dataset-editor/",
    },
};

export default function DatasetEditorPage() {
    return (
        <div className="max-w-5xl mx-auto px-6 py-24 flex flex-col gap-8">
            <div className="flex flex-col gap-3">
                <Breadcrumbs items={[
                    { label: "Главная", href: "/" },
                    { label: "LSS", href: "/lss" },
                    { label: "Редактор датасетов" },
                ]} />
                <div className="flex items-center gap-3">
                    <Database size={24} className="text-pumpkin-orange" />
                    <h1 className="text-3xl font-bold tracking-tight">Редактор датасетов</h1>
                </div>
                <p className="text-pumpkin-muted text-base max-w-xl leading-relaxed">
                    Подключайте, редактируйте, объединяйте и извлекайте сущности
                    из датасетов — коллекций классов, рас, предысторий и черт для
                    конструктора персонажей.
                </p>
                <p className="text-pumpkin-muted text-base max-w-xl leading-relaxed">
                    Данные хранятся в вашем браузере.{" "}
                    <a href="/lss/dataset-editor/guide/" className="text-pumpkin-orange hover:underline">Гайд по редактору</a>{" "}
                    объясняет самое непонятное за 5 минут.
                </p>
            </div>

            <DatasetManager />
        </div>
    );
}
