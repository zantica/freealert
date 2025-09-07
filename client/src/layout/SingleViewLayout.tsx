import React from "react";

interface SingleViewLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const SingleViewLayout: React.FC<SingleViewLayoutProps> = ({ children, title }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
    {title && (
      <header className="py-6 text-center">
        <h1 className="text-3xl font-bold text-white">{title}</h1>
      </header>
    )}
    <main className="flex-1 flex items-center justify-center">
      {children}
    </main>
  </div>
);

export default SingleViewLayout;