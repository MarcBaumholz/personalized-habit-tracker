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
      building_blocks: {
        Row: {
          category: string
          converted_to_habit_id: string | null
          created_at: string
          description: string | null
          id: string
          impact_area: string[]
          is_converted: boolean | null
          is_favorite: boolean | null
          name: string
        }
        Insert: {
          category: string
          converted_to_habit_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          impact_area?: string[]
          is_converted?: boolean | null
          is_favorite?: boolean | null
          name: string
        }
        Update: {
          category?: string
          converted_to_habit_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          impact_area?: string[]
          is_converted?: boolean | null
          is_favorite?: boolean | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "building_blocks_converted_to_habit_id_fkey"
            columns: ["converted_to_habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_preferences: {
        Row: {
          created_at: string
          default_view: string | null
          end_time: string | null
          id: string
          start_time: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          default_view?: string | null
          end_time?: string | null
          id?: string
          start_time?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          default_view?: string | null
          end_time?: string | null
          id?: string
          start_time?: string | null
          user_id?: string
        }
        Relationships: []
      }
      challenge_participants: {
        Row: {
          challenge_id: string
          created_at: string | null
          id: string
          progress: number | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          created_at?: string | null
          id?: string
          progress?: number | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          created_at?: string | null
          id?: string
          progress?: number | null
          user_id?: string
        }
        Relationships: []
      }
      challenge_proofs: {
        Row: {
          challenge_id: string
          created_at: string
          id: string
          image_url: string
          progress_value: number
          user_id: string
        }
        Insert: {
          challenge_id: string
          created_at?: string
          id?: string
          image_url: string
          progress_value: number
          user_id: string
        }
        Update: {
          challenge_id?: string
          created_at?: string
          id?: string
          image_url?: string
          progress_value?: number
          user_id?: string
        }
        Relationships: []
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
      community_challenges: {
        Row: {
          category: string | null
          created_at: string
          created_by: string
          description: string | null
          end_date: string
          id: string
          legacy_id: string | null
          target_unit: string
          target_value: number
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          end_date: string
          id?: string
          legacy_id?: string | null
          target_unit: string
          target_value: number
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string
          id?: string
          legacy_id?: string | null
          target_unit?: string
          target_value?: number
          title?: string
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
          status: string | null
          user_id: string
        }
        Insert: {
          completed_date?: string
          completion_type?: string | null
          created_at?: string
          habit_id: string
          id?: string
          status?: string | null
          user_id: string
        }
        Update: {
          completed_date?: string
          completion_type?: string | null
          created_at?: string
          habit_id?: string
          id?: string
          status?: string | null
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
      habit_hooked_models: {
        Row: {
          action: string | null
          created_at: string
          five_whys: string[] | null
          habit_id: string
          habit_zone_frequency: string | null
          habit_zone_value: string | null
          id: string
          investment: string | null
          reward_description: string | null
          reward_type: string | null
          trigger_external: string | null
          trigger_internal: string | null
          user_id: string
        }
        Insert: {
          action?: string | null
          created_at?: string
          five_whys?: string[] | null
          habit_id: string
          habit_zone_frequency?: string | null
          habit_zone_value?: string | null
          id?: string
          investment?: string | null
          reward_description?: string | null
          reward_type?: string | null
          trigger_external?: string | null
          trigger_internal?: string | null
          user_id: string
        }
        Update: {
          action?: string | null
          created_at?: string
          five_whys?: string[] | null
          habit_id?: string
          habit_zone_frequency?: string | null
          habit_zone_value?: string | null
          id?: string
          investment?: string | null
          reward_description?: string | null
          reward_type?: string | null
          trigger_external?: string | null
          trigger_internal?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_hooked_models_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_reflections: {
        Row: {
          created_at: string
          habit_id: string
          id: string
          obstacles: string | null
          reflection_text: string | null
          reflection_type: string | null
          srhi_responses: Json | null
          srhi_score: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          habit_id: string
          id?: string
          obstacles?: string | null
          reflection_text?: string | null
          reflection_type?: string | null
          srhi_responses?: Json | null
          srhi_score?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          habit_id?: string
          id?: string
          obstacles?: string | null
          reflection_text?: string | null
          reflection_type?: string | null
          srhi_responses?: Json | null
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
          duration: unknown | null
          habit_id: string | null
          id: string
          position_x: number | null
          position_y: number | null
          repeat_end_date: string | null
          repeat_interval: number | null
          repeat_type: string | null
          scheduled_date: string | null
          scheduled_time: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          duration?: unknown | null
          habit_id?: string | null
          id?: string
          position_x?: number | null
          position_y?: number | null
          repeat_end_date?: string | null
          repeat_interval?: number | null
          repeat_type?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          duration?: unknown | null
          habit_id?: string | null
          id?: string
          position_x?: number | null
          position_y?: number | null
          repeat_end_date?: string | null
          repeat_interval?: number | null
          repeat_type?: string | null
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
      habit_toolboxes: {
        Row: {
          category: string
          craving: string | null
          created_at: string
          cue: string | null
          description: string
          habit_id: string
          id: string
          is_favorite: boolean | null
          minimal_dose: string | null
          reward: string | null
          routine: string | null
          steps: string[] | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          category?: string
          craving?: string | null
          created_at?: string
          cue?: string | null
          description: string
          habit_id: string
          id?: string
          is_favorite?: boolean | null
          minimal_dose?: string | null
          reward?: string | null
          routine?: string | null
          steps?: string[] | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          category?: string
          craving?: string | null
          created_at?: string
          cue?: string | null
          description?: string
          habit_id?: string
          id?: string
          is_favorite?: boolean | null
          minimal_dose?: string | null
          reward?: string | null
          routine?: string | null
          steps?: string[] | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_toolboxes_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
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
          is_favorite: boolean | null
          is_keystone: boolean | null
          last_completed_at: string | null
          last_motivation_check: string | null
          life_area: string | null
          minimal_dose: string | null
          monthly_streak: number | null
          name: string
          pause_reason: string | null
          pause_until: string | null
          paused: boolean | null
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
          is_favorite?: boolean | null
          is_keystone?: boolean | null
          last_completed_at?: string | null
          last_motivation_check?: string | null
          life_area?: string | null
          minimal_dose?: string | null
          monthly_streak?: number | null
          name: string
          pause_reason?: string | null
          pause_until?: string | null
          paused?: boolean | null
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
          is_favorite?: boolean | null
          is_keystone?: boolean | null
          last_completed_at?: string | null
          last_motivation_check?: string | null
          life_area?: string | null
          minimal_dose?: string | null
          monthly_streak?: number | null
          name?: string
          pause_reason?: string | null
          pause_until?: string | null
          paused?: boolean | null
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
          habit_id: string
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
          habit_id: string
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
          habit_id?: string
          habit_name?: string
          id?: string
          is_active?: boolean | null
          life_area?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_keystone_habit"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
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
      profile_sections: {
        Row: {
          content: Json
          created_at: string
          id: string
          last_edited_at: string
          section_key: string
          user_id: string
        }
        Insert: {
          content: Json
          created_at?: string
          id?: string
          last_edited_at?: string
          section_key: string
          user_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          last_edited_at?: string
          section_key?: string
          user_id?: string
        }
        Relationships: []
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
      get_last_24h_todo_stats: {
        Args: { p_user_id: string }
        Returns: Json
      }
      increment_participant_progress: {
        Args: {
          p_user_id: string
          p_challenge_id: string
          p_progress_value: number
        }
        Returns: number
      }
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
