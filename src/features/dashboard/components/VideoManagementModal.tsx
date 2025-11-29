import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Video, Eye, Heart, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Restaurant, Video as VideoType } from '@/shared/types';

interface VideoManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant;
  videos: VideoType[];
  onAddVideo: (video: { title: string; description: string; video_url: string; thumbnail_url: string }) => void;
  onDeleteVideo: (id: string) => void;
  saving: boolean;
}

export function VideoManagementModal({
  isOpen,
  onClose,
  restaurant,
  videos,
  onAddVideo,
  onDeleteVideo,
  saving
}: VideoManagementModalProps) {
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [videoForm, setVideoForm] = useState({
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
  });

  const handleSubmit = () => {
    onAddVideo(videoForm);
    setVideoForm({ title: '', description: '', video_url: '', thumbnail_url: '' });
    setShowVideoForm(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background"
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-4 p-4 border-b border-border">
              <Button variant="ghost" size="icon" onClick={onClose}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1">
                <h2 className="font-bold">{restaurant.name}</h2>
                <p className="text-sm text-muted-foreground">Videos</p>
              </div>
              <Button size="sm" onClick={() => setShowVideoForm(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add Video
              </Button>
            </div>

            {/* Videos list */}
            <div className="flex-1 overflow-y-auto p-4">
              {videos.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No videos yet
                </div>
              ) : (
                <div className="space-y-3">
                  {videos.map((video) => (
                    <div
                      key={video.id}
                      className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border"
                    >
                      <div className="h-16 w-24 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                        {video.thumbnail_url ? (
                          <img src={video.thumbnail_url} alt={video.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Video className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{video.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {video.view_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {video.like_count}
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => onDeleteVideo(video.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Add video form */}
          <AnimatePresence>
            {showVideoForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
                onClick={() => setShowVideoForm(false)}
              >
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.95 }}
                  className="w-full max-w-md rounded-3xl bg-card p-6 shadow-elevated"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-lg font-display font-bold mb-4">Add Video</h3>
                  <div className="space-y-4">
                    <Input
                      placeholder="Video title"
                      value={videoForm.title}
                      onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                    />
                    <Textarea
                      placeholder="Description"
                      value={videoForm.description}
                      onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                    />
                    <Input
                      placeholder="Video URL"
                      value={videoForm.video_url}
                      onChange={(e) => setVideoForm({ ...videoForm, video_url: e.target.value })}
                    />
                    <Input
                      placeholder="Thumbnail URL"
                      value={videoForm.thumbnail_url}
                      onChange={(e) => setVideoForm({ ...videoForm, thumbnail_url: e.target.value })}
                    />
                    <div className="flex gap-3">
                      <Button variant="secondary" onClick={() => setShowVideoForm(false)} className="flex-1">
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={!videoForm.title || !videoForm.video_url || saving}
                        className="flex-1"
                      >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
