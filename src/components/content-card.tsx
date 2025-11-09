
"use client";

import Link from "next/link";
import Image from "next/image";
import { ContentItem } from "@/lib/content-seeder";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Mic, BookOpen } from "lucide-react";
import { differenceInDays, isFuture } from "date-fns";
import { useLanguage } from "@/contexts/language-context";

const translations = {
    en: {
        sponsored: "Sponsored",
        worthReading: "Worth reading",
        by: "By"
    },
    fr: {
        sponsored: "Sponsorisé",
        worthReading: "À lire",
        by: "Par"
    }
}


export function ContentCard({ item }: { item: ContentItem }) {
    const { language } = useLanguage();
    const t = translations[language];

    const getChip = () => {
        if (item.promotedUntil && isFuture(new Date(item.promotedUntil))) {
            return <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground border-primary-foreground/20">{t.worthReading}</Badge>;
        }
        if (item.author === "Admin" && differenceInDays(new Date(), new Date(item.publishedDate)) < 7) {
            return <Badge className="absolute top-3 left-3 bg-secondary text-secondary-foreground border-secondary-foreground/20">{t.sponsored}</Badge>;
        }
        return null;
    };

    const chip = getChip();
    
    return (
        <Link href={`/content-hub?item=${item.id}`} className="group">
            <Card className="h-full overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-[1.01] bg-card/50 hover:bg-card flex flex-col">
                <CardHeader className="p-0">
                    <div className="relative aspect-video">
                        <Image
                            src={`https://picsum.photos/seed/content${item.id}/400/225`}
                            alt={item.title}
                            fill
                            className="object-cover"
                            data-ai-hint="abstract texture"
                        />
                        {chip}
                    </div>
                </CardHeader>
                <CardContent className="p-4 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        {item.type === 'Podcast' ? <Mic className="w-4 h-4 text-primary" /> : <BookOpen className="w-4 h-4 text-primary" />}
                        <Badge variant="outline" className="text-xs">{item.category}</Badge>
                    </div>
                    <h3 className="font-headline text-lg font-bold leading-tight group-hover:text-primary transition-colors">{item.title}</h3>
                </CardContent>
                <CardFooter className="p-4 pt-0 text-sm text-foreground/70 flex justify-between items-center">
                    <span>{t.by} {item.author}</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-4px] group-hover:translate-x-0"/>
                </CardFooter>
            </Card>
        </Link>
    );
}

    
