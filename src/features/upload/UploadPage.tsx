import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, X, Video, Image, Loader2, ChefHat, Store, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AppLayout } from '@/shared/components';
import { useAuth } from '@/shared/hooks';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function UploadPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [restaurant, setRestaurant] = useState<{ id: string; name: string } | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
  });

  const isOwner = profile?.role === 'OWNER';

  // Fetch restaurant for owners
  useEffect(() => {
    const fetchRestaurant = async () => {
      if (user && isOwner) {
        const { data } = await supabase
          .from('restaurants')
          .select('id, name')
          .eq('owner_id', user.id)
          .single();

        if (data) {
          setRestaurant(data);
        }
      }
    };

    fetchRestaurant();
  }, [user, isOwner]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      toast.error('Je moet ingelogd zijn om te uploaden');
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        toast.error('Video mag maximaal 100MB zijn');
        return;
      }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Thumbnail mag maximaal 5MB zijn');
        return;
      }
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const removeVideo = () => {
    setVideoFile(null);
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
      setVideoPreview(null);
    }
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
      setThumbnailPreview(null);
    }
  };

  const uploadFile = async (file: File, bucket: string, folder: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${user!.id}-${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoFile) {
      toast.error('Selecteer een video om te uploaden');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Voer een titel in');
      return;
    }

    setLoading(true);

    try {
      // Upload video
      const videoUrl = await uploadFile(videoFile, 'videos', isOwner ? 'restaurants' : 'recipes');
      if (!videoUrl) {
        toast.error('Fout bij uploaden video');
        setLoading(false);
        return;
      }

      // Upload thumbnail if provided
      let thumbnailUrl = null;
      if (thumbnailFile) {
        thumbnailUrl = await uploadFile(thumbnailFile, 'videos', 'thumbnails');
      }

      const tags = formData.tags.split(',').map(t => t.trim()).filter(t => t);

      if (isOwner && restaurant) {
        // Restaurant owner: add to videos table
        const { error } = await supabase
          .from('videos')
          .insert({
            restaurant_id: restaurant.id,
            title: formData.title,
            description: formData.description,
            video_url: videoUrl,
            thumbnail_url: thumbnailUrl,
            tags: tags,
          });

        if (error) {
          console.error('Error saving video:', error);
          toast.error('Fout bij opslaan video');
          setLoading(false);
          return;
        }

        toast.success('Video geüpload voor je restaurant!');
      } else {
        // Regular user: add to recipes table
        const { error } = await supabase
          .from('recipes')
          .insert({
            user_id: user!.id,
            title: formData.title,
            description: formData.description,
            video_url: videoUrl,
            image_url: thumbnailUrl,
            source: 'USER',
            ingredients: [],
            steps: [],
          });

        if (error) {
          console.error('Error saving recipe:', error);
          toast.error('Fout bij opslaan recept');
          setLoading(false);
          return;
        }

        toast.success('Recept video geüpload!');
      }

      // Navigate to home
      navigate('/');
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Er ging iets mis bij het uploaden');
    }

    setLoading(false);
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold">Video Uploaden</h1>
            <div className="w-10" />
          </div>
        </div>

        <div className="px-4 py-6">
          {/* Account type indicator */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl bg-secondary"
          >
            <div className="flex items-center gap-3">
              {isOwner ? (
                <>
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Store className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Restaurant Video</p>
                    <p className="text-sm text-muted-foreground">
                      Video wordt getoond bij {restaurant?.name || 'je restaurant'}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <ChefHat className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Recept Video</p>
                    <p className="text-sm text-muted-foreground">
                      Video wordt getoond in de recepten feed
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Video upload */}
            <div>
              <label className="block text-sm font-medium mb-2">Video</label>
              {!videoPreview ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-video rounded-2xl border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-3 bg-secondary/50"
                >
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <Video className="h-7 w-7 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">Klik om video te selecteren</p>
                    <p className="text-sm text-muted-foreground">MP4, MOV, max 100MB</p>
                  </div>
                </button>
              ) : (
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-black">
                  <video
                    src={videoPreview}
                    className="w-full h-full object-contain"
                    controls
                  />
                  <button
                    type="button"
                    onClick={removeVideo}
                    className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/webm"
                onChange={handleVideoSelect}
                className="hidden"
              />
            </div>

            {/* Thumbnail upload */}
            <div>
              <label className="block text-sm font-medium mb-2">Thumbnail (optioneel)</label>
              {!thumbnailPreview ? (
                <button
                  type="button"
                  onClick={() => thumbnailInputRef.current?.click()}
                  className="w-full h-32 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors flex items-center justify-center gap-3 bg-secondary/50"
                >
                  <Image className="h-6 w-6 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Voeg thumbnail toe</span>
                </button>
              ) : (
                <div className="relative h-32 rounded-xl overflow-hidden">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeThumbnail}
                    className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleThumbnailSelect}
                className="hidden"
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">Titel</label>
              <Input
                placeholder={isOwner ? 'Bijv: Onze signature pasta' : 'Bijv: Makkelijke pasta carbonara'}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="h-12 bg-secondary border-0 rounded-xl"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">Beschrijving</label>
              <Textarea
                placeholder="Vertel iets over deze video..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="min-h-24 bg-secondary border-0 rounded-xl resize-none"
              />
            </div>

            {/* Tags (only for restaurant videos) */}
            {isOwner && (
              <div>
                <label className="block text-sm font-medium mb-2">Tags</label>
                <Input
                  placeholder="Bijv: pasta, italiaans, signature dish"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="h-12 bg-secondary border-0 rounded-xl"
                />
                <p className="text-xs text-muted-foreground mt-1">Scheid tags met komma's</p>
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full h-14 text-base font-semibold"
              size="lg"
              disabled={loading || !videoFile}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Uploaden...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 mr-2" />
                  Video Uploaden
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
