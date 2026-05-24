import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center" style={{ background: 'var(--bg)' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center mx-auto mb-6 shadow-glow-brand">
          <Zap className="w-8 h-8 text-white" fill="currentColor" />
        </div>
        <h1 className="font-display font-bold text-6xl mb-3 gradient-text">404</h1>
        <h2 className="font-display font-bold text-2xl mb-3">Page not found</h2>
        <p className="text-sm mb-8 max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn-primary px-8 py-3">Back to Home</Link>
      </motion.div>
    </div>
  );
}
