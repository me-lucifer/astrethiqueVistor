
"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Consultant } from '@/lib/consultants-seeder';
import { getLocal } from '@/lib/local';
import { PlaceholderPage } from '@/components/placeholder-page';
import { Skeleton } from '@/components/ui/skeleton';

export default function ConsultantProfilePage() {
  const params = useParams();
  const { id } = params;
  const [consultant, setConsultant] = useState<Consultant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const allConsultants = getLocal<Consultant[]>('consultants');
      const foundConsultant = allConsultants?.find(c => c.id === id);
      setConsultant(foundConsultant || null);
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
        <div className="container py-16">
            <Skeleton className="h-12 w-1/2 mb-4" />
            <Skeleton className="h-6 w-3/4 mb-8" />
            <div className="mt-8 p-8 border-2 border-dashed border-border rounded-lg w-full min-h-[40vh] flex items-center justify-center">
                <Skeleton className="h-8 w-1/4" />
            </div>
      </div>
    )
  }

  if (!consultant) {
    return (
        <PlaceholderPage
            title="Consultant Not Found"
            description="We couldn't find a consultant with that ID."
        />
    );
  }

  return (
    <PlaceholderPage
      title={consultant.nameAlias}
      description={`Profile page for consultant ID ${id}. More details to come.`}
    />
  );
}
