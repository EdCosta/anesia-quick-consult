export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.1';
  };
  public: {
    Tables: {
      alr_blocks: {
        Row: {
          contraindications: Json | null;
          created_at: string;
          drugs: Json | null;
          id: string;
          indications: Json | null;
          region: string;
          tags: Json | null;
          technique: Json | null;
          titles: Json;
          updated_at: string;
        };
        Insert: {
          contraindications?: Json | null;
          created_at?: string;
          drugs?: Json | null;
          id: string;
          indications?: Json | null;
          region: string;
          tags?: Json | null;
          technique?: Json | null;
          titles: Json;
          updated_at?: string;
        };
        Update: {
          contraindications?: Json | null;
          created_at?: string;
          drugs?: Json | null;
          id?: string;
          indications?: Json | null;
          region?: string;
          tags?: Json | null;
          technique?: Json | null;
          titles?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      drugs: {
        Row: {
          class: string | null;
          contraindications: Json | null;
          created_at: string;
          dosing: Json;
          id: string;
          names: Json;
          notes: Json | null;
          tags: Json | null;
          updated_at: string;
        };
        Insert: {
          class?: string | null;
          contraindications?: Json | null;
          created_at?: string;
          dosing?: Json;
          id: string;
          names: Json;
          notes?: Json | null;
          tags?: Json | null;
          updated_at?: string;
        };
        Update: {
          class?: string | null;
          contraindications?: Json | null;
          created_at?: string;
          dosing?: Json;
          id?: string;
          names?: Json;
          notes?: Json | null;
          tags?: Json | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      guidelines: {
        Row: {
          category: string;
          created_at: string;
          id: string;
          items: Json;
          refs: Json | null;
          tags: Json | null;
          titles: Json;
          updated_at: string;
        };
        Insert: {
          category: string;
          created_at?: string;
          id: string;
          items: Json;
          refs?: Json | null;
          tags?: Json | null;
          titles: Json;
          updated_at?: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          id?: string;
          items?: Json;
          refs?: Json | null;
          tags?: Json | null;
          titles?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      hospital_profiles: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          settings: Json | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id: string;
          name: string;
          settings?: Json | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          settings?: Json | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      import_logs: {
        Row: {
          created_at: string;
          errors: Json | null;
          failed: number;
          id: string;
          success: number;
          total: number;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          errors?: Json | null;
          failed?: number;
          id?: string;
          success?: number;
          total?: number;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          errors?: Json | null;
          failed?: number;
          id?: string;
          success?: number;
          total?: number;
          user_id?: string | null;
        };
        Relationships: [];
      };
      plans: {
        Row: {
          created_at: string;
          features: Json | null;
          id: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          features?: Json | null;
          id: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          features?: Json | null;
          id?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      procedures: {
        Row: {
          content: Json;
          created_at: string;
          id: string;
          is_pro: boolean;
          specialty: string;
          synonyms: Json | null;
          tags: Json | null;
          titles: Json;
          updated_at: string;
        };
        Insert: {
          content: Json;
          created_at?: string;
          id: string;
          is_pro?: boolean;
          specialty: string;
          synonyms?: Json | null;
          tags?: Json | null;
          titles: Json;
          updated_at?: string;
        };
        Update: {
          content?: Json;
          created_at?: string;
          id?: string;
          is_pro?: boolean;
          specialty?: string;
          synonyms?: Json | null;
          tags?: Json | null;
          titles?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      protocoles: {
        Row: {
          category: string;
          created_at: string;
          id: string;
          refs: Json | null;
          steps: Json;
          tags: Json | null;
          titles: Json;
          updated_at: string;
        };
        Insert: {
          category: string;
          created_at?: string;
          id: string;
          refs?: Json | null;
          steps: Json;
          tags?: Json | null;
          titles: Json;
          updated_at?: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          id?: string;
          refs?: Json | null;
          steps?: Json;
          tags?: Json | null;
          titles?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      specialties: {
        Row: {
          created_at: string | null;
          id: string;
          is_active: boolean | null;
          name: Json;
          sort_base: number | null;
          synonyms: Json | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id: string;
          is_active?: boolean | null;
          name?: Json;
          sort_base?: number | null;
          synonyms?: Json | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          name?: Json;
          sort_base?: number | null;
          synonyms?: Json | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      user_entitlements: {
        Row: {
          active: boolean;
          created_at: string;
          expires_at: string | null;
          id: string;
          plan_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          active?: boolean;
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          plan_id?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          active?: boolean;
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          plan_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_entitlements_plan_id_fkey';
            columns: ['plan_id'];
            isOneToOne: false;
            referencedRelation: 'plans';
            referencedColumns: ['id'];
          },
        ];
      };
      user_profiles: {
        Row: {
          created_at: string | null;
          email: string | null;
          name: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          email?: string | null;
          name?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          email?: string | null;
          name?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          role: Database['public']['Enums']['app_role'];
          user_id: string;
        };
        Insert: {
          id?: string;
          role: Database['public']['Enums']['app_role'];
          user_id: string;
        };
        Update: {
          id?: string;
          role?: Database['public']['Enums']['app_role'];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database['public']['Enums']['app_role'];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: 'admin' | 'moderator' | 'user';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ['admin', 'moderator', 'user'],
    },
  },
} as const;
