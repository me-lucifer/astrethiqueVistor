
"use client";
import { PlaceholderPage } from "@/components/placeholder-page";
import { DailyHoroscopeModal } from "@/components/daily-horoscope-modal";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function DailyHoroscopePage() {
    const [isModalOpen, setIsModalOpen] = useState(true);
    const { toast } = useToast();
    
    const handleSuccess = () => {
        toast({
            title: "Your daily horoscope is on its way ✨",
        });
    }

  return (
    <>
        <PlaceholderPage title="Daily Horoscope" description="Sign up for your free daily horoscope, delivered to your inbox." />
        <DailyHoroscopeModal 
            isOpen={isModalOpen}
            onOpenChange={setIsModalOpen}
            onSuccessSubmit={handleSuccess}
        />
    </>
  );
}
