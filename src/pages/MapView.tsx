import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Map, Compass } from 'lucide-react';

export default function MapView() {
  return (
    <AppLayout>
      <div className="fixed inset-0 bottom-14 flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center px-6"
        >
          <div className="empty-state-icon relative">
            <Map className="h-10 w-10 text-primary" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute -top-1 -right-1"
            >
              <Compass className="h-5 w-5 text-primary" />
            </motion.div>
          </div>
          <h1 className="empty-state-title">Explore</h1>
          <p className="empty-state-description">
            Discover restaurants near you on an interactive map.
          </p>
          <div className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-sm font-medium text-primary">Coming Soon</span>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
