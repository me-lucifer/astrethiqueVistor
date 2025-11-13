

"use client";

import { useState, useEffect, useTransition, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, formatDistanceToNow, isToday, isYesterday, endOfMonth, getDaysInMonth, getDate, differenceInDays, startOfMonth } from "date-fns";
import * as ics from "ics";
import { saveAs } from "file-saver";

// UI Component Imports
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AnimatePresence, motion } from "framer-motion";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Heart,
  Activity,
  Star as StarIcon,
  Sparkles,
  Flame,
  Wallet as WalletIcon,
  Info,
  BadgeInfo,
  ArrowDown,
  AlertTriangle,
  Receipt,
  ArrowUp,
  MoreHorizontal,
  Zap,
  Lock,
  Download,
  FileText,
  FileDown,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";


// Local Imports
import * as authLocal from "@/lib/authLocal";
import {
  getWallet,
  setLocal,
  getSpendLog,
  Wallet as WalletType,
  SpendLogEntry,
  addSpendLogEntry,
  spendFromWallet,
  getMoodMeta,
  EMERGENCY_TOPUP_LIMIT_EUR,
  getMoodLog,
  removeLocal,
  WALLET_KEY,
  SPEND_LOG_KEY,
} from "@/lib/local";
import { ContentHubCard } from "@/components/content-hub/card";
import { StarRating } from "@/components/star-rating";
import { ZodiacSignModal } from "@/components/dashboard/zodiac-sign-modal";
import { DetailedHoroscope } from "@/components/dashboard/detailed-horoscope";
import { PlaceholderPage } from "@/components/placeholder-page";
import { AuthModal } from "@/components/auth-modal";
import { getSession, setSession } from "@/lib/session";
import { seedConsultants } from "@/lib/consultants-seeder";
import { seedContentHub } from "@/lib/content-hub-seeder";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ActivityTab } from "@/components/dashboard/activity-tab";
import { BudgetWizardModal } from "@/components/budget/budget-wizard-modal";
import { TopUpModal } from "@/components/dashboard/top-up-modal";
import { EmergencyTopUpModal } from "@/components/dashboard/emergency-top-up-modal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";



// Type Imports
import type { MoodMeta } from "@/lib/local";
import type { Consultant } from "@/lib/consultants-seeder";
import type { ContentHubItem } from "@/lib/content-hub-seeder";


const Starfield = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden motion-reduce:hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.1)_0%,_rgba(255,255,255,0)_60%)] opacity-50" />
    <div className="absolute w-[2px] h-[2px] bg-white/50 rounded-full shadow-[0_0_10px_2px_#fff] top-[10%] left-[10%]" />
    <div className="absolute w-[1px] h-[1px] bg-white/50 rounded-full shadow-[0_0_8px_1px_#fff] top-[20%] left-[80%]" />
    <div className="absolute w-[1px] h-[1px] bg-white/50 rounded-full shadow-[0_0_8px_1px_#fff] top-[50%] left-[50%]" />
    <div className="absolute w-[2px] h-[2px] bg-white/50 rounded-full shadow-[0_0_10px_2px_#fff] top-[70%] left-[25%]" />
    <div className="absolute w-[1px] h-[1px] bg-white/50 rounded-full shadow-[0_0_8px_1px_#fff] top-[90%] left-[90%]" />
  </div>
);

const GlassCard = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <Card
    className={cn(
      "bg-card/60 backdrop-blur-lg border-white/10 shadow-lg transition-all duration-300 hover:border-white/20 hover:shadow-primary/10 motion-reduce:transition-none",
      className
    )}
  >
    {children}
  </Card>
);

// Main Component
export default function DashboardPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<authLocal.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isBudgetDemoModalOpen, setIsBudgetDemoModalOpen] = useState(false);
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
    const currentUser = authLocal.getCurrentUser();
    if (!currentUser) {
      router.push("/login");
      toast({
        variant: "destructive",
        title: "Please sign in to access your dashboard.",
      });
      return;
    }
    setUser(currentUser);
    setLoading(false);

    const handleStorageChange = (event: StorageEvent) => {
      checkUser();
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
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
        <AuthModal
          isOpen={true}
          onOpenChange={setIsAuthModalOpen}
          onLoginSuccess={checkUser}
        />
      </>
    );
  }

  const handleFirstCheckin = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

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
              className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none motion-reduce:animate-none"
            >
              <div className="text-6xl">🎉</div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="grid grid-cols-12 gap-8 items-start">
          <div className="col-span-12 lg:col-span-8 space-y-8">
            <WalletCard onBudgetClick={() => setIsBudgetModalOpen(true)} onBudgetDemoClick={() => setIsBudgetDemoModalOpen(true)} />
            <MoodCard onFirstCheckin={handleFirstCheckin} />
            <QuickTrends />
          </div>
          <div className="col-span-12 lg:col-span-4 space-y-8 lg:w-[384px]">
            <HoroscopeCard user={user} />
            <SidebarTabs />
          </div>
        </div>
      </div>
      <BudgetWizardModal isOpen={isBudgetModalOpen} onOpenChange={setIsBudgetModalOpen} />
      <BudgetWizardModal isOpen={isBudgetDemoModalOpen} onOpenChange={setIsBudgetDemoModalOpen} />
    </div>
  );
}

// Sub-components for the Dashboard
function WalletCard({ onBudgetClick, onBudgetDemoClick }: { onBudgetClick: () => void, onBudgetDemoClick: () => void }) {
  const [wallet, setWalletState] = useState<WalletType | null>(null);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isEmergencyTopUpOpen, setIsEmergencyTopUpOpen] = useState(false);
  const [isSetBudgetPromptOpen, setIsSetBudgetPromptOpen] = useState(false);
  const [isLockConfirmOpen, setIsLockConfirmOpen] = useState(false);
  const [isUnlockConfirmOpen, setIsUnlockConfirmOpen] = useState(false);
  const [topUpOnlyAmount, setTopUpOnlyAmount] = useState(0);
  const [isDev, setIsDev] = useState(false);
  const { toast } = useToast();

  const fetchWalletData = useCallback(() => {
    setWalletState(getWallet());
  }, []);

  useEffect(() => {
    setIsDev(process.env.NODE_ENV === 'development');
    fetchWalletData();
    window.addEventListener("storage", fetchWalletData);
    return () => window.removeEventListener("storage", fetchWalletData);
  }, [fetchWalletData]);

  const handleSpend = (amountCents: number, note: string) => {
    const spendResult = spendFromWallet(amountCents, 'other', note);
    if (!spendResult.ok) {
        toast({
            title: "Spend Failed",
            description: spendResult.message,
            variant: "destructive",
        });
    }
    fetchWalletData();
  }

  const handleDemoAction = (action: 'first_time' | 'seed' | 'lock' | 'reset_month' | 'new_month') => {
    let currentWallet = getWallet();
    let newWalletState: WalletType;
    switch (action) {
        case 'first_time':
             newWalletState = {...currentWallet, balance_cents: 0, budget_cents: 0, spent_this_month_cents: 0, wizardSeen: false, budget_set: false, budget_lock: { ...currentWallet.budget_lock, enabled: false, emergency_used: false, until: null } };
             toast({ title: "Simulating first-time view." });
             break;
        case 'seed':
            newWalletState = {...currentWallet, balance_cents: 1500, budget_cents: 3000, spent_this_month_cents: 0, wizardSeen: true, budget_set: true, budget_lock: { ...currentWallet.budget_lock, enabled: false, emergency_used: false, until: null } };
            toast({ title: "Demo wallet seeded." });
            break;
        case 'lock':
             newWalletState = {...currentWallet, budget_lock: { ...currentWallet.budget_lock, enabled: true, until: endOfMonth(new Date()).toISOString() } };
             toast({ title: "Budget Locked", description: "Your spending is now capped." });
             break;
        case 'reset_month':
             const now = new Date();
             newWalletState = {...currentWallet, spent_this_month_cents: 0, month: format(now, 'yyyy-MM'), budget_lock: { ...currentWallet.budget_lock, enabled: false, emergency_used: false, until: null } };
             toast({ title: "Monthly spend has been reset." });
            break;
        case 'new_month':
            const nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            newWalletState = {...currentWallet, spent_this_month_cents: 0, month: format(nextMonth, 'yyyy-MM'), budget_lock: { ...currentWallet.budget_lock, enabled: false, emergency_used: false, until: null }, budget_cents: 0, wizardSeen: false, budget_set: false, balance_cents: currentWallet.balance_cents };
            toast({ title: "Simulating a completely new month."});
            break;
    }
    setLocal(WALLET_KEY, newWalletState);
    fetchWalletData();
  }
  
  const handleToggleLock = (lock: boolean) => {
    if (!wallet) return;

    if (lock) {
      if (!wallet.budget_set) {
        toast({ title: "Set a Budget First", description: "You need to set a budget before you can lock it.", variant: "destructive" });
        onBudgetClick();
        return;
      }
      setIsLockConfirmOpen(true);
    } else {
      setIsUnlockConfirmOpen(true);
    }
  }

  const confirmLock = () => {
    if (!wallet) return;
    const updatedWallet: WalletType = {
      ...wallet,
      budget_lock: {
        ...wallet.budget_lock,
        enabled: true,
        until: endOfMonth(new Date()).toISOString(),
      }
    };
    setLocal(WALLET_KEY, updatedWallet);
    toast({ title: "Budget locked" });
    setIsLockConfirmOpen(false);
  };
  
  const confirmUnlock = () => {
    if (!wallet) return;
    const updatedWallet: WalletType = {
      ...wallet,
      budget_lock: {
        ...wallet.budget_lock,
        enabled: false,
        until: null,
      }
    };
    setLocal(WALLET_KEY, updatedWallet);
    toast({ title: "Budget unlocked" });
    setIsUnlockConfirmOpen(false);
  };
  
  const handleQuickTopUp = (amount: number) => {
      if(wallet && !wallet.budget_set && wallet.balance_cents === 0) {
          setTopUpOnlyAmount(amount);
          setIsSetBudgetPromptOpen(true);
      } else {
          setIsTopUpOpen(true);
      }
  }

  const handleTopUpOnly = () => {
      setIsSetBudgetPromptOpen(false);
      setIsTopUpOpen(true);
  }

  const handleResetDemo = () => {
    removeLocal(WALLET_KEY);
    removeLocal(SPEND_LOG_KEY);
    fetchWalletData();
    toast({ title: "Demo activity has been reset." });
  }


  if (!wallet) {
    return (
      <GlassCard>
        <CardContent className="p-6">
          <div className="h-24 bg-muted animate-pulse rounded-md" />
        </CardContent>
      </GlassCard>
    );
  }

  const { balance_cents: balance, spent_this_month_cents: monthSpend, budget_cents: budget, wizardSeen, budget_set, budget_lock } = wallet;
  const locked = budget_lock.enabled;
  const lockEmergencyUsed = budget_lock.emergency_used;
  const monthEnd = wallet.monthEnd;
  const remaining = Math.max(0, budget - monthSpend);
  const progress = wizardSeen && budget > 0 ? (monthSpend / budget) * 100 : 0;
  const daysLeft = monthEnd ? differenceInDays(new Date(monthEnd), new Date()) : 30;

  const progressColor = locked ? "bg-muted-foreground" : progress > 80 ? "bg-destructive" : progress > 50 ? "bg-amber-500" : "bg-success";
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(amount / 100);
  };
  
  return (
    <>
    <TooltipProvider>
      <GlassCard className="flex flex-col motion-reduce:transition-none">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Wallet & Budget
            </CardTitle>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-1">
                {(wizardSeen || budget_set || balance > 0) && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="text-lg font-bold cursor-help" aria-live="polite">
                        Balance: <span className="ml-1">{formatCurrency(balance)}</span>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Funds available for sessions & content.</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {isDev && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="h-4 w-4"/></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onBudgetDemoClick()}>Demo Budget Wizard</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDemoAction('first_time')}>Simulate first-time view</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDemoAction('seed')}>Seed €15 / Budget €30</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDemoAction('lock')}>Lock Wallet</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDemoAction('reset_month')}>Reset Month</DropdownMenuItem>
                      <DropdownMenuItem onSelect={(e) => {e.preventDefault(); handleSpend(700, "Demo spend €7")}}>Spend €7 (guard)</DropdownMenuItem>
                      <DropdownMenuItem onSelect={(e) => {e.preventDefault(); handleSpend(5000, "Demo spend €50")}}>Try spend €50</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDemoAction('new_month')}>New month</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleResetDemo(); }}>
                        <span className="text-destructive">Reset demo activity</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
               {budget_set && (
                 <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span tabIndex={0} className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Info className="h-3 w-3" />
                            Emergency top-up: €20 (once) when locked
                        </span>
                      </TooltipTrigger>
                      <TooltipContent><p>Add up to €{EMERGENCY_TOPUP_LIMIT_EUR} once per locked period.</p></TooltipContent>
                    </Tooltip>
                    <Label htmlFor="lock-switch-header" className="text-sm sr-only">{locked ? 'Locked' : 'Unlocked'}</Label>
                    <Switch id="lock-switch-header" checked={locked} onCheckedChange={(c) => handleToggleLock(c)} aria-label="Lock budget"/>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 flex-grow">
          {!wizardSeen && balance === 0 ? (
            <Card className="bg-primary/10 border-primary/20 text-center p-6 space-y-3">
              <CardTitle className="text-base">Set a monthly budget to stay in control.</CardTitle>
              <CardDescription className="text-sm">Use our quick wizard to calculate a budget based on your income and expenses.</CardDescription>
              <div className="flex flex-wrap justify-center gap-2">
                <Button onClick={onBudgetClick}>Set up now</Button>
                <Button variant="ghost" className="text-xs" onClick={() => handleQuickTopUp(5)}>Top up €5</Button>
                <Button variant="ghost" className="text-xs" onClick={() => handleQuickTopUp(10)}>Top up €10</Button>
                <Button variant="ghost" className="text-xs" onClick={() => handleQuickTopUp(25)}>Top up €25</Button>
              </div>
            </Card>
          ) : !budget_set && balance > 0 ? (
            <div className="space-y-4 text-center">
                <h3 className="font-semibold">You've added funds</h3>
                <p className="text-sm text-muted-foreground">Set a monthly budget to avoid overspending.</p>
                <div className="flex justify-center gap-2 pt-2">
                    <Button onClick={onBudgetClick}>Set up budget</Button>
                    <Button variant="secondary" onClick={() => handleToggleLock(true)}>Lock Wallet</Button>
                </div>
            </div>
          ) : (
            <div className="space-y-4">
              <motion.div layout>
                <div className="flex justify-between items-center text-sm text-muted-foreground mb-1">
                  <span aria-live="polite">This month</span>
                  <span aria-live="polite">{formatCurrency(monthSpend)} / {formatCurrency(budget)}</span>
                </div>
                <Progress 
                  value={progress} 
                  indicatorClassName={cn("motion-reduce:transition-none transition-all duration-200 ease-in-out", progressColor)} 
                  aria-label={`Monthly spending: ${progress.toFixed(0)}% of budget`} 
                  aria-valuenow={monthSpend}
                  aria-valuemin={0}
                  aria-valuemax={budget}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <Badge variant="outline" className="font-normal" aria-live="polite">Remaining: {formatCurrency(remaining)}</Badge>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="font-normal">Days left: {daysLeft}</Badge>
                  </div>
                </div>
              </motion.div>
              
              {locked && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                  <Card className="bg-muted/50 border-amber-500/20">
                    <CardHeader className="flex-row items-center justify-between p-4">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="space-y-1" tabIndex={0}>
                            <CardTitle className="text-base flex items-center gap-2 text-amber-500">
                              <Lock className="h-4 w-4"/>
                              Budget locked until {monthEnd ? format(new Date(monthEnd), "MMM dd") : ''}
                            </CardTitle>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent><p>Your spending is capped for the month.</p></TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span tabIndex={0}>
                            <Button variant="ghost" size="sm" className="text-amber-500 hover:text-amber-400 gap-1.5 h-auto py-0 px-1" onClick={() => setIsEmergencyTopUpOpen(true)} disabled={lockEmergencyUsed} aria-label="Use emergency top-up">
                              <Zap className="h-4 w-4"/> Emergency top-up
                            </Button>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          {lockEmergencyUsed ? <p>Emergency top-up already used for this period.</p> : <p>Add up to €{EMERGENCY_TOPUP_LIMIT_EUR} once per locked period.</p>}
                        </TooltipContent>
                      </Tooltip>
                    </CardHeader>
                  </Card>
                </motion.div>
              )}
            </div>
          )}
        </CardContent>
        {(wizardSeen || budget_set) && (
          <CardFooter className="flex justify-between items-center mt-auto border-t pt-4">
            <div className="flex gap-2">
              <Button onClick={() => setIsTopUpOpen(true)} size="sm" disabled={locked && lockEmergencyUsed}>Top up</Button>
              <Button onClick={onBudgetClick} variant="outline" size="sm">Change budget</Button>
            </div>
             <HistoryDrawer />
          </CardFooter>
        )}
        <p className="text-xs text-muted-foreground text-center p-2">Spending uses wallet balance only. Budgets reset monthly.</p>
      </GlassCard>
    </TooltipProvider>

    <Dialog open={isSetBudgetPromptOpen} onOpenChange={setIsSetBudgetPromptOpen}>
        <DialogContent className="sm:max-w-xs">
            <DialogHeader>
                <DialogTitle className="text-center">Set Budget First?</DialogTitle>
                <DialogDescription className="text-center">Setting a budget helps you keep spending in check.</DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col sm:flex-col sm:space-x-0 gap-2 pt-4">
                <Button onClick={() => { setIsSetBudgetPromptOpen(false); onBudgetClick(); }}>Set Up Now</Button>
                <Button variant="ghost" onClick={handleTopUpOnly}>Top Up Only</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    <Dialog open={isLockConfirmOpen} onOpenChange={setIsLockConfirmOpen}>
        <DialogContent className="sm:max-w-xs">
            <DialogHeader>
                <DialogTitle className="text-center">Lock your wallet?</DialogTitle>
                <DialogDescription className="text-center">You’ll only be able to make ONE emergency top-up of €20 this month.</DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col sm:flex-col sm:space-x-0 gap-2 pt-4">
                <Button onClick={confirmLock}>Confirm</Button>
                <Button variant="ghost" onClick={() => setIsLockConfirmOpen(false)}>Cancel</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    <Dialog open={isUnlockConfirmOpen} onOpenChange={setIsUnlockConfirmOpen}>
        <DialogContent className="sm:max-w-xs">
            <DialogHeader>
                <DialogTitle className="text-center">Unlock wallet?</DialogTitle>
                <DialogDescription className="text-center">You’ll be able to spend normally from your balance. Budget cap still applies.</DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col sm:flex-col sm:space-x-0 gap-2 pt-4">
                <Button onClick={confirmUnlock}>Confirm</Button>
                <Button variant="ghost" onClick={() => setIsUnlockConfirmOpen(false)}>Cancel</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    <TopUpModal isOpen={isTopUpOpen} onOpenChange={setIsTopUpOpen} />
    <EmergencyTopUpModal isOpen={isEmergencyTopUpOpen} onOpenChange={setIsEmergencyTopUpOpen} />
    </>
  );
}


function HistoryDrawer() {
  const [log, setLog] = useState<SpendLogEntry[]>([]);
  const [filter, setFilter] = useState('All');
  const [selectedTransaction, setSelectedTransaction] = useState<SpendLogEntry | null>(null);
  
  const filterChips = ["All", "Credits", "Debits", "Sessions", "Purchases", "Top-ups", "Adjustments"];

  const handleTriggerClick = () => {
    let runningBalance = getWallet().balance_cents;
    const rawLog = getSpendLog();
    const processedLog: SpendLogEntry[] = [];
    
    for (let i = 0; i < rawLog.length; i++) {
        const entry = rawLog[i];
        processedLog.push({ ...entry, runningBalance: runningBalance / 100 });
        runningBalance -= entry.amount_cents;
    }

    setLog(processedLog);
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(amount);
  };
  
  const filteredLog = useMemo(() => {
    if (filter === 'All') return log;
    if (filter === 'Credits') return log.filter(e => e.amount_cents > 0);
    if (filter === 'Debits') return log.filter(e => e.amount_cents < 0);
    if (filter === 'Sessions') return log.filter(e => e.type === 'consultation');
    if (filter === 'Purchases') return log.filter(e => e.type === 'horoscope');
    if (filter === 'Top-ups') return log.filter(e => e.type === 'topup' || e.type === 'emergency');
    if (filter === 'Adjustments') return log.filter(e => e.type === 'other');
    return log;
  }, [log, filter]);
  
  const downloadInvoice = () => {
    if (!selectedTransaction) return;
    const blob = new Blob(["This is a placeholder PDF invoice."], { type: "application/pdf" });
    saveAs(blob, `invoice-${new Date(selectedTransaction.ts).getTime()}.pdf`);
  };
    
  const downloadCreditNote = () => {
    if (!selectedTransaction) return;
    const blob = new Blob(["This is a placeholder PDF credit note."], { type: "application/pdf" });
    saveAs(blob, `credit-note-${new Date(selectedTransaction.ts).getTime()}.pdf`);
  };

  const iconMap: Record<SpendLogEntry['type'], React.ReactNode> = {
    topup: <ArrowUp className="h-4 w-4 text-success" />,
    emergency: <Zap className="h-4 w-4 text-amber-500" />,
    horoscope: <StarIcon className="h-4 w-4 text-primary" />,
    consultation: <Receipt className="h-4 w-4 text-muted-foreground" />,
    other: <Info className="h-4 w-4 text-muted-foreground" />,
  }

  return (
    <>
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="link" className="text-xs text-muted-foreground" onClick={handleTriggerClick}>
          History
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col">
        <SheetHeader>
          <div className="flex justify-between items-center">
            <SheetTitle>Transaction History</SheetTitle>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild><Link href="/account/billing"><FileText className="h-3 w-3 mr-2"/>View All</Link></Button>
            </div>
          </div>
        </SheetHeader>
        <div className="py-4">
            <div className="flex flex-wrap gap-2">
                {filterChips.map(f => (
                    <Button key={f} size="sm" variant={filter === f ? 'secondary' : 'outline'} onClick={() => setFilter(f)}>{f}</Button>
                ))}
            </div>
        </div>
        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          {filteredLog.length > 0 ? (
            <div className="space-y-4">
                {filteredLog.map(entry => (
                <div key={entry.ts} className="flex justify-between items-start cursor-pointer hover:bg-muted/50 p-2 rounded-md" onClick={() => setSelectedTransaction(entry)}>
                    <div className="flex items-start gap-3">
                        {iconMap[entry.type]}
                        <div>
                            <p className="font-medium text-sm">{entry.note}</p>
                            <p className="text-xs text-muted-foreground">{new Date(entry.ts).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}</p>
                            {/* @ts-ignore */}
                            {entry.status === 'refunded' && <Badge variant="destructive" className="mt-1 text-xs font-normal">Refunded</Badge>}
                        </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                       <p className={cn("font-semibold text-sm", entry.amount_cents > 0 ? 'text-success' : 'text-foreground')}>
                            {entry.amount_cents > 0 ? '+' : ''}{formatCurrency(entry.amount_cents / 100)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Bal: {formatCurrency(entry.runningBalance || 0)}
                        </p>
                        {/* @ts-ignore */}
                        {entry.invoiceAvailable && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="link" size="sm" onClick={downloadInvoice} className="h-auto p-0 text-xs text-muted-foreground mt-1 gap-1">
                                            <FileText className="h-3 w-3" />
                                            Invoice
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Download official receipt (demo)</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                        {/* @ts-ignore */}
                        {entry.creditNoteUrl && (
                             <Button variant="link" size="sm" onClick={downloadCreditNote} className="h-auto p-0 text-xs text-muted-foreground mt-1">Credit Note</Button>
                        )}
                    </div>
                </div>
            ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground space-y-3">
                <p>No activity for this filter.</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
    
    <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Transaction Details</DialogTitle>
            </DialogHeader>
            {selectedTransaction && (
                <div className="space-y-4">
                    <p><strong>Invoice Number:</strong> INV-{new Date(selectedTransaction.ts).getTime()}</p>
                    <p><strong>Description:</strong> {selectedTransaction.note}</p>
                    <p><strong>Amount:</strong> {formatCurrency(selectedTransaction.amount_cents / 100)}</p>
                    <p><strong>Method:</strong> Wallet</p>
                    <p><strong>VAT (23%):</strong> {formatCurrency((selectedTransaction.amount_cents / 100) * 0.23)}</p>
                    {/* @ts-ignore */}
                    {selectedTransaction.status === 'refunded' && (
                        <div>
                             <Button variant="link" onClick={downloadCreditNote} className="p-0 h-auto">Download Credit Note</Button>
                        </div>
                    )}
                </div>
            )}
            <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedTransaction(null)}>Close</Button>
                 {/* @ts-ignore */}
                {selectedTransaction?.invoiceAvailable && (
                    <Button onClick={downloadInvoice}><FileDown className="h-4 w-4 mr-2" />Download PDF</Button>
                )}
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}


function MoodCard({ onFirstCheckin }: { onFirstCheckin: () => void }) {
  type Ratings = { money: number; health: number; work: number; love: number };
  const [ratings, setRatings] = useState<Ratings>({
    money: 0,
    health: 0,
    work: 0,
    love: 0,
  });
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleRating = (dimension: keyof Ratings, value: number) => {
    setRatings((prevRatings) => ({ ...prevRatings, [dimension]: value }));
  };

  useEffect(() => {
    const moodLog = getMoodLog();
    const today = new Date().toISOString().split('T')[0];
    const todayEntry = moodLog.find((entry) => entry.dateISO === today);
    if (todayEntry) {
      setRatings({
        money: todayEntry.money,
        health: todayEntry.health,
        work: todayEntry.work,
        love: todayEntry.love,
      });
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      startTransition(() => {
        if (Object.values(ratings).every(r => r === 0)) return;

        const today = new Date().toISOString().split('T')[0];
        const moodLog = getMoodLog();
        const moodMeta = getMoodMeta() || { streak: 0, lastCheckIn: "" };

        let newStreak = moodMeta.streak;
        const lastDate = moodMeta.lastCheckIn
          ? new Date(moodMeta.lastCheckIn)
          : null;
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

        const todayIndex = moodLog.findIndex(
          (entry) => entry.dateISO === today
        );
        if (todayIndex > -1) {
          moodLog[todayIndex] = {
            ...moodLog[todayIndex],
            ...ratings,
            dateISO: today,
          };
        } else {
          moodLog.push({ dateISO: today, ...ratings });
        }

        setSession('ast_mood_log', moodLog);
        setSession('ast_mood_meta', {
          streak: newStreak,
          lastCheckIn: todayDate.toISOString(),
        });
        window.dispatchEvent(new Event('storage'));
      });
    }, 500);

    return () => clearTimeout(handler);
  }, [ratings, onFirstCheckin, toast]);

  return (
    <GlassCard>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          How do you feel right now?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {(["Money", "Health", "Work", "Love"] as const).map((dim) => (
          <div
            key={dim}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="font-medium mb-2 sm:mb-0">{dim}</p>
            <StarRating
              rating={ratings[dim.toLowerCase() as keyof Ratings]}
              onRating={(r) =>
                handleRating(dim.toLowerCase() as keyof Ratings, r)
              }
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
    window.addEventListener("storage", updateTrends);
    return () => window.removeEventListener("storage", updateTrends);
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
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [isEmergencyTopUpOpen, setIsEmergencyTopUpOpen] = useState(false);


  const handleZodiacSave = (sign: authLocal.User["zodiacSign"]) => {
    if (user) {
      authLocal.updateUser(user.id, { zodiacSign: sign });
    }
    setIsModalOpen(false);
  };

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
              <p className="font-semibold mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Today for{" "}
                {zodiacSign}
              </p>
              <p className="text-sm text-muted-foreground">{horoscope}</p>
            </div>
          ) : (
            <div className="text-center text-muted-foreground p-4 border-dashed border-2 rounded-lg">
              <p>Set your zodiac sign to unlock your free daily reading.</p>
              <Button variant="link" onClick={() => setIsModalOpen(true)}>
                Set your zodiac sign
              </Button>
            </div>
          )}
          <div className="mt-6 border-t pt-4">
            <DetailedHoroscope 
              user={user} 
              onLockError={() => setIsLockModalOpen(true)} 
              onEmergencyTopUpNeeded={() => setIsEmergencyTopUpOpen(true)} 
            />
          </div>
        </CardContent>
      </GlassCard>
      <ZodiacSignModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleZodiacSave}
        currentSign={user?.zodiacSign}
      />
      <Dialog open={isLockModalOpen} onOpenChange={setIsLockModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Budget Lock active</DialogTitle>
            <DialogDescription>
              Your budget is locked. You can't make this purchase now.
              Would you like to use your one-time emergency top-up?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsLockModalOpen(false)}>Cancel</Button>
            <Button onClick={() => { setIsLockModalOpen(false); setIsEmergencyTopUpOpen(true); }}>Use Emergency Funds</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <EmergencyTopUpModal isOpen={isEmergencyTopUpOpen} onOpenChange={setIsEmergencyTopUpOpen} />
    </>
  );
}


function SidebarTabs() {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window === "undefined") return "activity";
    return getSession<string>("dash.activeTab") || "activity";
  });

  useEffect(() => {
    setSession("dash.activeTab", activeTab);
  }, [activeTab]);

  return (
    <GlassCard>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="activity">
            <Activity className="w-4 h-4 mr-2" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            <StarIcon className="w-4 h-4 mr-2" />
            For You
          </TabsTrigger>
          <TabsTrigger value="favorites">
            <Heart className="w-4 h-4 mr-2" />
            Favorites
          </TabsTrigger>
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
  );
}

function RecommendationsTab() {
  const [recommendations, setRecommendations] = useState<ContentHubItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    const getRecs = () => {
      seedContentHub();
      const allContent = getSession<ContentHubItem[]>("ch_items") || [];
      const moodLog = getMoodLog();
      if (moodLog.length === 0) {
        setRecommendations(
          allContent.filter((item) => item.featured && !item.deleted).slice(0, 3)
        );
        return;
      }

      const last7Days = moodLog.slice(-7);
      const averages = {
        money:
          last7Days.reduce((sum, entry) => sum + entry.money, 0) /
          last7Days.length,
        health:
          last7Days.reduce((sum, entry) => sum + entry.health, 0) /
          last7Days.length,
        work:
          last7Days.reduce((sum, entry) => sum + entry.work, 0) /
          last7Days.length,
        love:
          last7Days.reduce((sum, entry) => sum + entry.love, 0) /
          last7Days.length,
      };

      const lowDimensions = (Object.keys(averages) as (keyof typeof averages)[])
        .filter((dim) => averages[dim] <= 3);

      if (lowDimensions.length > 0) {
        const recommendedContent = allContent
          .filter(
            (item) =>
              !item.deleted &&
              lowDimensions.some((dim) =>
                item.tags.includes(dim.charAt(0).toUpperCase() + dim.slice(1))
              )
          )
          .slice(0, 3);
        setRecommendations(recommendedContent);
      } else {
        setRecommendations(
          allContent.filter((item) => item.featured && !item.deleted).slice(0, 3)
        );
      }
    };
    getRecs();
    window.addEventListener("storage", getRecs);
    return () => window.removeEventListener("storage", getRecs);
  }, [router]);

  const handleTopicClick = (topic: string) => {
    router.push(`/content-hub?topics=${encodeURIComponent(topic)}`);
  };

  return (
    <CardContent className="pt-6 space-y-4">
      {recommendations.length > 0 ? (
        recommendations.map((item) => (
          <ContentHubCard
            key={item.id}
            item={item}
            onTopicClick={handleTopicClick}
          />
        ))
      ) : (
        <div className="text-center text-muted-foreground p-4">
          <p>
            You’re doing great! New content will appear when your check-ins
            suggest it.
          </p>
        </div>
      )}
    </CardContent>
  );
}

function FavoritesTab() {
  const [favorites, setFavorites] = useState<Consultant[]>([]);
  const [isOnline, setIsOnline] = useState(new Date().getMinutes() % 2 === 0);

  useEffect(() => {
    const loadFavorites = () => {
      seedConsultants();
      const allConsultants = getSession<Consultant[]>("discover.seed.v1") || [];
      const user = authLocal.getCurrentUser();
      const favoriteIds = user?.favorites.consultants || [];

      if (favoriteIds.length > 0) {
        setFavorites(allConsultants.filter((c) => favoriteIds.includes(c.id)));
      } else {
        // Seed with demo favorites if user has none
        const demoFavorites = ["aeliana-rose", "seraphina-moon"]
          .map((id) => allConsultants.find((c) => c.slug === id))
          .filter((c): c is Consultant => !!c);
        setFavorites(demoFavorites);
      }
    };

    loadFavorites();

    const timer = setInterval(() => {
      setIsOnline(new Date().getMinutes() % 2 === 0);
    }, 60000);

    window.addEventListener("storage", loadFavorites);

    return () => {
      clearInterval(timer);
      window.removeEventListener("storage", loadFavorites);
    };
  }, []);

  const onlineFavorites = favorites.filter((fav) => fav.availability.online);

  return (
    <CardContent className="pt-6 space-y-4">
      {onlineFavorites.length > 0 ? (
        onlineFavorites.map((fav, index) => (
          <div key={fav.id} className="flex items-center justify-between">
            <Link
              href={`/discover/consultant/${fav.slug}`}
              className="flex items-center gap-3 group"
            >
              <div className="relative">
                <img src={fav.cover} alt={fav.name} className="h-10 w-10 rounded-full object-cover" />
                <div
                    className={cn(
                      "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background",
                      isOnline ? "bg-green-500" : "bg-gray-400"
                    )}
                  ></div>
              </div>
              <div>
                <p className="font-semibold group-hover:underline">{fav.name}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      isOnline ? "bg-green-500" : "bg-gray-400"
                    )}
                  ></div>
                  {isOnline ? "Online" : "Offline"}
                </div>
              </div>
            </Link>
            <div className="flex gap-2">
              <Button size="sm" variant="default" asChild>
                <Link
                  href={`/discover/consultant/${fav.slug}#availability-section`}
                >
                  Start
                </Link>
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
  );
}

const horoscopeData: { [key: string]: string } = {
  Aries:
    "Today is a day for bold action. Your energy is high, making it a great time to start new projects.",
  Taurus:
    "Focus on grounding yourself. A connection with nature could bring you unexpected peace and clarity.",
  Gemini:
    "Your communication skills are sharp today. Express your ideas, as they are likely to be well-received.",
  Cancer:
    "Tend to your emotional well-being. A quiet evening at home will recharge your batteries more than you think.",
  Leo:
    "Your creativity is flowing. It's a perfect day to engage in artistic pursuits or share your passions with others.",
  Virgo:
    "Organization is your friend today. Tackling a cluttered space will bring a surprising amount of mental clarity.",
  Libra:
    "Focus on balance in your relationships. A thoughtful conversation can resolve a lingering tension.",
  Scorpio:
    "Your intuition is heightened. Trust your gut feelings, especially in financial or career matters.",
  Sagittarius:
    "Adventure is calling. Even a small change in routine can lead to exciting new discoveries.",
  Capricorn:
    "Your hard work is about to pay off. Stay focused on your goals, as a breakthrough is near.",
  Aquarius:
    "Connect with your community. A group activity could spark a brilliant new idea or friendship.",
  Pisces:
    "Embrace your dreamy side. Allow yourself time for creative visualization and spiritual reflection.",
};

    

      

    


    




