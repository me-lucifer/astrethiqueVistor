
"use client";

import { useState, useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getLocal, setLocal } from "@/lib/local";
import { User } from "@/lib/authLocal";
import { AddFundsModal } from "./add-funds-modal";

interface AdminConfig {
    detailedHoroscopeFeeEUR: number;
}

interface DetailedHoroscopeData {
    sign: string;
    lastGeneratedAt: string;
    text: string;
    refreshCount: number;
}

const detailedTextMap: { [key: string]: string[] } = {
    Aries: ["A powerful surge of energy propels you forward today, Aries. It's a prime time for initiating projects that require courage and leadership. Your pioneering spirit is your greatest asset. However, be mindful not to rush; patience will turn a good outcome into a great one.", "In relationships, directness will clear the air. An honest conversation, though potentially challenging, will strengthen your bonds. For singles, a spontaneous encounter could spark a new flame.", "Professionally, your assertiveness can break through a long-standing obstacle. Don't be afraid to take the lead on a team project or voice a bold new idea. Your initiative will be noticed and rewarded.", "Financially, it's a day for action, not just planning. Consider making a calculated investment or finally launching that side hustle you've been dreaming of. Trust your instincts, but do your homework first.", "Health-wise, channel your abundant energy into physical activity. A vigorous workout or a competitive sport will be particularly satisfying and help you stay grounded. Avoid burnout by scheduling some downtime this evening."],
    Taurus: ["Stability is your superpower today, Taurus. Ground yourself in familiar routines and find comfort in the tangible. It's an excellent day for tasks requiring patience and meticulous attention to detail.", "Your love life benefits from consistency and affection. Plan a cozy, sensual evening with your partner. For those seeking love, you might find a connection in a comfortable, familiar setting like a favorite café or park.", "At work, your steady, methodical approach will yield significant progress. Focus on completing tasks rather than starting new ones. Your reliability will earn you trust and respect from colleagues.", "When it comes to finances, focus on security. It's a good day to review your budget, contribute to your savings, or make a plan for a long-term purchase. Avoid impulsive buys.", "For your well-being, connect with nature. A walk in the woods, gardening, or simply enjoying a meal outdoors can be deeply restorative. Indulge your senses with good food and beautiful surroundings."],
    // Add more detailed texts for other signs
    Gemini: ["Your mind is buzzing with ideas, Gemini. It's a fantastic day for communication, learning, and networking. Share your thoughts, as your words have the power to influence and inspire.", "Intellectual connection is the theme in your relationships. Engage in stimulating conversations with your partner. If you're single, your wit and charm are magnetic; you may connect with someone over a shared interest or a lively debate.", "Professionally, your adaptability is a major strength. It's a great day for brainstorming sessions, presentations, or tackling tasks that require multitasking. A new opportunity might arise through an unexpected conversation.", "Financially, research and information gathering are favored. Explore new investment options or learn about a financial topic that interests you before making any moves. Knowledge is your currency today.", "Mental exercise is just as important as physical. Challenge your mind with a puzzle, read a book on a new subject, or learn a new skill to keep your mind sharp and engaged."],
    default: ["Today is a day of potential. Focus on your goals and be open to new opportunities. Your positive attitude will attract good things.", "Communication is key in your relationships. Express yourself honestly and listen with an open heart. Understanding will deepen your connections.", "At work, your dedication will be noticed. Stay focused and organized to make significant progress. Collaboration could lead to a breakthrough.", "Financially, it's a good time to review your budget and plan for the future. Avoid impulsive spending and focus on long-term security.", "Prioritize your well-being. A balanced diet, moderate exercise, and sufficient rest will boost your energy and mood."]
};
const luckyColors = ["Ruby Red", "Emerald Green", "Sapphire Blue", "Golden Yellow", "Amethyst Purple"];
const luckyHours = ["7:00 AM", "10:00 AM", "2:00 PM", "5:00 PM", "9:00 PM"];
const focusTips = ["Practice patience", "Embrace change", "Listen more than you speak", "Trust your intuition", "Focus on one task at a time"];

const generateDetailedHoroscope = (sign: string) => {
    const texts = detailedTextMap[sign] || detailedTextMap.default;
    const mainText = texts.slice(0, Math.floor(Math.random() * 3) + 3).join("\n\n");
    const color = luckyColors[Math.floor(Math.random() * luckyColors.length)];
    const hour = luckyHours[Math.floor(Math.random() * luckyHours.length)];
    const tip = focusTips[Math.floor(Math.random() * focusTips.length)];

    return `
${mainText}

**Lucky Color:** ${color}
**Lucky Hour:** ${hour}
**Focus Tip:** ${tip}
    `;
};


export function DetailedHoroscope({ user }: { user: User | null }) {
    const [horoscope, setHoroscope] = useState<DetailedHoroscopeData | null>(null);
    const [config, setConfig] = useState<AdminConfig | null>(null);
    const [isFundsModalOpen, setIsFundsModalOpen] = useState(false);

    useEffect(() => {
        const adminConfig = getLocal<AdminConfig>('ast_admin_config');
        setConfig(adminConfig);

        if (user?.zodiacSign) {
            const storedHoroscope = getLocal<DetailedHoroscopeData>('ast_detailed_horoscope');
            const today = new Date().toISOString().split('T')[0];
            if (storedHoroscope && storedHoroscope.sign === user.zodiacSign && storedHoroscope.lastGeneratedAt.startsWith(today)) {
                setHoroscope(storedHoroscope);
            } else {
                setHoroscope(null); // Clear old horoscope
            }
        }
    }, [user]);

    const handlePurchase = () => {
        if (!user?.zodiacSign || !config) return;

        const wallet = getLocal<{ balanceEUR: number }>('ast_wallet');
        if (!wallet || wallet.balanceEUR < config.detailedHoroscopeFeeEUR) {
            setIsFundsModalOpen(true);
            return;
        }

        // Deduct fee
        const newBalance = wallet.balanceEUR - config.detailedHoroscopeFeeEUR;
        setLocal('ast_wallet', { balanceEUR: newBalance });
        window.dispatchEvent(new Event('storage')); // Notify other components of wallet change

        // Generate and save horoscope
        const newText = generateDetailedHoroscope(user.zodiacSign);
        const newHoroscope: DetailedHoroscopeData = {
            sign: user.zodiacSign,
            lastGeneratedAt: new Date().toISOString(),
            text: newText,
            refreshCount: (horoscope?.refreshCount || 0) + 1,
        };
        setLocal('ast_detailed_horoscope', newHoroscope);
        setHoroscope(newHoroscope);
    };

    if (!user?.zodiacSign || !config) {
        return null; // Don't show if no sign or config
    }

    return (
        <>
            <Accordion type="single" collapsible>
                <AccordionItem value="detailed-horoscope">
                    <AccordionTrigger>Detailed Horoscope (Paid)</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <p className="text-sm">Get a deeper, personalized reading for today.</p>
                            <Badge variant="secondary">€{config.detailedHoroscopeFeeEUR.toFixed(2)} per view/refresh</Badge>
                        </div>
                        
                        {horoscope ? (
                            <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                                <p className="text-sm whitespace-pre-wrap">{horoscope.text}</p>
                                <div className="flex justify-between items-center pt-2 border-t">
                                    <Button size="sm" onClick={handlePurchase}>Refresh</Button>
                                    <p className="text-xs text-muted-foreground">You've refreshed {horoscope.refreshCount - 1}×</p>
                                </div>
                            </div>
                        ) : (
                            <Button className="w-full" onClick={handlePurchase}>View Detailed Horoscope</Button>
                        )}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            <AddFundsModal
                isOpen={isFundsModalOpen}
                onOpenChange={setIsFundsModalOpen}
                neededAmount={config.detailedHoroscopeFeeEUR}
            />
        </>
    );
}
