
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { getSession, setSession } from '@/lib/session';

type DiscoverTab = 'consultants' | 'conferences' | 'content';

export function useDiscoverTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as DiscoverTab | null;

  const getInitialTab = (): DiscoverTab => {
    if (tabParam && ['consultants', 'conferences', 'content'].includes(tabParam)) {
      return tabParam;
    }
    const sessionTab = getSession<DiscoverTab>('discoverTab');
    return sessionTab || 'consultants';
  };

  const [activeTab, setActiveTabState] = useState<DiscoverTab>(getInitialTab);

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTabState(tabFromUrl as DiscoverTab);
    }
  }, [searchParams, activeTab]);

  const setActiveTab = useCallback((tab: string) => {
    const newTab = tab as DiscoverTab;
    setActiveTabState(newTab);
    setSession('discoverTab', newTab);
    
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set("tab", newTab);
    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(`${pathname}${query}`, {scroll: false});

  }, [searchParams, router, pathname]);

  return { activeTab, setActiveTab };
}
