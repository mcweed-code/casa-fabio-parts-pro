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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      client_coefficients: {
        Row: {
          created_at: string | null
          general_coef: number
          id: string
          mode: string
          subcategory_coefs: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          general_coef?: number
          id?: string
          mode?: string
          subcategory_coefs?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          general_coef?: number
          id?: string
          mode?: string
          subcategory_coefs?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      client_profiles: {
        Row: {
          created_at: string | null
          cuit_dni: string
          direccion: string | null
          email: string
          email_verified: boolean | null
          id: string
          numero_cliente: string | null
          razon_social: string
          setup_completed: boolean | null
          updated_at: string | null
          user_id: string
          whatsapp: string
          whatsapp_verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          cuit_dni: string
          direccion?: string | null
          email: string
          email_verified?: boolean | null
          id?: string
          numero_cliente?: string | null
          razon_social: string
          setup_completed?: boolean | null
          updated_at?: string | null
          user_id: string
          whatsapp: string
          whatsapp_verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          cuit_dni?: string
          direccion?: string | null
          email?: string
          email_verified?: boolean | null
          id?: string
          numero_cliente?: string | null
          razon_social?: string
          setup_completed?: boolean | null
          updated_at?: string | null
          user_id?: string
          whatsapp?: string
          whatsapp_verified?: boolean | null
        }
        Relationships: []
      }
      client_subcategory_coefficients: {
        Row: {
          client_id: string
          coefficient: number
          id: string
          subcategory_id: string
          updated_at: string | null
        }
        Insert: {
          client_id: string
          coefficient?: number
          id?: string
          subcategory_id: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          coefficient?: number
          id?: string
          subcategory_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_subcategory_coefficients_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_subcategory_coefficients_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      pdf_catalogs: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          enabled: boolean | null
          file_url: string
          id: string
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          enabled?: boolean | null
          file_url: string
          id?: string
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          enabled?: boolean | null
          file_url?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      saved_orders: {
        Row: {
          created_at: string | null
          id: string
          order_data: Json
          pdf_url: string | null
          total: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_data: Json
          pdf_url?: string | null
          total: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          order_data?: Json
          pdf_url?: string | null
          total?: number
          user_id?: string
        }
        Relationships: []
      }
      subcategories: {
        Row: {
          active: boolean | null
          category_id: string
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          active?: boolean | null
          category_id: string
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          active?: boolean | null
          category_id?: string
          created_at?: string | null
          id?: string
          name?: string
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
