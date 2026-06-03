import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-pumpkin-border bg-pumpkin-bg/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-6 h-14 flex items-center">
        <Link
          href="/"
          className="text-pumpkin-orange font-bold text-lg tracking-tight hover:opacity-80 transition-opacity"
        >
          PumpkinQuest
        </Link>
      </div>
    </header>
  );
}
