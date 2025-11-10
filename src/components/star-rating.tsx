
"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  className?: string;
  size?: number;
}

export function StarRating({ rating, maxRating = 5, className, size = 16 }: StarRatingProps) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: maxRating }).map((_, index) => (
        <Star
          key={index}
          className={cn(
            "text-muted-foreground transition-colors",
            index < Math.floor(rating) ? "fill-primary text-primary" : "fill-muted-foreground/20"
          )}
          style={{ width: size, height: size }}
        />
      ))}
    </div>
  );
}
