
"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  className?: string;
  size?: number;
  interactive?: boolean;
  onRating?: (rating: number) => void;
}

export function StarRating({ rating, maxRating = 5, className, size = 16, interactive = false, onRating }: StarRatingProps) {
  
  const handleStarClick = (index: number) => {
    if (interactive && onRating) {
      onRating(index + 1);
    }
  }

  return (
    <div className={cn("flex items-center gap-0.5", className, interactive && "cursor-pointer")}>
      {Array.from({ length: maxRating }).map((_, index) => (
        <Star
          key={index}
          className={cn(
            "text-muted-foreground transition-colors",
            index < Math.floor(rating) ? "fill-primary text-primary" : "fill-muted-foreground/20",
            interactive && "hover:fill-primary/50"
          )}
          style={{ width: size, height: size }}
          onClick={() => handleStarClick(index)}
        />
      ))}
    </div>
  );
}
