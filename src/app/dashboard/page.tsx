
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
import { Heart, Activity, Star as StarIcon, Sparkles, Check, CheckCircle, Flame } from "lucide-react";
import Link from "next/link";
import { format, formatDistanceToNow, isToday } from 'date-fns';
import { ContentHubItem, seedContentHub } from "@/lib/content-hub-seeder";
import { Consultant, seedConsultants } from "@/lib/consultants-seeder";
import { getSession } from "@/lib/session";
import { ZodiacSignModal } from "@/components/dashboard/zodiac-sign-modal";
import { DetailedHoroscope } from "@/components/dashboard/detailed-horoscope";
import { useRouter } from 'next/navigation';
import { getLocal } from "@/lib/local";
import { PlaceholderPage } from "@/components/placeholder-page";
import { AuthModal } from "@/components/auth-modal";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

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

    const checkUser = () => {
        const currentUser = authLocal.getCurrentUser();
        setUser(currentUser);
    };

    useEffect(() => {
        checkUser();
        setLoading(false);
        const handleStorageChange = () => checkUser();
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    if (loading) {
        return <PlaceholderPage title="Loading Dashboard..." />;
    }

    if (!user) {
        return (
            <>
                <PlaceholderPage 
                    title="Access Denied" 
                    description="Please log in to view your dashboard." 
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
                <div className="col-span-12 lg:col-span-4 space-y-8">
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
            title: "Funds Added",
            description: `€${amount.toFixed(2)} has been added to your wallet.`,
        });
    };

    return (
        <GlassCard>
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
        </GlassCard>
    );
}

function MoodCard({ onFirstCheckin }: { onFirstCheckin: () => void }) {
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
        
        if (todayIndex === -1) {
            onFirstCheckin(); // Trigger confetti on first save of the day
        }

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
        <GlassCard>
            <CardHeader>
                <CardTitle>How do you feel right now?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {(['Money', 'Health', 'Work', 'Love'] as const).map(dim => (
                    <div key={dim} className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <p className="font-medium mb-2 sm:mb-0">{dim}</p>
                        <StarRating 
                            rating={ratings[dim.toLowerCase() as keyof typeof ratings]} 
                            onRating={(r) => handleRating(dim.toLowerCase() as keyof typeof ratings, r)} 
                            size={24} 
                            interactive 
                            className="[&>svg:hover]:text-yellow-300 [&>svg:hover]:drop-shadow-[0_0_5px_rgba(252,211,77,0.7)]"
                        />
                    </div>
                ))}
            </CardContent>
            <CardFooter className="justify-between items-center">
                <Button onClick={handleSave} disabled={isSaveDisabled}>Save today’s mood</Button>
            </CardFooter>
        </GlassCard>
    );
}

function QuickTrends() {
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const moodLog = getMoodLog();
    if (moodLog.length > 0) {
      const lastEntry = moodLog[moodLog.length - 1];
      setLastCheckIn(formatDistanceToNow(new Date(lastEntry.dateISO), { addSuffix: true }));

      // Calculate streak
      let currentStreak = 0;
      if (moodLog.length > 0) {
        const sortedLog = [...moodLog].sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime());
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (isToday(new Date(sortedLog[0].dateISO))) {
          currentStreak = 1;
          for (let i = 0; i < sortedLog.length - 1; i++) {
            const currentDay = new Date(sortedLog[i].dateISO);
            const prevDay = new Date(sortedLog[i+1].dateISO);
            const diff = (currentDay.getTime() - prevDay.getTime()) / (1000 * 3600 * 24);
            if (diff === 1) {
              currentStreak++;
            } else {
              break;
            }
          }
        }
      }
      setStreak(currentStreak);
    }
  }, []);

  return (
    <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground p-3 rounded-lg bg-card/40 backdrop-blur-lg border border-white/10">
        <div className="flex items-center gap-2">
            <Badge variant={streak > 0 ? "secondary" : "outline"} className="gap-1.5">
                <Flame className={cn("h-4 w-4", streak > 0 ? "text-amber-400" : "text-muted-foreground")} />
                {streak} day streak
            </Badge>
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
                        Daily Horoscope
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
                            <p>Set your zodiac sign to see your daily horoscope.</p>
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
    return (
        <GlassCard>
        <Tabs defaultValue="activity" className="w-full">
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

function ActivityTab() {
    return (
        <Card>
            <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground text-center">No recent activity yet.</p>
            </CardContent>
        </Card>
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
            <CardContent className="pt-6 space-y-4">
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
            const demoFavorites = ["Aeliana Rose", "Seraphina Moon"]
                .map(name => allConsultants.find(c => c.name === name))
                .filter((c): c is Consultant => !!c);
            setFavorites(demoFavorites);
        } else {
            setFavorites(allConsultants.filter(c => favoriteIds.includes(c.id)));
        }

        const timer = setInterval(() => {
            setIsOnline(new Date().getMinutes() % 2 === 0);
        }, 60000);

        return () => clearInterval(timer);
    }, []);

    return (
        <Card>
            <CardContent className="pt-6 space-y-4">
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
                            <Button size="sm" asChild variant="outline">
                                <Link href={`/discover/consultant/${fav.slug}`}>View</Link>
                            </Button>
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
