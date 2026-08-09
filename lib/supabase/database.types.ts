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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      guests: {
        Row: {
          created_at: string
          id: string
          name: string
          note: string
          wedding_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          note?: string
          wedding_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          note?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guests_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
        }
        Relationships: []
      }
      rsvps: {
        Row: {
          adults: number
          attending: boolean
          children: number
          created_at: string
          id: string
          message: string
          name: string
          wedding_id: string
        }
        Insert: {
          adults?: number
          attending: boolean
          children?: number
          created_at?: string
          id?: string
          message?: string
          name: string
          wedding_id: string
        }
        Update: {
          adults?: number
          attending?: boolean
          children?: number
          created_at?: string
          id?: string
          message?: string
          name?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rsvps_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      wedding_photos: {
        Row: {
          created_at: string
          id: string
          kind: string
          sort_order: number
          storage_path: string
          wedding_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          sort_order?: number
          storage_path: string
          wedding_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          sort_order?: number
          storage_path?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wedding_photos_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      weddings: {
        Row: {
          bride_name: string
          bride_parents: string
          created_at: string
          event_date: string | null
          groom_name: string
          groom_parents: string
          id: string
          owner_id: string
          schedule: Json
          seal: string
          show_family: boolean
          show_rsvp: boolean
          show_schedule: boolean
          slug: string
          status: string
          template_id: string
          thanks_message: string
          theme: string
          timezone: string
          updated_at: string
          venue_address: string
          venue_hall: string
          venue_lat: number | null
          venue_lng: number | null
          venue_name: string
        }
        Insert: {
          bride_name?: string
          bride_parents?: string
          created_at?: string
          event_date?: string | null
          groom_name?: string
          groom_parents?: string
          id?: string
          owner_id: string
          schedule?: Json
          seal?: string
          show_family?: boolean
          show_rsvp?: boolean
          show_schedule?: boolean
          slug: string
          status?: string
          template_id?: string
          thanks_message?: string
          theme?: string
          timezone?: string
          updated_at?: string
          venue_address?: string
          venue_hall?: string
          venue_lat?: number | null
          venue_lng?: number | null
          venue_name?: string
        }
        Update: {
          bride_name?: string
          bride_parents?: string
          created_at?: string
          event_date?: string | null
          groom_name?: string
          groom_parents?: string
          id?: string
          owner_id?: string
          schedule?: Json
          seal?: string
          show_family?: boolean
          show_rsvp?: boolean
          show_schedule?: boolean
          slug?: string
          status?: string
          template_id?: string
          thanks_message?: string
          theme?: string
          timezone?: string
          updated_at?: string
          venue_address?: string
          venue_hall?: string
          venue_lat?: number | null
          venue_lng?: number | null
          venue_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
  public: {
    Enums: {},
  },
} as const
