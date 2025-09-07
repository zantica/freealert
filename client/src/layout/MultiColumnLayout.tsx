import React from "react";

interface MultiColumnLayoutProps {
  children: React.ReactNode;
  columns?: number;
  title?: string;
}

const MultiColumnLayout: React.FC<MultiColumnLayoutProps> = ({ children, columns = 2, title }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
    {title && (
      <header className="py-6 text-center">
        <h1 className="text-3xl font-bold text-white">{title}</h1>
      </header>
    )}
    <main className="flex-1 flex items-center justify-center">
      <div
        className={`grid gap-8 w-full max-w-7xl px-4 py-8`}
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {children}
      </div>
    </main>
  </div>
);

export default MultiColumnLayout;