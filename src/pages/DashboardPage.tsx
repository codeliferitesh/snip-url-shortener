import { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, MousePointerClick, TrendingUp, Clock, Plus } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import StatsCard from '@/components/dashboard/StatsCard';
import LinkCard from '@/components/dashboard/LinkCard';
import LinkFilters from '@/components/dashboard/LinkFilters';
import UrlShortenerForm from '@/components/dashboard/UrlShortenerForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuthStore } from '@/store/authStore';
import { useLinksStore, useFilteredLinks } from '@/store/linksStore';
import { formatCount } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { links, loading, subscribeLinks, unsubscribeLinks } = useLinksStore();
  const filteredLinks = useFilteredLinks();

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return;
    subscribeLinks(user.uid);
    return () => unsubscribeLinks();
  }, [user?.uid]);

  // Aggregate stats
  const stats = useMemo(() => {
    const totalClicks   = links.reduce((sum, l) => sum + l.totalClicks, 0);
    const activeLinks   = links.filter(l => l.isActive && (!l.expiresAt || new Date() < new Date(l.expiresAt)));
    const lastClick     = links.reduce<Date | null>((latest, l) => {
      if (!l.lastClickAt) return latest;
      return !latest || l.lastClickAt > latest ? l.lastClickAt : latest;
    }, null);

    return { totalClicks, activeLinks: activeLinks.length, lastClick };
  }, [links]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display font-bold text-3xl">
              {user?.displayName ? `Hey, ${user.displayName.split(' ')[0]} 👋` : 'Dashboard'}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Manage and track all your short links
            </p>
          </div>

          {/* User avatar */}
          {user?.photoURL && (
            <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full border-2"
              style={{ borderColor: 'var(--border)' }} />
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard title="Total Links"    value={links.length}                     icon={Link2}             color="brand"  delay={0}    />
          <StatsCard title="Total Clicks"   value={formatCount(stats.totalClicks)}   icon={MousePointerClick} color="accent" delay={0.08} />
          <StatsCard title="Active Links"   value={stats.activeLinks}                icon={TrendingUp}        color="green"  delay={0.16} />
          <StatsCard
            title="Last Click"
            value={stats.lastClick ? formatDistanceToNow(stats.lastClick, { addSuffix: true }) : '—'}
            icon={Clock} color="amber" delay={0.24}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create form */}
          <div className="lg:col-span-1">
            <div className="card p-5 sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-brand-500/10 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-brand-500" />
                </div>
                <h2 className="font-semibold text-sm">New Short Link</h2>
              </div>
              <UrlShortenerForm />
            </div>
          </div>

          {/* Links list */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">
                Your Links
                {filteredLinks.length > 0 && (
                  <span className="ml-2 text-sm font-normal" style={{ color: 'var(--text-muted)' }}>
                    ({filteredLinks.length})
                  </span>
                )}
              </h2>
            </div>

            <LinkFilters />

            {loading && links.length === 0 ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner size="lg" />
              </div>
            ) : filteredLinks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="card p-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500/10 to-accent-500/10 flex items-center justify-center mx-auto mb-4">
                  <Link2 className="w-7 h-7 text-brand-500" />
                </div>
                <h3 className="font-semibold mb-2">
                  {links.length === 0 ? 'No links yet' : 'No links match your search'}
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {links.length === 0
                    ? 'Create your first short link using the form on the left'
                    : 'Try adjusting your search or filters'}
                </p>
              </motion.div>
            ) : (
              <AnimatePresence mode="popLayout">
                <div className="space-y-3">
                  {filteredLinks.map((link) => (
                    <LinkCard key={link.id} link={link} />
                  ))}
                </div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
