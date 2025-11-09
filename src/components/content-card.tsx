
"use client";

import Link from "next/link";
import Image from "next/image";
import { ContentItem } from "@/lib/content-seeder";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Mic, BookOpen, Video, Clock } from "lucide-react";
import { differenceInDays, isFuture } from "date-fns";

export function ContentCard({ item }: { item: ContentItem }) {
    
    const typeIconMap = {
        Article: BookOpen,
        Podcast: Mic,
        Video: Video
    };

    const TypeIcon = typeIconMap[item.type];
    
    return (
        <Link href={`/content-hub?item=${item.id}`} className="group">
            <Card className="h-full overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg motion-safe:hover:scale-[1.01] bg-card/50 hover:bg-card flex flex-col">
                <CardHeader className="p-0">
                    <div className="relative aspect-video">
                        <Image
                            src={`https://picsum.photos/seed/content${item.id}/400/225`}
                            alt={item.title}
                            fill
                            className="object-cover"
                            data-ai-hint="abstract texture"
                            loading="lazy"
                        />
                        {item.featured && <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground border-primary-foreground/20">Featured</Badge>}
                    </div>
                </CardHeader>
                <CardContent className="p-4 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <TypeIcon className="w-4 h-4 text-primary" />
                        <Badge variant="outline" className="text-xs">{item.tags[0]}</Badge>
                        <Badge variant="outline" className="text-xs">{item.language}</Badge>
                    </div>
                    <h3 className="font-headline text-lg font-bold leading-tight group-hover:text-primary transition-colors">{item.title}</h3>
                </CardContent>
                <CardFooter className="p-4 pt-0 text-sm text-foreground/70 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <span>By {item.author}</span>
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{item.duration} min</span>
                        </div>
                    </div>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity motion-safe:translate-x-[-4px] motion-safe:group-hover:translate-x-0"/>
                </CardFooter>
            </Card>
        </Link>
    );
}
