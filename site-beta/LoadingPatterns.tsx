// LoadScreen.tsx - Simple loading fallback component
import RetroLoader from "@/components/ui/RetroLoader";

export default function Loading() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-background">
      <RetroLoader />
    </div>
  );
}

// -------------------------------------------------
// HOW TO USE SUSPENSE PATTERN IN YOUR PAGES:
// -------------------------------------------------

/*
Example 1: Wrapping an entire page component
==============================================

// app/players/page.tsx
import { Suspense } from "react";
import Loading from "@/app/loading";
import PlayersContent from "@/components/PlayersContent";

export default function PlayersPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PlayersContent />
    </Suspense>
  );
}

// components/PlayersContent.tsx
export default async function PlayersContent() {
  const players = await fetchPlayersFromGoogleSheets();
  
  return (
    <main className="min-h-screen bg-background pt-24 px-4 pb-12">
      {/* Your content here *\/}
    </main>
  );
}


Example 2: Multiple suspense boundaries
========================================

// app/standings/page.tsx
import { Suspense } from "react";
import StandingsTable from "@/components/StandingsTable";
import TeamStats from "@/components/TeamStats";
import RetroLoader from "@/components/ui/RetroLoader";

export default function StandingsPage() {
  return (
    <main className="min-h-screen bg-background pt-24 px-4">
      <h1 className="font-display text-5xl text-white mb-8">
        League Standings
      </h1>
      
      {/* Each section can load independently *\/}
      <Suspense fallback={<RetroLoader />}>
        <StandingsTable />
      </Suspense>

      <Suspense fallback={<div className="h-64 skeleton rounded-xl" />}>
        <TeamStats />
      </Suspense>
    </main>
  );
}


Example 3: Client component with loading state
===============================================

"use client";

import { useState, useEffect } from "react";
import RetroLoader from "@/components/ui/RetroLoader";

export default function ClientDataComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <RetroLoader />;
  
  return <div>{/* Your content *\/}</div>;
}


Example 4: Skeleton loading states
===================================

// For tables or cards that need immediate layout
export function TableSkeleton() {
  return (
    <div className="w-full rounded-xl border border-white/10 bg-surface-dark/80 p-4">
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-10 w-32 skeleton rounded" />
            <div className="h-10 flex-1 skeleton rounded" />
            <div className="h-10 w-24 skeleton rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Usage:
<Suspense fallback={<TableSkeleton />}>
  <YourTable />
</Suspense>


Example 5: Route-level loading (Next.js App Router)
====================================================

// app/teams/loading.tsx
import RetroLoader from "@/components/ui/RetroLoader";

export default function TeamsLoading() {
  return (
    <div className="min-h-screen bg-background pt-24 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12">
          <div className="h-8 w-48 skeleton rounded mb-4" />
          <div className="h-16 w-96 skeleton rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-64 skeleton rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

// This will automatically show while app/teams/page.tsx loads


BEST PRACTICES:
===============

1. Use Suspense boundaries at the page level for entire data-loading pages
2. Use multiple boundaries for sections that load at different speeds
3. Always provide meaningful loading states (RetroLoader for full-page, skeletons for components)
4. Match skeleton dimensions to actual content for smooth transitions
5. Add loading states to client components that fetch data
6. Use route-level loading.tsx files for automatic Next.js integration

IMPLEMENTATION CHECKLIST:
=========================

✅ Replace inline loading checks with Suspense
✅ Create skeleton components for tables/grids
✅ Add loading.tsx to each route that fetches data
✅ Wrap client-side fetches with loading states
✅ Test loading states by throttling network in DevTools

*/
