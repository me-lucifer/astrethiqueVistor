

"use client";

import { useState, useEffect, useTransition } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getLocal, setLocal, getWallet, getAdminConfig, setWallet, Wallet, SpendLogEntry, spendFromWallet, incrementMetric } from "@/lib/local";
import { User } from "@/lib/authLocal";
import { TopUpModal } from "./top-up-modal";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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
    Aries: [
        "A powerful surge of energy propels you forward, Aries. It's a prime time for initiating projects that require courage. Your pioneering spirit is your greatest asset, but be mindful not to rush; patience will turn a good outcome into a great one.",
        "In relationships, directness will clear the air. An honest conversation, though potentially challenging, will strengthen your bonds. For singles, a spontaneous encounter could spark a new flame.",
        "Professionally, your assertiveness can break through a long-standing obstacle. Don't be afraid to take the lead on a team project or voice a bold new idea. Your initiative will be noticed.",
        "Financially, it's a day for action, not just planning. Consider making a calculated investment or finally launching that side hustle you've been dreaming of. Trust your instincts, but do your homework.",
        "Health-wise, channel your abundant energy into physical activity. A vigorous workout or a competitive sport will be particularly satisfying and help you stay grounded. Avoid burnout by scheduling downtime."
    ],
    Taurus: [
        "Stability is your superpower today, Taurus. Ground yourself in familiar routines and find comfort in the tangible. It's an excellent day for tasks requiring patience and meticulous attention to detail.",
        "Your love life benefits from consistency and affection. Plan a cozy, sensual evening with your partner. For those seeking love, you might find a connection in a comfortable, familiar setting like a favorite café.",
        "At work, your steady, methodical approach will yield significant progress. Focus on completing tasks rather than starting new ones. Your reliability will earn you trust and respect from colleagues.",
        "When it comes to finances, focus on security. It's a good day to review your budget, contribute to your savings, or make a plan for a long-term purchase. Avoid impulsive buys.",
        "For your well-being, connect with nature. A walk in the woods, gardening, or simply enjoying a meal outdoors can be deeply restorative. Indulge your senses with good food and beautiful surroundings."
    ],
    Gemini: [
        "Your mind is buzzing with ideas, Gemini. It's a fantastic day for communication, learning, and networking. Share your thoughts, as your words have the power to influence and inspire.",
        "Intellectual connection is the theme in your relationships. Engage in stimulating conversations with your partner. If you're single, your wit and charm are magnetic; you may connect with someone over a shared interest.",
        "Professionally, your adaptability is a major strength. It's a great day for brainstorming sessions, presentations, or tackling tasks that require multitasking. A new opportunity might arise through an unexpected conversation.",
        "Financially, research and information gathering are favored. Explore new investment options or learn about a financial topic that interests you before making any moves. Knowledge is your currency today.",
        "Mental exercise is just as important as physical. Challenge your mind with a puzzle, read a book on a new subject, or learn a new skill to keep your mind sharp and engaged."
    ],
    Cancer: [
        "Your intuition is your guide today, Cancer. Pay close attention to your gut feelings, as they are steering you toward emotional truth. It's a day for nurturing yourself and your closest relationships.",
        "Home and family take center stage. Creating a comfortable and secure environment will bring you immense peace. A heartfelt conversation with a family member can heal old wounds.",
        "At work, your empathetic nature allows you to understand the underlying dynamics of a situation. Use this insight to navigate team projects and support your colleagues. Your caring approach will be appreciated.",
        "Financially, this is a time for caution and nurturing your assets. Focus on long-term security rather than short-term gains. A home-related investment could prove beneficial.",
        "Self-care is non-negotiable. A warm bath, a comforting meal, or spending time near water can be incredibly restorative for your soul. Listen to what your body and spirit need."
    ],
    Leo: [
        "Your natural charisma is shining brightly today, Leo. Step into the spotlight and share your unique gifts with the world. It's a day for creative self-expression, passion, and joyful play.",
        "Romance is in the air. Plan a grand gesture for your partner or, if single, allow your radiant personality to attract admirers. Don't be afraid to be bold in matters of the heart.",
        "Your leadership qualities are in high demand at work. Take charge of a project and inspire your team with your vision and enthusiasm. Your confidence is contagious and will lead to success.",
        "A calculated risk could pay off financially. While you should avoid recklessness, an opportunity that aligns with your passions is worth considering. Trust in your ability to create abundance.",
        "Engage in activities that bring you joy and allow you to express yourself. Whether it's a creative hobby, a performance, or simply dressing up, letting your inner star shine will boost your vitality."
    ],
    Virgo: [
        "A focus on details and organization will bring you a sense of accomplishment, Virgo. It's a perfect day to tackle practical tasks, create a plan, or bring order to a chaotic situation.",
        "In relationships, acts of service are a powerful love language. Show your affection by helping your partner with a task or creating a well-organized plan for your future together. Small gestures mean a lot.",
        "Your analytical skills are at their peak. Use this to your advantage at work by proofreading documents, refining a process, or identifying inefficiencies. Your attention to detail will prevent future problems.",
        "Financially, it's an excellent day for budgeting and planning. Create a detailed financial plan or organize your documents. Small, practical steps taken now will lead to long-term financial health.",
        "Your well-being benefits from routine and healthy habits. Focus on nutrition, create a structured workout plan, or declutter your living space to create a sense of calm and order."
    ],
    Libra: [
        "Balance and harmony are your key themes today, Libra. Seek beauty in your surroundings and strive for fairness in your interactions. Your diplomatic skills can smooth over any potential conflicts.",
        "Partnership is at the forefront. Focus on creating a give-and-take dynamic in your relationships. A collaborative activity or a beautiful date night can strengthen your bond. Singles may find a connection with someone who values equality.",
        "At work, your ability to see all sides of an issue makes you an invaluable mediator. Use your diplomatic skills to build consensus and create a harmonious team environment. A new partnership could be beneficial.",
        "Financial decisions should be made with a long-term partner or a trusted advisor. Weigh the pros and cons carefully before committing. A balanced approach to spending and saving is your best strategy.",
        "Create a beautiful and peaceful environment to soothe your soul. Listen to harmonious music, visit an art gallery, or redecorate a corner of your home. Aesthetic pleasure is a form of self-care for you."
    ],
    Scorpio: [
        "Your intensity and focus are powerful assets today, Scorpio. It's a day for deep investigation, transformation, and getting to the heart of a matter. Trust your powerful intuition.",
        "Intimacy and emotional depth are craved in your relationships. Don't shy away from vulnerability; sharing your deepest feelings can lead to a profound transformation in your connection. True bonds are forged in trust.",
        "At work, your ability to uncover hidden information or solve complex problems is highlighted. Dive deep into a research project or a challenging task. Your perseverance will lead to a breakthrough.",
        "This is a powerful time for financial transformation. Look into long-term investments, debt consolidation, or shared resources. Your strategic mind can create lasting wealth.",
        "Emotional release is a key part of your well-being. Engage in activities that allow for catharsis, such as journaling, intense exercise, or a powerful movie. Releasing old emotions makes way for the new."
    ],
    Sagittarius: [
        "Your spirit of adventure is calling, Sagittarius. It's a day to expand your horizons, whether through travel, learning, or exploring new philosophies. Embrace the unknown and say yes to new experiences.",
        "Spontaneity can bring a spark to your love life. Plan an adventurous date or share your dreams for the future with your partner. If single, you may meet someone while exploring a new place or interest.",
        "At work, think big picture. Your optimistic vision can inspire your team and open up new possibilities. It's a great day for long-term planning, marketing, or international collaborations.",
        "Financially, look for opportunities to grow and expand. This could be through education that increases your earning potential or an investment in travel. An optimistic outlook can attract abundance.",
        "Physical and mental freedom are key to your well-being. Get outdoors, try a new sport, or read a book that expands your mind. Breaking out of your routine is invigorating for your soul."
    ],
    Capricorn: [
        "Discipline and ambition are your guiding stars today, Capricorn. Focus on your long-term goals and take practical, structured steps to achieve them. Your hard work is building a lasting legacy.",
        "Commitment and loyalty are highlighted in your relationships. Show your partner your dedication through steadfast support and planning for your shared future. Lasting love is built on a solid foundation.",
        "At work, your professionalism and ambition will not go unnoticed. Take on a leadership role or present a well-structured plan to your superiors. Your responsible approach earns you respect and authority.",
        "Financially, this is a day for long-term planning and investment. Consider your retirement plan, make a sound investment in real estate, or set a disciplined savings goal. Your patience will pay off.",
        "Your health benefits from structure and discipline. Stick to a regular workout routine, create a healthy meal plan, or set a goal like training for a race. Building strength, both physical and mental, is key."
    ],
    Aquarius: [
        "Your unique perspective and innovative ideas are needed today, Aquarius. Don't be afraid to challenge the status quo and think outside the box. Your vision for the future can inspire positive change.",
        "In relationships, celebrate your individuality. Give each other space to pursue personal interests, then come together to share your experiences. A friendship-based connection is especially important now.",
        "At work, your humanitarian instincts can shine. Focus on projects that benefit the greater good or use technology to innovate. Your unconventional approach can lead to a breakthrough for the entire team.",
        "Financially, consider investments in technology, social causes, or innovative startups. Your forward-thinking approach could lead to unexpected gains. Digital currencies may also be of interest.",
        "Connecting with a group or community is vital for your well-being. Participate in a team activity, volunteer for a cause you believe in, or connect with like-minded friends online. Your power lies in the collective."
    ],
    Pisces: [
        "Your compassionate and imaginative nature is your strength today, Pisces. Tap into your creativity and intuition. It's a day for art, music, spiritual practice, and connecting with the universal flow.",
        "Unconditional love and emotional connection are the focus in your relationships. A romantic, dreamy gesture can create a magical moment. Listen to your heart and lead with compassion.",
        "At work, your creative vision can solve problems in a unique way. Trust your intuition when making decisions. A compassionate approach with colleagues will foster a supportive and creative environment.",
        "Financially, be wary of deals that seem too good to be true. Your generosity is a gift, but ensure you are not being taken advantage of. It's a better day for charitable giving than for risky investments.",
        "Your well-being is enhanced by spiritual and creative pursuits. Meditate, listen to music, create art, or spend time near water. Allowing yourself to dream and escape is a necessary form of rest for you."
    ],
};
const luckyColors = ["Gold", "Teal", "Indigo", "Emerald", "Amber", "Lilac", "Ruby Red", "Sapphire Blue", "Golden Yellow", "Amethyst Purple"];
const luckyHours = ["08:00-09:00", "11:00-12:00", "14:00-15:00", "20:00-21:00", "07:00-08:00", "10:00-11:00", "15:00-16:00", "19:00-20:00"];
const focusTips = ["Journal for 10 minutes", "Go for a 15-minute walk", "Tidy your desk", "Message a friend", "Drink water and breathe", "Listen to a favorite song", "Stretch for 5 minutes"];

const generateDetailedHoroscope = (sign: string) => {
    const texts = detailedTextMap[sign] || detailedTextMap.Aries;
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


export function DetailedHoroscope({ user, onLockError, onEmergencyTopUpNeeded }: { user: User | null, onLockError: () => void, onEmergencyTopUpNeeded: () => void }) {
    const [horoscope, setHoroscope] = useState<DetailedHoroscopeData | null>(null);
    const [config, setConfig] = useState<AdminConfig | null>(null);
    const [isFundsModalOpen, setIsFundsModalOpen] = useState(false);
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        const adminConfig = getAdminConfig();
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
        startTransition(() => {
            if (!user?.zodiacSign || !config) return;

            const feeCents = config.detailedHoroscopeFeeEUR * 100;
            
            const spendResult = spendFromWallet(feeCents, "horoscope", `Detailed horoscope for ${user.zodiacSign}`);
            
            if (!spendResult.ok) {
                if (spendResult.message.startsWith("locked:")) {
                    onLockError();
                } else {
                    setIsFundsModalOpen(true);
                }
                return;
            }
            
            toast({
                title: "Purchase Successful",
                description: `€${config.detailedHoroscopeFeeEUR.toFixed(2)} deducted for detailed horoscope.`,
                duration: 2500,
            });

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
            incrementMetric('horoscope_purchases');
        });
    };

    if (!user?.zodiacSign || !config) {
        return null; // Don't show if no sign or config
    }

    return (
        <>
            <Accordion type="single" collapsible>
                <AccordionItem value="detailed-horoscope">
                    <AccordionTrigger>
                        <span className="flex items-center gap-1.5">
                            Detailed Horoscope (Paid)
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild onClick={(e) => e.stopPropagation()}>
                                        <Info className="h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Price is set by admin. In this prototype: €{config.detailedHoroscopeFeeEUR.toFixed(2)} per view/refresh.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <p className="text-sm">Get a deeper, personalized reading for today.</p>
                            <Badge variant="secondary">€{config.detailedHoroscopeFeeEUR.toFixed(2)} per view/refresh</Badge>
                        </div>
                        
                        {horoscope ? (
                            <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                                <p className="text-sm whitespace-pre-wrap">{horoscope.text}</p>
                                <div className="flex justify-between items-center pt-2 border-t">
                                    <Button size="sm" onClick={handlePurchase} disabled={isPending}>
                                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Refresh
                                    </Button>
                                    <p className="text-xs text-muted-foreground">You've refreshed {horoscope.refreshCount - 1}×</p>
                                </div>
                            </div>
                        ) : (
                            <Button className="w-full" onClick={handlePurchase} disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                View Detailed Horoscope
                            </Button>
                        )}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            <TopUpModal
                isOpen={isFundsModalOpen}
                onOpenChange={setIsFundsModalOpen}
            />
        </>
    );
}

    

    