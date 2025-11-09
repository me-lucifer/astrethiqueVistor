import { ReactNode } from "react";

export function PlaceholderPage({ title, description }: { title: ReactNode, description?: ReactNode }) {
  return (
    <div className="container py-16">
      <div className="flex flex-col items-start gap-4">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        {description && <p className="text-lg text-foreground/80 max-w-2xl">{description}</p>}
        <div className="mt-8 p-8 border-2 border-dashed border-border rounded-lg w-full min-h-[40vh] flex items-center justify-center">
          <p className="text-foreground/60">Contenu à venir...</p>
        </div>
      </div>
    </div>
  );
}
