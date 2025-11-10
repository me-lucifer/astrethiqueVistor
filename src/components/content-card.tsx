
"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Mic, BookOpen, Video, Heart } from "lucide-react";

type ContentType = 'Article' | 'Podcast' | 'Conference';

interface ContentCardProps {
    item: {
        id: string;
        title: string;
        type: ContentType;
        cover: string;
        tags?: string[];
        likes?: number;
        duration?: string;
        date?: string;
        time?: string;
    };
}

const typeInfo = {
    Article: { icon: BookOpen, cta: 'Read More' },
    Podcast: { icon: Mic, cta: 'Listen Now' },
    Conference: { icon: Video, cta: 'View Details' },
};

export function ContentCard({ item }: ContentCardProps) {
    const { icon: TypeIcon, cta } = typeInfo[item.type];

    return (
        // In a real app, this would open a modal or navigate to a content page
        // For this demo, we link to the generic content hub
        <Link href={`/content-hub?item=${item.id}`} className="group">
            <Card className="h-full overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg motion-safe:hover:scale-[1.01] bg-card/50 hover:bg-card flex flex-col">
                <CardContent className="p-0">
                    <div className="relative aspect-[3/2]">
                        <Image
                            src={item.cover}
                            alt={item.title}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                            data-ai-hint="abstract spiritual"
                            loading="lazy"
                        />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                         <div className="absolute bottom-3 left-3 flex items-center gap-2">
                             <div className="flex items-center gap-1 text-white text-xs font-medium bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                                <TypeIcon className="w-3.5 h-3.5" />
                                <span>{item.type}</span>
                            </div>
                         </div>
                    </div>
                    <div className="p-4">
                        <div className="flex flex-wrap gap-2 mb-2">
                            {item.tags && item.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                            ))}
                        </div>
                        <h3 className="font-headline text-base font-bold leading-tight group-hover:text-primary transition-colors">{item.title}</h3>
                    </div>
                </CardContent>

                <CardFooter className="p-4 pt-0 mt-auto text-sm text-foreground/70 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        {item.likes !== undefined && (
                            <div className="flex items-center gap-1.5">
                                <Heart className="w-3.5 h-3.5" />
                                <span>{item.likes}</span>
                            </div>
                        )}
                         {item.duration && (
                            <div className="flex items-center gap-1.5">
                                <span>{item.duration}</span>
                            </div>
                        )}
                        {item.date && (
                             <div className="flex items-center gap-1.5">
                                <span>{item.date}</span>
                            </div>
                        )}
                    </div>
                     <span className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity motion-safe:translate-x-[-4px] motion-safe:group-hover:translate-x-0 text-primary font-semibold">
                        {cta}
                        <ArrowRight className="w-4 h-4"/>
                    </span>
                </CardFooter>
            </Card>
        </Link>
    );
}
