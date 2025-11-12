
"use client";

import { useState, useEffect, useMemo } from 'react';
import { getWallet, getSpendLog, type SpendLogEntry } from '@/lib/local';
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { saveAs } from 'file-saver';
import { Calendar as CalendarIcon, Search, ArrowUp, ArrowDown, FileText, FileDown, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as authLocal from '@/lib/authLocal';
import { useRouter } from 'next/navigation';

const filterChips = ["All", "Credits", "Debits", "Sessions", "Purchases", "Top-ups", "Adjustments"];

export default function BillingPage() {
    const router = useRouter();
    const [log, setLog] = useState<SpendLogEntry[]>([]);
    const [dateRange, setDateRange] = useState<DateRange | undefined>({ from: subDays(new Date(), 30), to: new Date() });
    const [filterType, setFilterType] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTransaction, setSelectedTransaction] = useState<SpendLogEntry | null>(null);

    useEffect(() => {
        if (!authLocal.getCurrentUser()) {
            router.push('/');
            return;
        }

        let runningBalance = getWallet().balance_cents;
        const rawLog = getSpendLog();
        const processedLog: SpendLogEntry[] = [];
        
        for (let i = 0; i < rawLog.length; i++) {
            const entry = rawLog[i];
            processedLog.push({ ...entry, runningBalance: runningBalance / 100 });
            runningBalance -= entry.amount_cents;
        }

        setLog(processedLog);
    }, [router]);

    const filteredLog = useMemo(() => {
        return log.filter(entry => {
            const entryDate = new Date(entry.ts);
            
            // Date range filter
            if (dateRange?.from && (entryDate < dateRange.from || entryDate > (dateRange.to || new Date()))) return false;

            // Type filter
            if (filterType !== 'All') {
                if (filterType === 'Credits' && entry.amount_cents <= 0) return false;
                if (filterType === 'Debits' && entry.amount_cents >= 0) return false;
                if (filterType === 'Sessions' && entry.type !== 'consultation') return false;
                if (filterType === 'Purchases' && entry.type !== 'horoscope') return false;
                if (filterType === 'Top-ups' && !['topup', 'emergency'].includes(entry.type)) return false;
                if (filterType === 'Adjustments' && entry.type !== 'other') return false;
            }

            // Search term filter
            if (searchTerm && !entry.note.toLowerCase().includes(searchTerm.toLowerCase())) return false;

            return true;
        });
    }, [log, dateRange, filterType, searchTerm]);

    const summary = useMemo(() => {
        const now = new Date();
        const thisMonthRange = { start: startOfMonth(now), end: endOfMonth(now) };

        return filteredLog.reduce((acc, entry) => {
            const amount = entry.amount_cents / 100;
            if (amount > 0) acc.credits += amount;
            else acc.debits += amount;

            if (entry.type === 'topup' && isWithinInterval(new Date(entry.ts), thisMonthRange)) {
                acc.thisMonthTopUps += amount;
            }
            
            return acc;
        }, { credits: 0, debits: 0, thisMonthTopUps: 0 });
    }, [filteredLog]);

    const downloadInvoice = () => {
        if (!selectedTransaction) return;
        const blob = new Blob(["This is a placeholder PDF invoice."], { type: "application/pdf" });
        saveAs(blob, `invoice-${new Date(selectedTransaction.ts).getTime()}.pdf`);
    };

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(amount);

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Billing & Transactions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="bg-card/50">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><ArrowUp className="text-success"/>Total Credits</CardTitle>
                                <p className="text-2xl font-bold">{formatCurrency(summary.credits)}</p>
                            </CardHeader>
                        </Card>
                        <Card className="bg-card/50">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><ArrowDown className="text-destructive"/>Total Debits</CardTitle>
                                <p className="text-2xl font-bold">{formatCurrency(summary.debits)}</p>
                            </CardHeader>
                        </Card>
                         <Card className="bg-card/50">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Receipt />Net Spend</CardTitle>
                                <p className="text-2xl font-bold">{formatCurrency(summary.credits + summary.debits)}</p>
                            </CardHeader>
                        </Card>
                        <Card className="bg-card/50">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium text-muted-foreground">This Month's Top-ups</CardTitle>
                                <p className="text-2xl font-bold">{formatCurrency(summary.thisMonthTopUps)}</p>
                            </CardHeader>
                        </Card>
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-col md:flex-row gap-2">
                             <Popover>
                                <PopoverTrigger asChild>
                                    <Button id="date" variant={"outline"} className="w-full md:w-auto justify-start text-left font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateRange?.from ? (dateRange.to ? `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}` : format(dateRange.from, "LLL dd, y")) : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} />
                                </PopoverContent>
                            </Popover>
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input placeholder="Search descriptions..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                            <Button variant="outline"><FileText className="h-4 w-4 mr-2"/>Export CSV</Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {filterChips.map(f => (
                                <Button key={f} size="sm" variant={filterType === f ? 'secondary' : 'outline'} onClick={() => setFilterType(f)}>{f}</Button>
                            ))}
                        </div>
                    </div>
                    
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date/Time</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="text-right">Balance After</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Invoice</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredLog.map(entry => (
                                <TableRow key={entry.ts} className="cursor-pointer" onClick={() => setSelectedTransaction(entry)}>
                                    <TableCell>{format(new Date(entry.ts), 'MMM d, yyyy, HH:mm')}</TableCell>
                                    <TableCell className="capitalize">{entry.type}</TableCell>
                                    <TableCell>{entry.note}</TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant={entry.amount_cents > 0 ? "secondary" : "destructive"} className="font-mono">
                                            {entry.amount_cents > 0 ? '+' : ''}{formatCurrency(entry.amount_cents / 100)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-mono">{formatCurrency(entry.runningBalance || 0)}</TableCell>
                                    <TableCell><Badge variant="outline">Completed</Badge></TableCell>
                                    <TableCell className="text-right">
                                        {entry.amount_cents < 0 && <Button variant="link" size="sm" className="p-0 h-auto">View</Button>}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {filteredLog.length === 0 && <p className="text-center text-muted-foreground py-8">No transactions match your filters.</p>}
                </CardContent>
            </Card>

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
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedTransaction(null)}>Close</Button>
                        <Button onClick={downloadInvoice}><FileDown className="h-4 w-4 mr-2" />Download PDF</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
