
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/star-rating";
import { ContentHubCard } from "@/components/content-hub/card";
import * as authLocal from "@/lib/authLocal";
import { getWallet, setWallet, getMoodLog, setMoodLog } from "@/lib/local";
import { useToast } from "@/hooks/use-toast";
import { Heart, Activity, Star as StarIcon } from "lucide-react";
import Link from "next/link";
import { format } from 'date-fns';
import { ContentHubItem, seedContentHub } from "@/lib/content-hub-seeder";
import { Consultant, seedConsultants } from "@/lib/consultants-seeder";
import { getSession } from "@/lib/session";
import { ZodiacSignModal } from "@/components/dashboard/zodiac-sign-modal";
import { DetailedHoroscope } from "@/components/dashboard/detailed-horoscope";
import { useRouter } from 'next/navigation';
import { getLocal } from "@/lib/local";


interface MoodLogEntry {
    dateISO: string;
    money: number;
    health: number;
    work: number;
    love: number;
}

const horoscopeData: { [key: string]: string } = {
    Aries: "Today is a day for bold action. Your energy is high, making it a great time to start new projects.",
    Taurus: "Focus on grounding yourself. A connection with nature could bring you unexpected peace and clarity.",
    Gemini: "Your communication skills are sharp today. Express your ideas, as they are likely to be well-received.",
    Cancer: "Tend to your emotional well-being. A quiet evening at home will recharge your batteries more than you think.",
    Leo: "Your creativity is flowing. It's a perfect day to engage in artistic pursuits or share your passions with others.",
    Virgo: "Organization is your friend today. Tackling a cluttered space will bring a surprising amount of mental clarity.",
    Libra: "Focus on balance in your relationships. A thoughtful conversation can resolve a lingering tension.",
    Scorpio: "Your intuition is heightened. Trust your gut feelings, especially in financial or career matters.",
    Sagittarius: "Adventure is calling. Even a small change in routine can lead to exciting new discoveries.",
    Capricorn: "Your hard work is about to pay off. Stay focused on your goals, as a breakthrough is near.",
    Aquarius: "Connect with your community. A group activity could spark a brilliant new idea or friendship.",
    Pisces: "Embrace your dreamy side. Allow yourself time for creative visualization and spiritual reflection.",
};

// Main Component
export default function DashboardPage() {
    return (
        <div className="container py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <main className="lg:col-span-2 space-y-8">
                    <WalletCard />
                    <MoodCard />
                </main>
                <aside className="lg:sticky lg:top-24">
                    <SidebarTabs />
                </aside>
            </div>
        </div>
    );
}


// Sub-components for the Dashboard

function WalletCard() {
    const [balance, setBalance] = useState(0);
    const { toast } = useToast();

    useEffect(() => {
        const checkWallet = () => {
            const wallet = getWallet();
            if (wallet) {
                setBalance(wallet.balanceEUR);
            }
        };
        checkWallet();
        window.addEventListener('storage', checkWallet);
        return () => window.removeEventListener('storage', checkWallet);
    }, []);

    const handleTopUp = (amount: number) => {
        const newBalance = balance + amount;
        setBalance(newBalance);
        setWallet({ balanceEUR: newBalance });
        toast({
            title: "Wallet Topped Up!",
            description: `You've added €${amount.toFixed(2)}. Your new balance is €${newBalance.toFixed(2)}.`,
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Wallet & Budget</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold">Balance: €{balance.toFixed(2)}</p>
            </CardContent>
            <CardFooter className="gap-2">
                <Button onClick={() => handleTopUp(5)}>Top up €5</Button>
                <Button onClick={() => handleTopUp(10)}>Top up €10</Button>
                <Button onClick={() => handleTopUp(25)}>Top up €25</Button>
            </CardFooter>
        </Card>
    );
}

function MoodCard() {
    const [ratings, setRatings] = useState({ money: 0, health: 0, work: 0, love: 0 });
    const { toast } = useToast();

    const handleRating = (dimension: keyof typeof ratings, value: number) => {
        setRatings(prev => ({ ...prev, [dimension]: value }));
    };

    const handleSave = () => {
        const today = format(new Date(), 'yyyy-MM-dd');
        const moodLog = getMoodLog();
        
        const todayIndex = moodLog.findIndex(entry => entry.dateISO === today);
        const newEntry = { dateISO: today, ...ratings };

        if (todayIndex > -1) {
            moodLog[todayIndex] = newEntry;
        } else {
            moodLog.push(newEntry);
        }

        setMoodLog(moodLog);
        toast({ title: "Mood saved for today!", description: "Check your recommendations for personalized content." });
    };

    const isSaveDisabled = Object.values(ratings).some(r => r === 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle>How do you feel right now?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {(['Money', 'Health', 'Work', 'Love'] as const).map(dim => (
                    <div key={dim} className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <p className="font-medium mb-2 sm:mb-0">{dim}</p>
                        <StarRating rating={ratings[dim.toLowerCase() as keyof typeof ratings]} onRating={(r) => handleRating(dim.toLowerCase() as keyof typeof ratings, r)} size={24} interactive />
                    </div>
                ))}
            </CardContent>
            <CardFooter className="justify-between items-center">
                <Button onClick={handleSave} disabled={isSaveDisabled}>Save today’s mood</Button>
                <Button variant="link" asChild>
                    <Link href="/dashboard/mood-trends">View trends</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}


function SidebarTabs() {
    return (
        <Tabs defaultValue="activity" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="activity"><Activity className="w-4 h-4 mr-2"/>Activity</TabsTrigger>
                <TabsTrigger value="recommendations"><StarIcon className="w-4 h-4 mr-2"/>Recommendations</TabsTrigger>
                <TabsTrigger value="favorites"><Heart className="w-4 h-4 mr-2"/>Favorites</TabsTrigger>
            </TabsList>
            <TabsContent value="activity">
                <ActivityTab />
            </TabsContent>
            <TabsContent value="recommendations">
                <RecommendationsTab />
            </TabsContent>
            <TabsContent value="favorites">
                <FavoritesTab />
            </TabsContent>
        </Tabs>
    )
}

function ActivityTab() {
    const [user, setUser] = useState<authLocal.User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const checkUser = () => setUser(authLocal.getCurrentUser());
        checkUser();
        window.addEventListener('storage', checkUser);
        return () => window.removeEventListener('storage', checkUser);
    }, []);

    const zodiacSign = user?.zodiacSign;
    const horoscope = zodiacSign ? horoscopeData[zodiacSign] : null;

    const handleZodiacSave = (sign: authLocal.User['zodiacSign']) => {
        if(user) {
            authLocal.updateUser(user.id, { zodiacSign: sign });
        }
        setIsModalOpen(false);
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        Daily Horoscope
                        <Badge variant="outline">Free</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {horoscope ? (
                        <div>
                            <p className="font-semibold mb-2">Today for {zodiacSign}</p>
                            <p className="text-sm text-muted-foreground">{horoscope}</p>
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground p-4 border-dashed border-2 rounded-lg">
                            <p>Set your zodiac sign in your profile to see your daily horoscope.</p>
                            <Button variant="link" onClick={() => setIsModalOpen(true)}>Set your zodiac sign</Button>
                        </div>
                    )}
                    <div className="mt-6 border-t pt-6">
                       <DetailedHoroscope user={user} />
                    </div>
                     <div className="mt-6 border-t pt-6">
                        <p className="text-sm text-muted-foreground text-center">No recent activity yet.</p>
                    </div>
                </CardContent>
            </Card>
            <ZodiacSignModal 
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSave={handleZodiacSave}
                currentSign={user?.zodiacSign}
            />
        </>
    );
}

function RecommendationsTab() {
    const [recommendations, setRecommendations] = useState<ContentHubItem[]>([]);
    const [allContent, setAllContent] = useState<ContentHubItem[]>([]);
    const router = useRouter();

    useEffect(() => {
        seedContentHub();
        setAllContent(getLocal<ContentHubItem[]>("ch_items") || []);

        const moodLog = getMoodLog();
        if (moodLog.length === 0) return;

        const last7Days = moodLog.slice(-7);
        const averages = {
            money: last7Days.reduce((sum, entry) => sum + entry.money, 0) / last7Days.length,
            health: last7Days.reduce((sum, entry) => sum + entry.health, 0) / last7Days.length,
            work: last7Days.reduce((sum, entry) => sum + entry.work, 0) / last7Days.length,
            love: last7Days.reduce((sum, entry) => sum + entry.love, 0) / last7Days.length,
        };

        const lowDimensions = (Object.keys(averages) as (keyof typeof averages)[])
            .filter(dim => averages[dim] <= 3);

        if (lowDimensions.length > 0) {
            const recommendedContent = allContent
                .filter(item => lowDimensions.some(dim => item.tags.includes(dim.charAt(0).toUpperCase() + dim.slice(1))))
                .slice(0, 3);
            setRecommendations(recommendedContent);
        }

    }, [allContent]);
    
    const handleTopicClick = (topic: string) => {
        router.push(`/content-hub?topics=${encodeURIComponent(topic)}`);
    };

    return (
        <Card>
            <CardHeader><CardTitle>Personalized Content</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                {recommendations.length > 0 ? (
                    recommendations.map(item => <ContentHubCard key={item.id} item={item} onTopicClick={handleTopicClick} />)
                ) : (
                    <div className="text-center text-muted-foreground p-4">
                        <p>You’re doing great! New content will appear here when your check-ins suggest it.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function FavoritesTab() {
    const [favorites, setFavorites] = useState<Consultant[]>([]);
    const [isOnline, setIsOnline] = useState(new Date().getMinutes() % 2 === 0);

    useEffect(() => {
        seedConsultants();
        const allConsultants = getSession<Consultant[]>('discover.seed.v1') || [];
        const user = authLocal.getCurrentUser();
        const favoriteIds = user?.favorites.consultants || [];

        if (favoriteIds.length === 0) {
            // Seed with demo favorites if none exist
            setFavorites(allConsultants.slice(0, 2));
        } else {
            setFavorites(allConsultants.filter(c => favoriteIds.includes(c.id)));
        }

        const timer = setInterval(() => {
            setIsOnline(new Date().getMinutes() % 2 === 0);
        }, 60000); // Check every minute

        return () => clearInterval(timer);
    }, []);

    return (
        <Card>
            <CardHeader><CardTitle>Favorites Online</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                {favorites.length > 0 ? (
                    favorites.map((fav, index) => (
                        <div key={fav.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={fav.cover} />
                                    <AvatarFallback>{fav.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{fav.name}</p>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                        {isOnline ? "Online" : "Offline"}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" asChild>
                                    <Link href={`/discover/consultant/${fav.slug}?mode=chat`}>Start</Link>
                                </Button>
                                <Button size="sm" variant="outline" asChild>
                                     <Link href={`/discover/consultant/${fav.slug}#availability-section`}>Schedule</Link>
                                </Button>
                            </div>
                        </div>
                    ))
                ) : (
                     <div className="text-center text-muted-foreground p-4">
                        <p>You haven't added any favorites yet.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
