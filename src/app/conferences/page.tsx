
import { FeaturedConferences } from "@/components/featured-conferences";

export default function ConferencesPage() {
  return (
    <div className="container py-12">
        <div className="flex flex-col items-start gap-4 mb-8">
            <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Conferences
            </h1>
            <p className="text-lg text-foreground/80 max-w-2xl">
                Join live events hosted by our experts to deepen your understanding.
            </p>
        </div>
        <FeaturedConferences />
    </div>
  );
}
