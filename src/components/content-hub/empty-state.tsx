
import { Button } from "@/components/ui/button";
import { FileSearch } from "lucide-react";

type EmptyStateProps = {
  onClear: () => void;
};

export function EmptyState({ onClear }: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg col-span-full">
      <FileSearch className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 font-headline text-2xl font-bold">No content matches your filters.</h3>
      <p className="text-muted-foreground mt-2 mb-4">Try clearing your filters or searching for something else.</p>
      <div className="flex gap-2 justify-center">
        <Button onClick={onClear}>Clear filters</Button>
        <Button variant="outline" onClick={() => window.history.back()}>Back to all</Button>
      </div>
    </div>
  );
}
