"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is deprecated and redirects to the new billing page.
export default function WalletRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/account/billing');
  }, [router]);

  return null;
}
