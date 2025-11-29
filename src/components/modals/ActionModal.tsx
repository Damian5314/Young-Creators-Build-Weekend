import { motion, AnimatePresence } from 'framer-motion';
import { X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'order' | 'reserve';
  restaurantName: string;
}

export function ActionModal({ isOpen, onClose, type, restaurantName }: ActionModalProps) {
  const isOrder = type === 'order';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-elevated text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Info className="h-8 w-8 text-primary" />
            </div>

            <h2 className="text-xl font-display font-bold mb-2">
              {isOrder ? 'Order Food' : 'Make Reservation'}
            </h2>

            <p className="text-muted-foreground mb-6">
              {isOrder 
                ? `In production, this would connect to ${restaurantName}'s ordering system or a delivery partner like Uber Eats.`
                : `In production, this would open ${restaurantName}'s reservation system or integrate with a service like OpenTable.`
              }
            </p>

            <div className="bg-secondary/50 rounded-xl p-4 mb-6">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Demo Note:</strong> This is a prototype feature. 
                External API integration would be implemented here.
              </p>
            </div>

            <Button onClick={onClose} className="w-full" size="lg">
              Got it!
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
