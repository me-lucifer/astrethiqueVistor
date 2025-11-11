
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
  ariaLabel?: string;
}

export function StarRating({ rating, maxRating = 5, className, size = 16, interactive = false, onRating, ariaLabel }: StarRatingProps) {
  
  const handleStarClick = (index: number) => {
    if (interactive && onRating) {
      onRating(index + 1);
    }
  }

  const effectiveAriaLabel = ariaLabel ? `${ariaLabel}: ${rating} of ${maxRating} stars` : `${rating} of ${maxRating} stars`;

  return (
    <div 
        className={cn("flex items-center gap-0.5", className, interactive && "cursor-pointer")}
        role="radiogroup"
        aria-label={effectiveAriaLabel}
    >
      {Array.from({ length: maxRating }).map((_, index) => (
        <button
          key={index}
          type="button"
          role="radio"
          aria-checked={index < rating}
          aria-label={`${index + 1} star`}
          onClick={() => handleStarClick(index)}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
          disabled={!interactive}
        >
            <Star
            className={cn(
                "text-muted-foreground transition-colors",
                index < Math.floor(rating) ? "fill-primary text-primary" : "fill-muted-foreground/20",
                interactive && "hover:fill-primary/50"
            )}
            style={{ width: size, height: size }}
            />
        </button>
      ))}
    </div>
  );
}
