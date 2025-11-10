
"use client";

import { useRouter } from 'next/navigation';

export default function DeprecatedSchedulePage() {
    const router = useRouter();
    if(typeof window !== 'undefined') {
        const newPath = window.location.pathname.replace('/consultant/', '/discover/consultant/');
        router.replace(newPath);
    }
    return null;
}
