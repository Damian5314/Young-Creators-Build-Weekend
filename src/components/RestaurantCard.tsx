import { motion } from 'framer-motion';
import { Edit, Trash2, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Restaurant } from '@/lib/types';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onEdit: (restaurant: Restaurant) => void;
  onDelete: (id: string) => void;
  onManageVideos: (restaurant: Restaurant) => void;
}

export function RestaurantCard({ restaurant, onEdit, onDelete, onManageVideos }: RestaurantCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border p-4"
    >
      <div className="flex items-start gap-4">
        <div className="h-20 w-20 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
          {restaurant.image_url ? (
            <img src={restaurant.image_url} alt={restaurant.name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-3xl">🍽️</div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg">{restaurant.name}</h3>
          <p className="text-sm text-muted-foreground">{restaurant.city}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {restaurant.halal && <span className="halal-badge text-xs">Halal</span>}
            {restaurant.cuisine_types.slice(0, 2).map(c => (
              <span key={c} className="tag-chip text-xs">{c}</span>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="icon" onClick={() => onEdit(restaurant)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="icon" onClick={() => onDelete(restaurant.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <Button variant="secondary" className="w-full" onClick={() => onManageVideos(restaurant)}>
          <Video className="h-4 w-4 mr-2" />
          Manage Videos
        </Button>
      </div>
    </motion.div>
  );
}
