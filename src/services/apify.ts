// Apify TikTok Scraper Service
// This service fetches recipe videos from TikTok using the Apify API

export interface TikTokVideo {
  id: string;
  text: string; // description
  createTime: number;
  authorMeta: {
    name: string;
    nickName: string;
    avatar: string;
  };
  videoMeta: {
    coverUrl: string;
    downloadUrl: string;
    duration: number;
  };
  diggCount: number; // likes
  shareCount: number;
  playCount: number; // views
  commentCount: number;
  hashtags: Array<{
    id: string;
    name: string;
  }>;
}

export interface RecipeVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  authorName: string;
  authorAvatar: string;
  likeCount: number;
  viewCount: number;
  tags: string[];
  createdAt: string;
}

const APIFY_API_KEY = import.meta.env.VITE_APIFY_API_KEY;
const APIFY_ACTOR_ID = 'clockworks/tiktok-scraper'; // Popular TikTok scraper

/**
 * Fetches recipe videos from TikTok using Apify
 * @param searchTerms - Array of search terms for recipe videos
 * @param maxResults - Maximum number of videos to fetch
 */
export async function fetchTikTokRecipeVideos(
  searchTerms: string[] = ['recipe', 'cooking', 'food recipe', 'easy recipe'],
  maxResults: number = 20
): Promise<RecipeVideo[]> {
  if (!APIFY_API_KEY) {
    console.error('APIFY API key not found in environment variables');
    // Return mock data for development/testing
    return getMockRecipeVideos();
  }

  try {
    // Randomly select a search term
    const searchTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];

    // Start the Apify actor run
    const runResponse = await fetch(
      `https://api.apify.com/v2/acts/${APIFY_ACTOR_ID}/runs?token=${APIFY_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hashtags: [searchTerm],
          resultsPerPage: maxResults,
          shouldDownloadVideos: false,
          shouldDownloadCovers: false,
        }),
      }
    );

    if (!runResponse.ok) {
      throw new Error(`Apify API error: ${runResponse.statusText}`);
    }

    const runData = await runResponse.json();
    const runId = runData.data.id;

    // Wait for the run to complete (with timeout)
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds timeout
    let runStatus = 'RUNNING';

    while (runStatus === 'RUNNING' && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const statusResponse = await fetch(
        `https://api.apify.com/v2/acts/${APIFY_ACTOR_ID}/runs/${runId}?token=${APIFY_API_KEY}`
      );
      const statusData = await statusResponse.json();
      runStatus = statusData.data.status;
      attempts++;
    }

    if (runStatus !== 'SUCCEEDED') {
      console.error('Apify run did not succeed:', runStatus);
      return getMockRecipeVideos();
    }

    // Fetch the results
    const resultsResponse = await fetch(
      `https://api.apify.com/v2/acts/${APIFY_ACTOR_ID}/runs/${runId}/dataset/items?token=${APIFY_API_KEY}`
    );

    if (!resultsResponse.ok) {
      throw new Error('Failed to fetch Apify results');
    }

    const tiktokVideos: TikTokVideo[] = await resultsResponse.json();

    // Transform TikTok videos to our RecipeVideo format
    return tiktokVideos.map((video) => transformTikTokVideo(video));
  } catch (error) {
    console.error('Error fetching TikTok videos from Apify:', error);
    // Return mock data as fallback
    return getMockRecipeVideos();
  }
}

/**
 * Transform TikTok video data to our RecipeVideo format
 */
function transformTikTokVideo(video: TikTokVideo): RecipeVideo {
  return {
    id: video.id,
    title: video.text.substring(0, 100) || 'Recipe Video',
    description: video.text,
    videoUrl: video.videoMeta.downloadUrl,
    thumbnailUrl: video.videoMeta.coverUrl,
    authorName: video.authorMeta.nickName || video.authorMeta.name,
    authorAvatar: video.authorMeta.avatar,
    likeCount: video.diggCount,
    viewCount: video.playCount,
    tags: video.hashtags.map((tag) => tag.name),
    createdAt: new Date(video.createTime * 1000).toISOString(),
  };
}

/**
 * Mock recipe videos for development/testing
 */
function getMockRecipeVideos(): RecipeVideo[] {
  return [
    {
      id: 'mock-1',
      title: 'Easy Pasta Carbonara Recipe',
      description: 'Learn how to make authentic Italian pasta carbonara in just 15 minutes! #recipe #pasta #italian',
      videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=600&fit=crop',
      authorName: 'ChefMaria',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
      likeCount: 15600,
      viewCount: 234000,
      tags: ['recipe', 'pasta', 'italian', 'cooking'],
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'mock-2',
      title: 'Chocolate Chip Cookies',
      description: 'Perfect chocolate chip cookies every time! Crispy edges, soft center 🍪 #baking #cookies #recipe',
      videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=600&fit=crop',
      authorName: 'BakingWithSam',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam',
      likeCount: 28900,
      viewCount: 456000,
      tags: ['baking', 'cookies', 'dessert', 'recipe'],
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'mock-3',
      title: 'Quick Fried Rice',
      description: 'Restaurant-style fried rice at home! Takes only 10 minutes 🍚 #friedrice #asian #quickrecipe',
      videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=600&fit=crop',
      authorName: 'AsianCookingPro',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Asian',
      likeCount: 42100,
      viewCount: 678000,
      tags: ['friedrice', 'asian', 'quickrecipe', 'dinner'],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'mock-4',
      title: 'Healthy Buddha Bowl',
      description: 'Colorful and nutritious buddha bowl recipe! Perfect for meal prep 🥗 #healthy #vegan #mealprep',
      videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=600&fit=crop',
      authorName: 'HealthyEats',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Healthy',
      likeCount: 19800,
      viewCount: 321000,
      tags: ['healthy', 'vegan', 'mealprep', 'recipe'],
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'mock-5',
      title: 'Homemade Pizza Dough',
      description: 'The BEST pizza dough recipe! Crispy crust, airy inside 🍕 #pizza #homemade #baking',
      videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=600&fit=crop',
      authorName: 'PizzaMaster',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pizza',
      likeCount: 67200,
      viewCount: 892000,
      tags: ['pizza', 'homemade', 'baking', 'italian'],
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}
