import { getPublicCampaignSummary, getPublicLeaderboard } from '@/lib/firebase/admin';
import { Hero } from '@/components/public/Hero';
import { ProgressSection } from '@/components/public/ProgressSection';
import { Leaderboard } from '@/components/public/Leaderboard';

// Force dynamic rendering so real-time updates from database are reflected immediately
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const [summary, leaderboardItems] = await Promise.all([
    getPublicCampaignSummary(),
    getPublicLeaderboard(),
  ]);

  return (
    <div>
      <Hero summary={summary} />
      <ProgressSection summary={summary} />
      <Leaderboard items={leaderboardItems} />
    </div>
  );
}
