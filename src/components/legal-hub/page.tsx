import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FileText, ShieldCheck, FileCheck } from "lucide-react";
import Link from "next/link";

const legalLinks = [
  { href: "/terms", title: "Conditions Générales", description: "Nos conditions d'utilisation du service.", icon: FileText },
  { href: "/privacy", title: "Politique de Confidentialité", description: "Comment nous protégeons vos données (GDPR).", icon: ShieldCheck },
  { href: "/legal-notice", title: "Mentions Légales", description: "Informations légales sur l'entreprise.", icon: FileCheck },
];

export default function LegalHubPage() {
  return (
    <div className="container py-16">
      <div className="flex flex-col items-start gap-4 mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Pôle Juridique
        </h1>
        <p className="text-lg text-foreground/80 max-w-2xl">
          Retrouvez ici toutes les informations légales concernant Astrethique, nos services et votre utilisation de la plateforme.
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {legalLinks.map((link) => (
          <Link href={link.href} key={link.href} className="group">
            <Card className="h-full transition-all duration-300 ease-in-out group-hover:border-primary group-hover:shadow-lg motion-safe:group-hover:scale-[1.01] bg-card/50 hover:bg-card">
              <CardHeader className="flex-row items-center gap-4">
                <link.icon className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="font-headline text-lg">{link.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{link.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
