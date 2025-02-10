export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      archived_todos: {
        Row: {
          archived_at: string | null
          category: string | null
          completed: boolean | null
          completion_date: string | null
          id: string
          original_todo_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          category?: string | null
          completed?: boolean | null
          completion_date?: string | null
          id?: string
          original_todo_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          archived_at?: string | null
          category?: string | null
          completed?: boolean | null
          completion_date?: string | null
          id?: string
          original_todo_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "archived_todos_original_todo_id_fkey"
            columns: ["original_todo_id"]
            isOneToOne: false
            referencedRelation: "todos"
            referencedColumns: ["id"]
          },
        ]
      }
      attitude_goals: {
        Row: {
          created_at: string
          embodiment_practice: string | null
          goal_statement: string
          habit_id: string | null
          id: string
          if_then_plan: string | null
          target_emotion: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          embodiment_practice?: string | null
          goal_statement: string
          habit_id?: string | null
          id?: string
          if_then_plan?: string | null
          target_emotion?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          embodiment_practice?: string | null
          goal_statement?: string
          habit_id?: string | null
          id?: string
          if_then_plan?: string | null
          target_emotion?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attitude_goals_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          achieved_at: string
          badge_type: string
          created_at: string
          habit_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          achieved_at?: string
          badge_type: string
          created_at?: string
          habit_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          achieved_at?: string
          badge_type?: string
          created_at?: string
          habit_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "badges_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      big_five_results: {
        Row: {
          agreeableness: number | null
          conscientiousness: number | null
          created_at: string
          extraversion: number | null
          id: string
          neuroticism: number | null
          openness: number | null
          pdf_url: string | null
          user_id: string
        }
        Insert: {
          agreeableness?: number | null
          conscientiousness?: number | null
          created_at?: string
          extraversion?: number | null
          id?: string
          neuroticism?: number | null
          openness?: number | null
          pdf_url?: string | null
          user_id: string
        }
        Update: {
          agreeableness?: number | null
          conscientiousness?: number | null
          created_at?: string
          extraversion?: number | null
          id?: string
          neuroticism?: number | null
          openness?: number | null
          pdf_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "big_five_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coaching_reflections: {
        Row: {
          challenges: string | null
          created_at: string
          energy_level: number | null
          id: string
          mood_rating: number | null
          reflection_date: string | null
          solutions: string | null
          strengths_used: string[] | null
          user_id: string
          values_alignment: string | null
        }
        Insert: {
          challenges?: string | null
          created_at?: string
          energy_level?: number | null
          id?: string
          mood_rating?: number | null
          reflection_date?: string | null
          solutions?: string | null
          strengths_used?: string[] | null
          user_id: string
          values_alignment?: string | null
        }
        Update: {
          challenges?: string | null
          created_at?: string
          energy_level?: number | null
          id?: string
          mood_rating?: number | null
          reflection_date?: string | null
          solutions?: string | null
          strengths_used?: string[] | null
          user_id?: string
          values_alignment?: string | null
        }
        Relationships: []
      }
      habit_completions: {
        Row: {
          completed_date: string
          completion_type: string | null
          created_at: string
          habit_id: string
          id: string
          user_id: string
        }
        Insert: {
          completed_date?: string
          completion_type?: string | null
          created_at?: string
          habit_id: string
          id?: string
          user_id: string
        }
        Update: {
          completed_date?: string
          completion_type?: string | null
          created_at?: string
          habit_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_completions_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habit_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_emotions: {
        Row: {
          created_at: string | null
          emotion: string
          habit_id: string | null
          id: string
          note: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          emotion: string
          habit_id?: string | null
          id?: string
          note?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          emotion?: string
          habit_id?: string | null
          id?: string
          note?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_habit_emotions_habit"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_habit_emotions_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habit_emotions_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habit_emotions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_reflections: {
        Row: {
          created_at: string
          habit_id: string
          id: string
          reflection_text: string | null
          srhi_score: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          habit_id: string
          id?: string
          reflection_text?: string | null
          srhi_score?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          habit_id?: string
          id?: string
          reflection_text?: string | null
          srhi_score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_reflections_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habit_reflections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_schedules: {
        Row: {
          created_at: string
          habit_id: string | null
          id: string
          scheduled_date: string | null
          scheduled_time: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          habit_id?: string | null
          id?: string
          scheduled_date?: string | null
          scheduled_time?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          habit_id?: string | null
          id?: string
          scheduled_date?: string | null
          scheduled_time?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "habit_schedules_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habit_schedules_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          category: string
          context: string | null
          craving: string | null
          created_at: string
          cue: string | null
          difficulty: string | null
          difficulty_level: string | null
          effort: string | null
          elastic_level: string | null
          frequency: string | null
          hook_trigger: string | null
          id: string
          identity: string | null
          last_completed_at: string | null
          last_motivation_check: string | null
          life_area: string | null
          monthly_streak: number | null
          name: string
          phase: string | null
          reminder_time: string | null
          reminder_type: string | null
          repetition_type: string | null
          reward: string | null
          satisfaction_level: string | null
          smart_goal: string | null
          streak_count: number | null
          time_of_day: string | null
          user_id: string
          variable_reward_type: string | null
          weekly_streak: number | null
          why: string | null
          why_description: string | null
        }
        Insert: {
          category: string
          context?: string | null
          craving?: string | null
          created_at?: string
          cue?: string | null
          difficulty?: string | null
          difficulty_level?: string | null
          effort?: string | null
          elastic_level?: string | null
          frequency?: string | null
          hook_trigger?: string | null
          id?: string
          identity?: string | null
          last_completed_at?: string | null
          last_motivation_check?: string | null
          life_area?: string | null
          monthly_streak?: number | null
          name: string
          phase?: string | null
          reminder_time?: string | null
          reminder_type?: string | null
          repetition_type?: string | null
          reward?: string | null
          satisfaction_level?: string | null
          smart_goal?: string | null
          streak_count?: number | null
          time_of_day?: string | null
          user_id: string
          variable_reward_type?: string | null
          weekly_streak?: number | null
          why?: string | null
          why_description?: string | null
        }
        Update: {
          category?: string
          context?: string | null
          craving?: string | null
          created_at?: string
          cue?: string | null
          difficulty?: string | null
          difficulty_level?: string | null
          effort?: string | null
          elastic_level?: string | null
          frequency?: string | null
          hook_trigger?: string | null
          id?: string
          identity?: string | null
          last_completed_at?: string | null
          last_motivation_check?: string | null
          life_area?: string | null
          monthly_streak?: number | null
          name?: string
          phase?: string | null
          reminder_time?: string | null
          reminder_type?: string | null
          repetition_type?: string | null
          reward?: string | null
          satisfaction_level?: string | null
          smart_goal?: string | null
          streak_count?: number | null
          time_of_day?: string | null
          user_id?: string
          variable_reward_type?: string | null
          weekly_streak?: number | null
          why?: string | null
          why_description?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "habits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      keystone_habits: {
        Row: {
          created_at: string
          description: string | null
          guideline: string | null
          habit_id: string | null
          habit_name: string
          id: string
          is_active: boolean | null
          life_area: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          guideline?: string | null
          habit_id?: string | null
          habit_name: string
          id?: string
          is_active?: boolean | null
          life_area: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          guideline?: string | null
          habit_id?: string | null
          habit_name?: string
          id?: string
          is_active?: boolean | null
          life_area?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "keystone_habits_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "keystone_habits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_responses: {
        Row: {
          created_at: string
          id: string
          question_key: string
          response: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          question_key: string
          response: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          question_key?: string
          response?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_responses_user_id_fkey"
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
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      reflection_questions: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          question: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          question: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          question?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_reflection_questions_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reflection_questions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      timebox_entries: {
        Row: {
          created_at: string
          date: string
          habit_id: string | null
          id: string
          time_slot: string
          todo_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          habit_id?: string | null
          id?: string
          time_slot: string
          todo_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          habit_id?: string | null
          id?: string
          time_slot?: string
          todo_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "timebox_entries_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timebox_entries_todo_id_fkey"
            columns: ["todo_id"]
            isOneToOne: false
            referencedRelation: "todos"
            referencedColumns: ["id"]
          },
        ]
      }
      todos: {
        Row: {
          category: string | null
          completed: boolean | null
          created_at: string
          due_date: string | null
          id: string
          priority: number
          scheduled_time: string | null
          title: string
          user_id: string
        }
        Insert: {
          category?: string | null
          completed?: boolean | null
          created_at?: string
          due_date?: string | null
          id?: string
          priority: number
          scheduled_time?: string | null
          title: string
          user_id: string
        }
        Update: {
          category?: string | null
          completed?: boolean | null
          created_at?: string
          due_date?: string | null
          id?: string
          priority?: number
          scheduled_time?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "todos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      zrm_resources: {
        Row: {
          created_at: string
          emotion_association: string | null
          habit_id: string | null
          id: string
          resource_content: string
          resource_type: string
          somatic_marker_strength: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          emotion_association?: string | null
          habit_id?: string | null
          id?: string
          resource_content: string
          resource_type: string
          somatic_marker_strength?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          emotion_association?: string | null
          habit_id?: string | null
          id?: string
          resource_content?: string
          resource_type?: string
          somatic_marker_strength?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "zrm_resources_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      reset_daily_todos: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      reset_daily_tracking: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
