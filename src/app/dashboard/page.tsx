
"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ContentHubCard } from "@/components/content-hub/card";
import * as authLocal from "@/lib/authLocal";
import { getWallet, setWallet, getMoodLog, setMoodLog, getLocal, setLocal, Wallet, getMoodMeta, MoodMeta, initializeLocalStorage } from "@/lib/local";
import { useToast } from "@/hooks/use-toast";
import { Heart, Activity, Star as StarIcon, Sparkles, Check, CheckCircle, Flame, Calendar, Video as VideoIcon } from "lucide-react";
import Link from "next/link";
import { format, formatDistanceToNow, isToday, isYesterday, isPast, isFuture } from 'date-fns';
import { ContentHubItem, seedContentHub } from "@/lib/content-hub-seeder";
import { Consultant, seedConsultants } from "@/lib/consultants-seeder";
import { getSession } from "@/lib/session";
import { ZodiacSignModal } from "@/components/dashboard/zodiac-sign-modal";
import { DetailedHoroscope } from "@/components/dashboard/detailed-horoscope";
import { useRouter } from 'next/navigation';
import { PlaceholderPage } from "@/components/placeholder-page";
import { AuthModal } from "@/components/auth-modal";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { StarRating } from "@/components/star-rating";
import { Conference } from "@/lib/conferences-seeder";

const Starfield = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
    {/* This is a simplified CSS starfield. A real implementation might use a canvas or more complex CSS. */}
    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.1)_0%,_rgba(255,255,255,0)_60%)] opacity-50" />
    <div className="absolute w-[2px] h-[2px] bg-white/50 rounded-full shadow-[0_0_10px_2px_#fff] top-[10%] left-[10%]" />
    <div className="absolute w-[1px] h-[1px] bg-white/50 rounded-full shadow-[0_0_8px_1px_#fff] top-[20%] left-[80%]" />
    <div className="absolute w-[1px] h-[1px] bg-white/50 rounded-full shadow-[0_0_8px_1px_#fff] top-[50%] left-[50%]" />
    <div className="absolute w-[2px] h-[2px] bg-white/50 rounded-full shadow-[0_0_10px_2px_#fff] top-[70%] left-[25%]" />
    <div className="absolute w-[1px] h-[1px] bg-white/50 rounded-full shadow-[0_0_8px_1px_#fff] top-[90%] left-[90%]" />
  </div>
);

const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <Card className={cn("bg-card/60 backdrop-blur-lg border-white/10 shadow-lg transition-all duration-300 hover:border-white/20 hover:shadow-primary/10", className)}>
    {children}
  </Card>
);

// Main Component
export default function DashboardPage() {
    const { toast } = useToast();
    const [user, setUser] = useState<authLocal.User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const router = useRouter();

    const checkUser = () => {
        const currentUser = authLocal.getCurrentUser();
        setUser(currentUser);
        if (!currentUser) {
            setIsAuthModalOpen(true);
        }
    };

    useEffect(() => {
        // Ensure data is seeded on first visit
        initializeLocalStorage();
        
        const currentUser = authLocal.getCurrentUser();
        if (!currentUser) {
          router.push('/login');
          toast({ variant: 'destructive', title: "Please sign in to access your dashboard." });
          return;
        }
        setUser(currentUser);
        setLoading(false);

        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'astro') {
                checkUser();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [router, toast]);

    if (loading) {
        return <PlaceholderPage title="Loading Dashboard..." />;
    }

    if (!user) {
        return (
            <>
                <PlaceholderPage 
                    title="Please Sign In" 
                    description="You need to be logged in to view your dashboard." 
                />
                <AuthModal isOpen={true} onOpenChange={setIsAuthModalOpen} onLoginSuccess={checkUser} />
            </>
        )
    }
    
    const handleFirstCheckin = () => {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
    }

    return (
        <div className="relative min-h-screen">
          <Starfield />
          <div className="container py-12">
            <AnimatePresence>
                {showConfetti && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
                    >
                        <div className="text-6xl">🎉</div>
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="grid grid-cols-12 gap-8 items-start">
                <div className="col-span-12 lg:col-span-8 space-y-8">
                    <WalletCard />
                    <MoodCard onFirstCheckin={handleFirstCheckin} />
                    <QuickTrends />
                </div>
                <div className="col-span-12 lg:col-span-4 space-y-8 lg:w-[384px]">
                    <HoroscopeCard user={user} />
                    <SidebarTabs />
                </div>
            </div>
          </div>
        </div>
    );
}


// Sub-components for the Dashboard
function WalletCard() {
    const [wallet, setWalletState] = useState<Wallet | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const checkWallet = () => {
            const user = authLocal.getCurrentUser();
            if (user) {
                const userWallet: Wallet = { balanceEUR: (user.wallet.balanceCents || 0) / 100, history: (user as any).wallet.history || [] };
                setWalletState(userWallet);
            }
        };
        checkWallet();
        window.addEventListener('storage', checkWallet);
        return () => window.removeEventListener('storage', checkWallet);
    }, []);

    const handleTopUp = (amount: number) => {
        const user = authLocal.getCurrentUser();
        if (!user) return;

        const newBalanceCents = (user.wallet.balanceCents || 0) + (amount * 100);
        const newHistoryItem = { type: 'topup', amount: amount, ts: new Date().toISOString() };
        
        authLocal.updateUser(user.id, {
            wallet: { 
                ...user.wallet, 
                balanceCents: newBalanceCents,
                // @ts-ignore
                history: [...(user.wallet.history || []), newHistoryItem]
            }
        });
        
        toast({
            title: "Funds Added",
            description: `€${amount.toFixed(2)} has been added to your wallet.`,
            duration: 2500,
        });
    };

    if (wallet === null) {
        return <GlassCard><CardContent className="p-6"><div className="h-24 bg-muted animate-pulse rounded-md" /></CardContent></GlassCard>
    }

    return (
        <GlassCard>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Wallet & Budget
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold">Balance: €{(wallet.balanceEUR || 0).toFixed(2)}</p>
            </CardContent>
            <CardFooter className="gap-2">
                <Button onClick={() => handleTopUp(5)}>Top up €5</Button>
                <Button onClick={() => handleTopUp(10)}>Top up €10</Button>
                <Button onClick={() => handleTopUp(25)}>Top up €25</Button>
            </CardFooter>
        </GlassCard>
    );
}

function MoodCard({ onFirstCheckin }: { onFirstCheckin: () => void }) {
    type Ratings = { money: number; health: number; work: number; love: number };
    const [ratings, setRatings] = useState<Ratings>({ money: 0, health: 0, work: 0, love: 0 });
    const { toast } = useToast();

    // Load initial state
    useEffect(() => {
        const moodLog = getMoodLog();
        const today = format(new Date(), 'yyyy-MM-dd');
        const todayEntry = moodLog.find(entry => entry.dateISO === today);
        if (todayEntry) {
            setRatings({
                money: todayEntry.money,
                health: todayEntry.health,
                work: todayEntry.work,
                love: todayEntry.love
            });
        }
    }, []);

    const debouncedSave = useCallback(() => {
        const handler = setTimeout(() => {
            const today = format(new Date(), 'yyyy-MM-dd');
            const moodLog = getMoodLog();
            const moodMeta = getMoodMeta() || { streak: 0, lastCheckIn: '' };
            
            let newStreak = moodMeta.streak;
            const lastDate = moodMeta.lastCheckIn ? new Date(moodMeta.lastCheckIn) : null;
            const todayDate = new Date();
            const isFirstCheckinToday = !lastDate || !isToday(lastDate);

            if (isFirstCheckinToday) {
                if (lastDate && isYesterday(lastDate)) {
                    newStreak = (newStreak || 0) + 1;
                } else if (lastDate && !isToday(lastDate)) {
                    newStreak = 1;
                } else if (!lastDate) {
                    newStreak = 1;
                }
                onFirstCheckin();
                toast({
                    title: "Mood saved ✓",
                    duration: 2500,
                });
            }

            const todayIndex = moodLog.findIndex(entry => entry.dateISO === today);
            if (todayIndex > -1) {
                moodLog[todayIndex] = { ...moodLog[todayIndex], ...ratings, dateISO: today };
            } else {
                moodLog.push({ dateISO: today, ...ratings });
            }
            
            setMoodLog(moodLog, { streak: newStreak, lastCheckIn: todayDate.toISOString() });
        }, 200);

        return () => clearTimeout(handler);
    }, [ratings, onFirstCheckin, toast]);

    useEffect(() => {
        debouncedSave();
    }, [ratings, debouncedSave]);

    const handleRating = (dimension: keyof Ratings, value: number) => {
        setRatings(prevRatings => ({ ...prevRatings, [dimension]: value }));
    };

    return (
        <GlassCard>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    How do you feel right now?
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {(['Money', 'Health', 'Work', 'Love'] as const).map(dim => (
                    <div key={dim} className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <p className="font-medium mb-2 sm:mb-0">{dim}</p>
                        <StarRating 
                            rating={ratings[dim.toLowerCase() as keyof Ratings]} 
                            onRating={(r) => handleRating(dim.toLowerCase() as keyof Ratings, r)} 
                            size={24} 
                            interactive
                            ariaLabel={`Rate your mood for ${dim}`}
                            className="[&>button>svg]:transition-all [&>button>svg:hover]:text-yellow-300 [&>button>svg:hover]:drop-shadow-[0_0_5px_rgba(252,211,77,0.7)]"
                        />
                    </div>
                ))}
            </CardContent>
        </GlassCard>
    );
}


function QuickTrends() {
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const updateTrends = () => {
        const moodMeta = getMoodMeta();
        if (moodMeta && moodMeta.lastCheckIn) {
            const lastDate = new Date(moodMeta.lastCheckIn);
            setLastCheckIn(formatDistanceToNow(lastDate, { addSuffix: true }));
            
            const today = new Date();
            if (isToday(lastDate)) {
              setStreak(moodMeta.streak || 1);
            } else if (isYesterday(lastDate)) {
              setStreak(moodMeta.streak || 0); // User will get +1 on next checkin
            } else {
              setStreak(0); // Streak broken
            }
        } else {
            setStreak(0);
            setLastCheckIn(null);
        }
    };

    updateTrends();
    window.addEventListener('storage', updateTrends);
    return () => window.removeEventListener('storage', updateTrends);
  }, []);

  return (
    <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground p-3 rounded-lg bg-card/40 backdrop-blur-lg border border-white/10">
        <div className="flex items-center gap-2">
            {streak > 1 && (
                <Badge variant="secondary" className="gap-1.5">
                    <Flame className="h-4 w-4 text-amber-400" />
                    {streak} day streak
                </Badge>
            )}
            {lastCheckIn && <span>Last check-in: {lastCheckIn}</span>}
        </div>
        <Button variant="link" asChild>
            <Link href="/dashboard/mood-trends">View trends</Link>
        </Button>
    </div>
  );
}

function HoroscopeCard({ user }: { user: authLocal.User | null }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleZodiacSave = (sign: authLocal.User['zodiacSign']) => {
        if(user) {
            authLocal.updateUser(user.id, { zodiacSign: sign });
        }
        setIsModalOpen(false);
    }

    const zodiacSign = user?.zodiacSign;
    const horoscope = zodiacSign ? horoscopeData[zodiacSign] : null;

    return (
        <>
            <GlassCard>
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            Daily Horoscope
                        </span>
                        <Badge variant="outline">Free</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {horoscope ? (
                        <div>
                            <p className="font-semibold mb-2 flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Today for {zodiacSign}</p>
                            <p className="text-sm text-muted-foreground">{horoscope}</p>
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground p-4 border-dashed border-2 rounded-lg">
                            <p>Set your zodiac sign to unlock your free daily reading.</p>
                            <Button variant="link" onClick={() => setIsModalOpen(true)}>Set your zodiac sign</Button>
                        </div>
                    )}
                    <div className="mt-6 border-t pt-4">
                       <DetailedHoroscope user={user} />
                    </div>
                </CardContent>
            </GlassCard>
            <ZodiacSignModal 
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSave={handleZodiacSave}
                currentSign={user?.zodiacSign}
            />
        </>
    );
}

function SidebarTabs() {
    const [activeTab, setActiveTab] = useState(() => {
        if (typeof window === 'undefined') return 'activity';
        return getLocal<string>('dash.activeTab') || 'activity';
    });

    useEffect(() => {
        setLocal('dash.activeTab', activeTab);
    }, [activeTab]);

    return (
        <GlassCard>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="activity"><Activity className="w-4 h-4 mr-2"/>Activity</TabsTrigger>
                <TabsTrigger value="recommendations"><StarIcon className="w-4 h-4 mr-2"/>For You</TabsTrigger>
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
        </GlassCard>
    )
}

interface ActivityItem {
    id: string;
    type: 'upcoming_conference' | 'replay_available' | 'appointment';
    title: string;
    description: string;
    date: Date;
    cta: {
        label: string;
        href: string;
    };
    icon: React.ElementType;
}

function ActivityTab() {
    const [activities, setActivities] = useState<ActivityItem[]>([]);

    useEffect(() => {
        const rsvps = getLocal<any[]>('rsvps') || [];
        const allConferences = getLocal<Conference[]>('conferences') || [];

        const upcoming = rsvps
            .map(rsvp => allConferences.find(c => c.id === rsvp.eventId))
            .filter((c): c is Conference => !!c && isFuture(new Date(c.dateISO)))
            .map(c => ({
                id: c.id,
                type: 'upcoming_conference' as const,
                title: `Upcoming: ${c.title}`,
                description: format(new Date(c.dateISO), 'MMM d, yyyy @ h:mm a'),
                date: new Date(c.dateISO),
                cta: { label: 'Join', href: `/conferences/${c.slug}`},
                icon: Calendar
            }));

        const replays = rsvps
            .map(rsvp => allConferences.find(c => c.id === rsvp.eventId))
            .filter((c): c is Conference => !!c && isPast(new Date(c.dateISO)) && c.recordingAvailable)
            .map(c => ({
                id: c.id,
                type: 'replay_available' as const,
                title: `Replay available: ${c.title}`,
                description: `Ended ${formatDistanceToNow(new Date(c.dateISO), { addSuffix: true })}`,
                date: new Date(c.dateISO),
                cta: { label: 'Watch recording', href: `/conferences/${c.slug}`},
                icon: VideoIcon
            }));
        
        const combined = [...upcoming, ...replays]
            .sort((a,b) => b.date.getTime() - a.date.getTime());

        setActivities(combined);
    }, []);

    return (
        <Card>
            <CardContent className="pt-6">
                {activities.length > 0 ? (
                    <div className="space-y-4">
                        {activities.map(activity => (
                            <div key={activity.id} className="flex items-center justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <activity.icon className="h-4 w-4 text-muted-foreground mt-1" />
                                    <div className="text-sm">
                                        <p className="font-medium">{activity.title}</p>
                                        <p className="text-xs text-muted-foreground">{activity.description}</p>
                                    </div>
                                </div>
                                <Button asChild variant="outline" size="sm">
                                    <Link href={activity.cta.href}>{activity.cta.label}</Link>
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground text-center">No recent activity yet.</p>
                )}
            </CardContent>
        </Card>
    );
}

function RecommendationsTab() {
    const [recommendations, setRecommendations] = useState<ContentHubItem[]>([]);
    const router = useRouter();

    useEffect(() => {
        const getRecs = () => {
            seedContentHub();
            const allContent = getLocal<ContentHubItem[]>("ch_items") || [];
            const moodLog = getMoodLog();
            if (moodLog.length === 0) {
                setRecommendations(allContent.filter(item => item.featured && !item.deleted).slice(0, 3));
                return;
            };

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
                    .filter(item => !item.deleted && lowDimensions.some(dim => item.tags.includes(dim.charAt(0).toUpperCase() + dim.slice(1))))
                    .slice(0, 3);
                setRecommendations(recommendedContent);
            } else {
                 setRecommendations(allContent.filter(item => item.featured && !item.deleted).slice(0, 3));
            }
        }
        getRecs();
        window.addEventListener('storage', getRecs);
        return () => window.removeEventListener('storage', getRecs);
    }, []);
    
    const handleTopicClick = (topic: string) => {
        router.push(`/content-hub?topics=${encodeURIComponent(topic)}`);
    };

    return (
        <Card>
            <CardContent className="pt-6 space-y-4">
                {recommendations.length > 0 ? (
                    recommendations.map(item => <ContentHubCard key={item.id} item={item} onTopicClick={handleTopicClick} />)
                ) : (
                    <div className="text-center text-muted-foreground p-4">
                        <p>You’re doing great! New content will appear when your check-ins suggest it.</p>
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
        const loadFavorites = () => {
            seedConsultants();
            const allConsultants = getSession<Consultant[]>('discover.seed.v1') || [];
            const user = authLocal.getCurrentUser();
            const favoriteIds = user?.favorites.consultants || [];

            if (favoriteIds.length > 0) {
                setFavorites(allConsultants.filter(c => favoriteIds.includes(c.id)));
            } else {
                // Seed with demo favorites if user has none
                const demoFavorites = ["aeliana-rose", "seraphina-moon"]
                    .map(id => allConsultants.find(c => c.slug === id))
                    .filter((c): c is Consultant => !!c);
                setFavorites(demoFavorites);
            }
        };

        loadFavorites();

        const timer = setInterval(() => {
            setIsOnline(new Date().getMinutes() % 2 === 0);
        }, 60000);
        
        window.addEventListener('storage', loadFavorites);

        return () => {
            clearInterval(timer);
            window.removeEventListener('storage', loadFavorites);
        };
    }, []);
    
    const onlineFavorites = favorites.filter(fav => fav.availability.online);

    return (
        <Card>
            <CardContent className="pt-6 space-y-4">
                {onlineFavorites.length > 0 ? (
                    onlineFavorites.map((fav, index) => (
                        <div key={fav.id} className="flex items-center justify-between">
                            <Link href={`/discover/consultant/${fav.slug}`} className="flex items-center gap-3 group">
                                <Avatar>
                                    <AvatarImage src={fav.cover} />
                                    <AvatarFallback>{fav.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold group-hover:underline">{fav.name}</p>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <div className={cn("w-2 h-2 rounded-full", isOnline ? 'bg-green-500' : 'bg-gray-400')}></div>
                                        {isOnline ? "Online" : "Offline"}
                                    </div>
                                </div>
                            </Link>
                             <div className="flex gap-2">
                                <Button size="sm" variant="default" asChild>
                                    <Link href={`/discover/consultant/${fav.slug}#availability-section`}>Start</Link>
                                </Button>
                                <Button size="sm" asChild variant="outline">
                                    <Link href={`/discover/consultant/${fav.slug}/schedule`}>Schedule</Link>
                                </Button>
                            </div>
                        </div>
                    ))
                ) : (
                     <div className="text-center text-muted-foreground p-4">
                        <p>Your favorites aren’t online yet.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
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
