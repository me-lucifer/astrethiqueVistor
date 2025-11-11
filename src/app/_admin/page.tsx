
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import * as storage from "@/lib/storage";
import { PlaceholderPage } from "@/components/placeholder-page";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Consultant } from "@/lib/consultants";
import { getSession, setSession } from "@/lib/session";

function AdminPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [consultants, setConsultants] = useState<storage.User[]>([]);
    const [consultantProfiles, setConsultantProfiles] = useState<Consultant[]>([]);

    const isDemoMode = searchParams.get('demo') === '1';

    const loadData = () => {
        const allUsers = storage.getUsers();
        setConsultants(allUsers.filter(u => u.role === 'consultant'));

        const allConsultantProfiles = getSession<Consultant[]>('discover.seed.v1') || [];
        setConsultantProfiles(allConsultantProfiles);
    };

    useEffect(() => {
        if (!isDemoMode) {
            router.replace('/');
        } else {
            loadData();
        }
    }, [isDemoMode, router]);
    
    const handleToggleKyc = (userId: string) => {
        const allUsers = storage.getUsers();
        const updatedUsers = allUsers.map(u => {
            if (u.id === userId) {
                return { ...u, kycStatus: u.kycStatus === 'verified' ? 'pending' : 'verified' };
            }
            return u;
        });
        storage.saveUsers(updatedUsers);
        loadData();
        toast({ title: "KYC status updated." });
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
        <div className="container py-12">
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
                                const profile = consultantProfiles.find(p => p.id === user.id || p.slug === user.id);
                                return (
                                    <TableRow key={user.id}>
                                        <TableCell>{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={user.kycStatus === 'verified' ? 'secondary' : 'destructive'}>{user.kycStatus}</Badge>
                                                <Button size="sm" variant="outline" onClick={() => handleToggleKyc(user.id)}>Toggle</Button>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {profile ? (
                                                <Switch
                                                    checked={profile.adminApproved}
                                                    onCheckedChange={() => handleToggleActive(profile.slug)}
                                                    aria-label={`Toggle active status for ${user.name}`}
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
