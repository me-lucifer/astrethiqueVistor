
"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Bell, Lock, Wallet, Database } from "lucide-react";
import { cn } from "@/lib/utils";

const accountNavLinks = [
  { href: "/account/profile", label: "Profile", icon: User },
  { href: "/account/preferences", label: "Notifications", icon: Bell },
  { href: "/account/security", label: "Security", icon: Lock },
  { href: "/account/wallet", label: "Wallet", icon: Wallet },
];

export default function AccountLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="container py-12">
        <div className="flex flex-col items-start gap-4 mb-8">
            <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                My Account
            </h1>
            <p className="text-lg text-foreground/80 max-w-2xl">
                Manage your profile, settings, and wallet.
            </p>
        </div>

        <div className="grid md:grid-cols-[240px_1fr] gap-8 items-start">
            <aside className="md:sticky md:top-24">
                <nav className="flex flex-col gap-1">
                {accountNavLinks.map((link) => {
                    const isActive = pathname.startsWith(link.href);
                    return (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                            ? "bg-muted text-foreground"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                    >
                        <link.icon className="h-4 w-4" />
                        {link.label}
                    </Link>
                    );
                })}
                </nav>
            </aside>
            <main>{children}</main>
        </div>
    </div>
  );
}
