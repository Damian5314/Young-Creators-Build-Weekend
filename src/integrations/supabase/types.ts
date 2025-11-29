export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      collection_items: {
        Row: {
          collection_id: string
          created_at: string | null
          id: string
          item_id: string
          item_type: Database["public"]["Enums"]["item_type"]
        }
        Insert: {
          collection_id: string
          created_at?: string | null
          id?: string
          item_id: string
          item_type: Database["public"]["Enums"]["item_type"]
        }
        Update: {
          collection_id?: string
          created_at?: string | null
          id?: string
          item_id?: string
          item_type?: Database["public"]["Enums"]["item_type"]
        }
        Relationships: [
          {
            foreignKeyName: "collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          created_at: string | null
          id: string
          name: string
          type: Database["public"]["Enums"]["collection_type"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          type: Database["public"]["Enums"]["collection_type"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["collection_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string | null
          dietary_preferences: string[] | null
          email: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string | null
          onboarding_completed: boolean | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string | null
          dietary_preferences?: string[] | null
          email?: string | null
          id: string
          latitude?: number | null
          longitude?: number | null
          name?: string | null
          onboarding_completed?: boolean | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string | null
          dietary_preferences?: string[] | null
          email?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string | null
          onboarding_completed?: boolean | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      recipes: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          ingredients: string[] | null
          source: Database["public"]["Enums"]["recipe_source"]
          steps: string[] | null
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          source?: Database["public"]["Enums"]["recipe_source"]
          steps?: string[] | null
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          source?: Database["public"]["Enums"]["recipe_source"]
          steps?: string[] | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          address: string | null
          average_rating: number | null
          city: string
          created_at: string | null
          cuisine_types: string[] | null
          description: string | null
          halal: boolean | null
          id: string
          image_url: string | null
          latitude: number
          longitude: number
          name: string
          opening_hours: string | null
          owner_id: string | null
          price_level: number | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          average_rating?: number | null
          city: string
          created_at?: string | null
          cuisine_types?: string[] | null
          description?: string | null
          halal?: boolean | null
          id?: string
          image_url?: string | null
          latitude: number
          longitude: number
          name: string
          opening_hours?: string | null
          owner_id?: string | null
          price_level?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          average_rating?: number | null
          city?: string
          created_at?: string | null
          cuisine_types?: string[] | null
          description?: string | null
          halal?: boolean | null
          id?: string
          image_url?: string | null
          latitude?: number
          longitude?: number
          name?: string
          opening_hours?: string | null
          owner_id?: string | null
          price_level?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurants_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      swipe_events: {
        Row: {
          action: Database["public"]["Enums"]["swipe_action"]
          created_at: string | null
          id: string
          target_id: string
          target_type: Database["public"]["Enums"]["item_type"]
          user_id: string
        }
        Insert: {
          action: Database["public"]["Enums"]["swipe_action"]
          created_at?: string | null
          id?: string
          target_id: string
          target_type: Database["public"]["Enums"]["item_type"]
          user_id: string
        }
        Update: {
          action?: Database["public"]["Enums"]["swipe_action"]
          created_at?: string | null
          id?: string
          target_id?: string
          target_type?: Database["public"]["Enums"]["item_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "swipe_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_likes: {
        Row: {
          created_at: string | null
          id: string
          user_id: string
          video_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          user_id: string
          video_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_likes_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          like_count: number | null
          restaurant_id: string
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          video_url: string
          view_count: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          like_count?: number | null
          restaurant_id: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          video_url: string
          view_count?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          like_count?: number | null
          restaurant_id?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          video_url?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "videos_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_video_like: { Args: { video_uuid: string }; Returns: undefined }
      increment_video_stat: {
        Args: { stat_type: string; video_uuid: string }
        Returns: undefined
      }
    }
    Enums: {
      collection_type: "RESTAURANT" | "RECIPE"
      item_type: "RESTAURANT" | "VIDEO" | "RECIPE"
      recipe_source: "AI" | "USER"
      swipe_action: "LIKE" | "DISLIKE" | "VIEW"
      user_role: "USER" | "OWNER" | "ADMIN"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      collection_type: ["RESTAURANT", "RECIPE"],
      item_type: ["RESTAURANT", "VIDEO", "RECIPE"],
      recipe_source: ["AI", "USER"],
      swipe_action: ["LIKE", "DISLIKE", "VIEW"],
      user_role: ["USER", "OWNER", "ADMIN"],
    },
  },
} as const
