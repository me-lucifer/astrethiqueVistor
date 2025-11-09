import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="container py-24 sm:py-32">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
          Astrethique
        </h1>
        <p className="mt-6 text-lg leading-8 text-foreground/80">
          Explorez le futur de l'esthétique avec nous. Des conférences inspirantes, des contenus exclusifs et une communauté passionnée vous attendent.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button asChild size="lg" className="transition-transform hover:scale-[1.01]">
            <Link href="/discover">
              Commencer l'exploration
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild variant="link" size="lg" className="text-foreground/80 transition-transform hover:scale-[1.01]">
            <Link href="/how-it-works">
              En savoir plus <span aria-hidden="true">→</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
