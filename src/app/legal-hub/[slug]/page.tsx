
"use client";

import { useParams } from "next/navigation";
import { PlaceholderPage } from "@/components/placeholder-page";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LegalDetailPage() {
    const params = useParams();
    const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
    const title = slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : "Legal Document";

    return (
        <div className="container py-12">
            <Button asChild variant="ghost" className="mb-6">
                <Link href="/legal-hub">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Legal Hub
                </Link>
            </Button>
            <PlaceholderPage 
                title={title}
                description="This page will contain the full text of the legal document. For now, it is a placeholder."
            />
        </div>
    );
}
