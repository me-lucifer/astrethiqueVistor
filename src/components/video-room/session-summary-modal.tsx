
"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StarRating } from '../star-rating';
import { Textarea } from '../ui/textarea';
import { Note } from './side-panel';
import { formatTimestamp } from '@/lib/utils';
import { getWallet, spendFromWallet } from '@/lib/local';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Lock } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Input } from '../ui/input';

interface SessionSummaryModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    duration: number;
    rate: number;
    consultantName: string;
    onClose: () => void;
}

const tipAmounts = [0, 2, 5];

export function SessionSummaryModal({ isOpen, onOpenChange, duration, rate, consultantName, onClose }: SessionSummaryModalProps) {
    const { toast } = useToast();
    const [notes, setNotes] = useState<Note[]>([]);
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [tip, setTip] = useState(0);
    const [customTip, setCustomTip] = useState("");
    const [isBudgetLocked, setIsBudgetLocked] = useState(false);
    
    const sessionCost = (duration / 60) * rate;
    const newBalance = Math.max(0, getWallet().balance_cents / 100 - sessionCost);

    useEffect(() => {
        if (isOpen) {
            console.log('call_end', { duration, cost: sessionCost });
            const savedNotesJSON = localStorage.getItem('sessionNotes');
            if (savedNotesJSON) {
                setNotes(JSON.parse(savedNotesJSON));
            }
            setIsBudgetLocked(getWallet().budget_lock.enabled);
        }
    }, [isOpen, duration, sessionCost]);

    const handleSaveAndClose = () => {
        if (tip > 0 && !isBudgetLocked) {
             const tipResult = spendFromWallet(tip * 100, 'other', `Tip for ${consultantName}`);
             if(tipResult.ok) {
                toast({ title: `Tipped €${tip.toFixed(2)}`, description: `Thank you for your generosity!` });
             } else {
                 toast({ variant: 'destructive', title: `Tip Failed`, description: tipResult.message });
             }
        }
        
        // In a real app, feedback and rating would be saved here.
        localStorage.removeItem('sessionNotes');
        onClose();
    };
    
    const handleTipSelect = (amount: number) => {
        setTip(amount);
        setCustomTip("");
    }
    
    const handleCustomTipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setCustomTip(value);
        const parsedValue = parseFloat(value);
        setTip(isNaN(parsedValue) ? 0 : parsedValue);
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="font-headline text-2xl text-center">Session Summary</DialogTitle>
                    <DialogDescription className="text-center">Your session with {consultantName} has ended.</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 text-center py-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="text-lg font-bold">{formatTimestamp(duration)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total Cost</p>
                        <p className="text-lg font-bold">€{sessionCost.toFixed(2)}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="font-semibold text-sm">How was your session?</h4>
                    <div className="flex justify-center">
                        <StarRating rating={rating} onRating={setRating} interactive size={32} />
                    </div>
                    <Textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Leave optional feedback..."
                    />
                </div>

                 <div className="space-y-4 pt-4">
                    <h4 className="font-semibold text-sm">Add a tip (from wallet)</h4>
                     {isBudgetLocked ? (
                         <Alert variant="destructive">
                            <Lock className="h-4 w-4" />
                            <AlertDescription>
                                Tipping is disabled because your monthly budget is locked.
                            </AlertDescription>
                        </Alert>
                     ) : (
                        <div className="flex flex-wrap gap-2">
                            {tipAmounts.map(amount => (
                                <Button key={amount} variant={tip === amount ? "default" : "outline"} onClick={() => handleTipSelect(amount)}>
                                    €{amount}
                                </Button>
                            ))}
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">€</span>
                                <Input 
                                    type="number"
                                    value={customTip}
                                    onChange={handleCustomTipChange}
                                    className="pl-6 w-24"
                                    placeholder="Custom"
                                />
                            </div>
                        </div>
                     )}
                </div>

                {notes.length > 0 && (
                    <div className="space-y-2 pt-4">
                        <h4 className="font-semibold text-sm">Your Notes</h4>
                        <div className="p-3 border rounded-lg max-h-32 overflow-y-auto space-y-2 text-xs">
                           {notes.slice(0,3).map(note => (
                               <p key={note.id} className="truncate"><strong>{formatTimestamp(note.timestamp)}</strong> - {note.content}</p>
                           ))}
                           {notes.length > 3 && <p className="text-center text-muted-foreground">...and {notes.length - 3} more.</p>}
                        </div>
                    </div>
                )}
                
                <Separator className="my-4" />
                
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
                    <p className="font-semibold text-sm">Want a written follow-up?</p>
                    <p className="text-xs text-primary/80 mb-2">Get a detailed summary of your reading.</p>
                    <Button size="sm" variant="secondary" disabled>Purchase Summary (Coming Soon)</Button>
                </div>


                <DialogFooter className="pt-4">
                    <div className="w-full flex justify-between items-center">
                        <Button variant="link" className="text-xs text-muted-foreground p-0 h-auto">Report issue</Button>
                        <Button onClick={handleSaveAndClose}>Save & Close</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
