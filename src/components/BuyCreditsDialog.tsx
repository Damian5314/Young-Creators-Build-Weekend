import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { paymentsApi, CreditPackage } from '@/api/payments';
import { CheckCircle, Video, X } from 'lucide-react';
import { toast } from 'sonner';

interface BuyCreditsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchaseComplete?: () => void;
}

export function BuyCreditsDialog({ open, onOpenChange, onPurchaseComplete }: BuyCreditsDialogProps) {
  const [packages, setPackages] = useState<Record<string, CreditPackage>>({});
  const [loading, setLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadPackages();
    }
  }, [open]);

  const loadPackages = async () => {
    try {
      const data = await paymentsApi.getPackages();
      setPackages(data);
    } catch (error) {
      console.error('Failed to load packages:', error);
      toast.error('Kon pakketten niet laden');
    }
  };

  const handlePurchase = async (packageId: string) => {
    setLoading(true);
    setSelectedPackage(packageId);

    try {
      const { checkoutUrl } = await paymentsApi.createCheckout(packageId);

      // Redirect to Mollie checkout
      window.location.href = checkoutUrl;

      if (onPurchaseComplete) {
        onPurchaseComplete();
      }
    } catch (error) {
      console.error('Failed to create checkout:', error);
      toast.error('Betaling kon niet worden gestart');
      setLoading(false);
      setSelectedPackage(null);
    }
  };

  const packageOrder = ['1', '3', '10'];
  const sortedPackages = packageOrder
    .filter(id => packages[id])
    .map(id => ({ id, ...packages[id] }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Koop Video Credits</DialogTitle>
          <DialogDescription>
            Je hebt video credits nodig om videos te plaatsen. Kies een pakket om door te gaan.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-2">
          {sortedPackages.map(({ id, credits, price, description }) => {
            const isPopular = id === '3';

            return (
              <Card key={id} className={isPopular ? 'border-primary border-2' : ''}>
                {isPopular && (
                  <div className="bg-primary text-primary-foreground text-center py-1 text-xs font-medium rounded-t-lg">
                    Meest gekozen
                  </div>
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Video className="h-4 w-4" />
                        {credits} Video{credits > 1 ? "'s" : ''}
                      </CardTitle>
                      <CardDescription className="text-xs">{description}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">€{price.toFixed(2)}</div>
                      {credits > 1 && (
                        <div className="text-xs text-muted-foreground">
                          €{(price / credits).toFixed(2)} p/video
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <ul className="space-y-1.5">
                    <li className="flex items-center gap-2 text-xs">
                      <CheckCircle className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                      <span>{credits} video upload{credits > 1 ? 's' : ''}</span>
                    </li>
                    <li className="flex items-center gap-2 text-xs">
                      <CheckCircle className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                      <span>Veilige betaling via Mollie</span>
                    </li>
                    <li className="flex items-center gap-2 text-xs">
                      <CheckCircle className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                      <span>Direct beschikbaar na betaling</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button
                    className="w-full h-9"
                    onClick={() => handlePurchase(id)}
                    disabled={loading}
                    variant={isPopular ? 'default' : 'outline'}
                  >
                    {loading && selectedPackage === id ? 'Bezig...' : 'Kopen'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <div className="text-center text-xs text-muted-foreground">
            Je wordt doorgestuurd naar Mollie voor een veilige betaling
          </div>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Terug
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
