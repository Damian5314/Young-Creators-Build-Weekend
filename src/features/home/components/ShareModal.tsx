import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Copy, Share2, MessageCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  itemType: 'RESTAURANT' | 'RECIPE';
  itemName: string;
}

export function ShareModal({ isOpen, onClose, itemId, itemType, itemName }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    const baseUrl = window.location.origin;
    if (itemType === 'RESTAURANT') {
      return `${baseUrl}/restaurant/${itemId}`;
    } else {
      return `${baseUrl}/recipe/${itemId}`;
    }
  };

  const shareUrl = getShareUrl();
  const shareText = itemType === 'RESTAURANT'
    ? `Check out ${itemName} on FlavorSwipe!`
    : `Try this recipe: ${itemName} on FlavorSwipe!`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link gekopieerd!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Kon link niet kopiëren');
    }
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(`${shareText}\n${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(shareText);
    const body = encodeURIComponent(`${shareText}\n\n${shareUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareViaNative = async () => {
    if ('share' in navigator) {
      try {
        await navigator.share({
          title: shareText,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-lg rounded-t-3xl bg-card p-6 pb-20 shadow-elevated"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold">Delen</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-3">
              {/* Native Share (mobile) or Copy Link (desktop) */}
              <button
                onClick={shareViaNative}
                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-secondary/50 transition-colors"
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  {copied ? (
                    <Check className="h-6 w-6 text-primary" />
                  ) : (
                    <Share2 className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">
                    {'share' in navigator ? 'Deel via...' : 'Kopieer link'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {'share' in navigator ? 'Kies een app om te delen' : 'Deel deze link met anderen'}
                  </p>
                </div>
              </button>

              {/* Copy Link */}
              <button
                onClick={copyToClipboard}
                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-secondary/50 transition-colors"
              >
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  {copied ? (
                    <Check className="h-6 w-6 text-blue-500" />
                  ) : (
                    <Copy className="h-6 w-6 text-blue-500" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">Kopieer link</p>
                  <p className="text-sm text-muted-foreground">
                    {copied ? 'Gekopieerd!' : 'Link naar klembord'}
                  </p>
                </div>
              </button>

              {/* WhatsApp */}
              <button
                onClick={shareViaWhatsApp}
                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-secondary/50 transition-colors"
              >
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-green-500" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">WhatsApp</p>
                  <p className="text-sm text-muted-foreground">Deel via WhatsApp</p>
                </div>
              </button>

              {/* Email */}
              <button
                onClick={shareViaEmail}
                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-secondary/50 transition-colors"
              >
                <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-red-500" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">Verstuur via email</p>
                </div>
              </button>
            </div>

            {/* Share URL Preview */}
            <div className="mt-6 p-3 bg-secondary/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Link:</p>
              <p className="text-sm font-mono truncate">{shareUrl}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
