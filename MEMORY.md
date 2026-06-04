# PumpkinQuest — карта проекта

## Общие правила

- **Не пушить в репозиторий.** Пуш делает пользователь самостоятельно.
- **Не запускать билд.** Не нужно запускать билд для проверки правок.

---

## Стек

- **Next.js 14** (App Router, static export → `output: "export"`)
- **TypeScript**
- **Tailwind CSS** с кастомной палитрой `pumpkin-*`
- **lucide-react** — иконки
- **Inter** (latin + cyrillic) — шрифт
- Хостинг: **GitHub Pages** via GitHub Actions (`.github/workflows/deploy.yml`)

---

## Структура директорий

```
app/                     ← только роутинг Next.js (ТОНКИЕ файлы)
  layout.tsx             ← корневой layout: шрифт, Header, Footer, мета
  page.tsx               ← 1 строка: re-export из modules/home/
  globals.css            ← Tailwind base + CSS-переменные палитры
  tools/
    page.tsx             ← 1 строка: re-export из modules/tools/
  lss/
    page.tsx             ← 1 строка: re-export из modules/lss/

modules/                 ← вся логика, UI и metadata по фичам
  home/
    HomePage.tsx         ← export metadata + export default HomePage
  tools/
    ToolsPage.tsx        ← export metadata + export default ToolsPage
  lss/
    LssPage.tsx          ← export metadata + export default LssPage

shared/                  ← переиспользуемое между фичами
  components/
    Header.tsx           ← sticky header, логотип → /
    Footer.tsx           ← email контакт
  lib/                   ← утилиты (пока пусто)
  types/                 ← TypeScript типы (пока пусто)

data/                    ← статичные данные (JSON и т.д.)
```

---

## Паттерн добавления новой страницы

1. Создать `modules/<name>/<Name>Page.tsx` — вся верстка и `export const metadata`.
2. Создать `app/<name>/page.tsx` с одной строкой:
   ```ts
   export { metadata, default } from "@/modules/<name>/<Name>Page";
   ```

---

## Цветовая палитра (tailwind.config.ts → `pumpkin-*`)

| Токен                  | Hex       | Назначение          |
|------------------------|-----------|---------------------|
| `pumpkin-bg`           | `#09090b` | Фон страницы        |
| `pumpkin-surface`      | `#18181b` | Карточки/панели     |
| `pumpkin-border`       | `#27272a` | Границы             |
| `pumpkin-orange`       | `#fb923c` | Основной акцент     |
| `pumpkin-orange-dim`   | `#ea580c` | Hover/active акцент |
| `pumpkin-text`         | `#fafafa` | Основной текст      |
| `pumpkin-muted`        | `#71717a` | Второстепенный текст|

---
