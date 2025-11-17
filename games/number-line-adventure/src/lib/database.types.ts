export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      game_sessions: {
        Row: {
          answers: Json
          best_streak: number
          completed_at: string | null
          id: string
          level_number: number
          score: number
          user_id: string
        }
        Insert: {
          answers: Json
          best_streak: number
          completed_at?: string | null
          id?: string
          level_number: number
          score: number
          user_id: string
        }
        Update: {
          answers?: Json
          best_streak?: number
          completed_at?: string | null
          id?: string
          level_number?: number
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_sessions_level_number_fkey"
            columns: ["level_number"]
            isOneToOne: false
            referencedRelation: "level_definitions"
            referencedColumns: ["level_number"]
          },
        ]
      }
      level_definitions: {
        Row: {
          created_at: string | null
          delta: number
          id: number
          level_number: number
          max_range: number | null
          min_range: number | null
          operations: string[] | null
          required_accuracy: number | null
        }
        Insert: {
          created_at?: string | null
          delta: number
          id?: number
          level_number: number
          max_range?: number | null
          min_range?: number | null
          operations?: string[] | null
          required_accuracy?: number | null
        }
        Update: {
          created_at?: string | null
          delta?: number
          id?: number
          level_number?: number
          max_range?: number | null
          min_range?: number | null
          operations?: string[] | null
          required_accuracy?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_emoji: string | null
          coins: number | null
          created_at: string | null
          display_name: string
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_emoji?: string | null
          coins?: number | null
          created_at?: string | null
          display_name: string
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_emoji?: string | null
          coins?: number | null
          created_at?: string | null
          display_name?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          best_score: number | null
          best_streak: number | null
          completed_at: string | null
          created_at: string | null
          id: number
          is_completed: boolean | null
          is_unlocked: boolean | null
          last_played_at: string | null
          level_number: number
          total_attempts: number | null
          total_correct: number | null
          unlocked_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          best_score?: number | null
          best_streak?: number | null
          completed_at?: string | null
          created_at?: string | null
          id?: number
          is_completed?: boolean | null
          is_unlocked?: boolean | null
          last_played_at?: string | null
          level_number: number
          total_attempts?: number | null
          total_correct?: number | null
          unlocked_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          best_score?: number | null
          best_streak?: number | null
          completed_at?: string | null
          created_at?: string | null
          id?: number
          is_completed?: boolean | null
          is_unlocked?: boolean | null
          last_played_at?: string | null
          level_number?: number
          total_attempts?: number | null
          total_correct?: number | null
          unlocked_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_level_number_fkey"
            columns: ["level_number"]
            isOneToOne: false
            referencedRelation: "level_definitions"
            referencedColumns: ["level_number"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      initialize_user_progress: {
        Args: { new_user_id: string }
        Returns: undefined
      }
      unlock_next_level_if_qualified: {
        Args: { p_level_number: number; p_score: number; p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

