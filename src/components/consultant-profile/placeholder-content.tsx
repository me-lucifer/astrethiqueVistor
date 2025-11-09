
import { FileTextIcon } from "@radix-ui/react-icons";

export function PlaceholderContent({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
      <FileTextIcon className="h-10 w-10 text-muted-foreground" />
      <p className="mt-4 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
