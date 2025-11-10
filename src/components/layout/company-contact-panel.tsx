
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, MapPin, Mail, Clock } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/translations";
import { Separator } from "@/components/ui/separator";

export function CompanyContactPanel() {
    const { language } = useLanguage();
    const t = translations[language];

    const legalLinks = [
        { href: "/privacy", label: t.privacy },
        { href: "/terms", label: t.terms },
        { href: "/pricing", label: t.pricing },
    ];

    return (
        <div className="bg-muted/30 border-t">
            <div className="container py-12">
                <Card className="bg-card/50">
                    <CardContent className="p-8 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="space-y-2">
                            <h4 className="font-semibold flex items-center gap-2 text-foreground">
                                <Building className="h-4 w-4 text-primary" />
                                Company
                            </h4>
                            <p className="text-sm text-foreground/80">ASTRETHIQUE LTD</p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold flex items-center gap-2 text-foreground">
                                <MapPin className="h-4 w-4 text-primary" />
                                Registered Office
                            </h4>
                            <p className="text-sm text-foreground/80">221B Baker Street, London NW1 6XE, United Kingdom</p>
                        </div>
                        <div className="space-y-2">
                             <h4 className="font-semibold flex items-center gap-2 text-foreground">
                                <Mail className="h-4 w-4 text-primary" />
                                Email
                            </h4>
                            <a href="mailto:support@astrethique.com" className="text-sm text-primary hover:underline">
                                support@astrethique.com
                            </a>
                             <h4 className="font-semibold flex items-center gap-2 text-foreground pt-2">
                                <Clock className="h-4 w-4 text-primary" />
                                Business Hours
                            </h4>
                            <p className="text-sm text-foreground/80">Mon–Fri, 9:00–18:00 (local time)</p>
                        </div>
                        <div className="space-y-3">
                             <h4 className="font-semibold flex items-center gap-2 text-foreground">
                                Legal
                            </h4>
                            <div className="flex flex-col items-start gap-2">
                                {legalLinks.map((link) => (
                                    <Button key={link.href} variant="link" asChild className="p-0 h-auto text-primary">
                                        <Link href={link.href}>{link.label}</Link>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
