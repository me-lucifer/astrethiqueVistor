
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PlaceholderPage } from "@/components/placeholder-page";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Consultant } from "@/lib/consultants";
import { getSession, setSession } from "@/lib/session";
import { Users, LogIn, MessageSquare, Heart } from "lucide-react";
import * as authLocal from "@/lib/authLocal";

function AdminPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [consultants, setConsultants] = useState<authLocal.User[]>([]);
    const [consultantProfiles, setConsultantProfiles] = useState<Consultant[]>([]);
    const [metrics, setMetrics] = useState<any | null>(null);

    const isDemoMode = searchParams.get('demo') === '1';

    const loadData = () => {
        const allUsers = authLocal.getUsers();
        setConsultants(allUsers.filter(u => u.role === 'consultant'));

        const allConsultantProfiles = getSession<Consultant[]>('discover.seed.v1') || [];
        setConsultantProfiles(allConsultantProfiles);
        
        // Metrics is not part of the new model, this is placeholder.
        setMetrics({ registrations: { visitor: 0, consultant: 0 }, logins: 0, comments: 0, favorites: 0 });
    };

    useEffect(() => {
        if (!isDemoMode) {
            router.replace('/');
        } else {
            loadData();
        }
    }, [isDemoMode, router]);
    
    const handleToggleKyc = (userId: string) => {
        // This is a demo-only feature and won't affect the real user object structure
        toast({ title: "KYC status toggled (demo)." });
    };

    const handleToggleActive = (slug: string) => {
        const profiles = getSession<Consultant[]>('discover.seed.v1') || [];
        const updatedProfiles = profiles.map(p => {
            if (p.slug === slug) {
                return { ...p, adminApproved: !p.adminApproved };
            }
            return p;
        });
        setSession('discover.seed.v1', updatedProfiles);
        loadData();
        toast({ title: "Active status updated." });
    };

    if (!isDemoMode) {
        return <PlaceholderPage title="Access Denied" />;
    }

    return (
        <div className="container py-12 space-y-8">
            {metrics && (
                <Card>
                    <CardHeader>
                        <CardTitle>Demo Analytics</CardTitle>
                        <CardDescription>Simple event tracking stored in local storage.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div className="p-4 bg-muted rounded-lg">
                                <Users className="mx-auto h-6 w-6 text-primary" />
                                <p className="mt-2 text-2xl font-bold">{metrics.registrations.visitor + metrics.registrations.consultant}</p>
                                <p className="text-sm text-muted-foreground">Total Registrations</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                                <LogIn className="mx-auto h-6 w-6 text-primary" />
                                <p className="mt-2 text-2xl font-bold">{metrics.logins}</p>
                                <p className="text-sm text-muted-foreground">Logins</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                                <MessageSquare className="mx-auto h-6 w-6 text-primary" />
                                <p className="mt-2 text-2xl font-bold">{metrics.comments}</p>
                                <p className="text-sm text-muted-foreground">Comments</p>
                            </div>
                             <div className="p-4 bg-muted rounded-lg">
                                <Heart className="mx-auto h-6 w-6 text-primary" />
                                <p className="mt-2 text-2xl font-bold">{metrics.favorites}</p>
                                <p className="text-sm text-muted-foreground">Favorites</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Consultant Management</CardTitle>
                    <CardDescription>Toggle KYC and Active status for demo purposes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>KYC Status</TableHead>
                                <TableHead>Profile Active</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {consultants.map(user => {
                                // @ts-ignore
                                const profile = consultantProfiles.find(p => p.id === user.id || p.slug === user.id);
                                const kycStatus = profile?.kycVerified ? 'verified' : 'pending';
                                return (
                                    <TableRow key={user.id}>
                                        <TableCell>{user.firstName} {user.lastName}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={kycStatus === 'verified' ? 'secondary' : 'destructive'}>{kycStatus}</Badge>
                                                <Button size="sm" variant="outline" onClick={() => handleToggleKyc(user.id)}>Toggle</Button>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {profile ? (
                                                <Switch
                                                    checked={profile.adminApproved}
                                                    onCheckedChange={() => handleToggleActive(profile.slug)}
                                                    aria-label={`Toggle active status for ${user.firstName} ${user.lastName}`}
                                                />
                                            ) : (
                                                <span className="text-muted-foreground text-xs">No profile</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

export default function AdminPage() {
    return (
        <Suspense fallback={<PlaceholderPage title="Loading Admin..." />}>
            <AdminPageContent />
        </Suspense>
    );
}
