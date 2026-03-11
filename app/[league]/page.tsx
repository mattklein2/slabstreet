import { notFound } from 'next/navigation';
import { use } from 'react';
import { getAllLeagueIds } from '@/lib/leagues';
import LeaguePage from '@/app/components/LeaguePage';

export function generateStaticParams() {
  return getAllLeagueIds().map(id => ({ league: id.toLowerCase() }));
}

export default function LeagueRoute({ params }: { params: Promise<{ league: string }> }) {
  const { league } = use(params);
  const leagueId = league.toUpperCase();
  if (!getAllLeagueIds().includes(leagueId as any)) notFound();
  return <LeaguePage leagueId={leagueId} />;
}
