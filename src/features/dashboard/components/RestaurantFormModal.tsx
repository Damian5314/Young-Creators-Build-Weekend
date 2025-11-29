import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Restaurant } from '@/shared/types';

const CUISINE_OPTIONS = ['Thai', 'Sushi', 'Ramen', 'Burger', 'Brunch', 'Italian', 'Mexican', 'Indian', 'Chinese', 'Mediterranean'];

interface RestaurantFormData {
  name: string;
  description: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  cuisine_types: string[];
  halal: boolean;
  price_level: number;
  opening_hours: string;
  image_url: string;
}

interface RestaurantFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingRestaurant: Restaurant | null;
  formData: RestaurantFormData;
  setFormData: (data: RestaurantFormData) => void;
  saving: boolean;
}

export function RestaurantFormModal({
  isOpen,
  onClose,
  onSave,
  editingRestaurant,
  formData,
  setFormData,
  saving
}: RestaurantFormModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm overflow-y-auto"
        >
          <div className="min-h-screen flex items-start justify-center p-4 py-12">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-3xl bg-card p-6 shadow-elevated"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-bold">
                  {editingRestaurant ? 'Edit Restaurant' : 'Add Restaurant'}
                </h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <Input
                  placeholder="Restaurant name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <Textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                <Input
                  placeholder="Address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
                <Input
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
                <Input
                  placeholder="Opening hours (e.g. 10:00 - 22:00)"
                  value={formData.opening_hours}
                  onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value })}
                />
                <Input
                  placeholder="Image URL"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />

                {/* Price level */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Price Level</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((level) => (
                      <Button
                        key={level}
                        variant={formData.price_level === level ? 'default' : 'secondary'}
                        size="sm"
                        onClick={() => setFormData({ ...formData, price_level: level })}
                      >
                        {'€'.repeat(level)}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Halal toggle */}
                <button
                  onClick={() => setFormData({ ...formData, halal: !formData.halal })}
                  className={`w-full p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${
                    formData.halal ? 'border-primary bg-primary/10' : 'border-secondary'
                  }`}
                >
                  <span className="text-xl">🥩</span>
                  <span className="font-medium">Halal</span>
                </button>

                {/* Cuisines */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Cuisines</label>
                  <div className="flex flex-wrap gap-2">
                    {CUISINE_OPTIONS.map((cuisine) => (
                      <button
                        key={cuisine}
                        onClick={() => {
                          const cuisines = formData.cuisine_types.includes(cuisine)
                            ? formData.cuisine_types.filter(c => c !== cuisine)
                            : [...formData.cuisine_types, cuisine];
                          setFormData({ ...formData, cuisine_types: cuisines });
                        }}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                          formData.cuisine_types.includes(cuisine)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary'
                        }`}
                      >
                        {cuisine}
                      </button>
                    ))}
                  </div>
                </div>

                <Button onClick={onSave} disabled={!formData.name || saving} className="w-full">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {editingRestaurant ? 'Update' : 'Create'} Restaurant
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
