
"use client";

import { useState } from 'react';
import * as authLocal from '@/lib/authLocal';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ProfilePhotoModal } from './profile-photo-modal';
import { useToast } from '@/hooks/use-toast';

interface ProfilePhotoCardProps {
    user: authLocal.User;
    onUpdate: () => void;
}

export function ProfilePhotoCard({ user, onUpdate }: ProfilePhotoCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { toast } = useToast();

    const getInitials = (name: string = "") => {
        const names = name.split(' ');
        if (names.length > 1) {
            return (names[0][0] + names[names.length - 1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    }
    
    const handleRemove = () => {
        // @ts-ignore
        authLocal.updateUser(user.id, { avatarUrl: null });
        onUpdate();
        toast({ title: "Profile photo removed." });
    }
    
    const handleUseInitials = () => {
        // In a real app, this might set a flag to use initials instead of a gravatar/etc.
        // For this demo, we'll just treat removing the photo as using initials.
        handleRemove();
        toast({ title: "Switched to using initials." });
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Profile Photo</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative">
                        <Avatar className="h-24 w-24">
                            {/* @ts-ignore */}
                            <AvatarImage src={user.avatarUrl} alt={user.publicName} />
                            <AvatarFallback className="text-3xl font-bold bg-primary/20 text-primary border border-primary/30">
                                {getInitials(user.publicName)}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    <div className="flex-1 space-y-2">
                        <p className="text-sm text-muted-foreground">
                            A clear, front-facing photo works best. You can switch back to initials anytime.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <Button onClick={() => setIsModalOpen(true)}>Upload Photo</Button>
                            <Button variant="outline" onClick={handleRemove}>Remove</Button>
                            <Button variant="ghost" onClick={handleUseInitials}>Use Initials</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <ProfilePhotoModal 
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSave={(dataUrl) => {
                    // @ts-ignore
                    authLocal.updateUser(user.id, { avatarUrl: dataUrl });
                    onUpdate();
                    toast({ title: "Profile photo updated." });
                    setIsModalOpen(false);
                }}
            />
        </>
    );
}

