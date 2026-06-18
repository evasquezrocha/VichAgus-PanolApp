export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          slug: string;
          custom_domain: string | null;
          rut: string | null;
          logo_url: string | null;
          sidebar_bg_color: string;
          sidebar_text_color: string;
          sidebar_active_bg_color: string;
          sidebar_active_text_color: string;
          platform_background_color: string;
          popup_bg_color: string;
          popup_text_color: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          custom_domain?: string | null;
          rut?: string | null;
          logo_url?: string | null;
          sidebar_bg_color?: string;
          sidebar_text_color?: string;
          sidebar_active_bg_color?: string;
          sidebar_active_text_color?: string;
          platform_background_color?: string;
          popup_bg_color?: string;
          popup_text_color?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          custom_domain?: string | null;
          rut?: string | null;
          logo_url?: string | null;
          sidebar_bg_color?: string;
          sidebar_text_color?: string;
          sidebar_active_bg_color?: string;
          sidebar_active_text_color?: string;
          platform_background_color?: string;
          popup_bg_color?: string;
          popup_text_color?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      app_roles: {
        Row: {
          id: string;
          company_id: string | null;
          name: string;
          slug: string;
          description: string | null;
          permissions: string[];
          is_system: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id?: string | null;
          name: string;
          slug: string;
          description?: string | null;
          permissions?: string[];
          is_system?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string | null;
          name?: string;
          slug?: string;
          description?: string | null;
          permissions?: string[];
          is_system?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "app_roles_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          id: string;
          company_id: string | null;
          role_id: string | null;
          full_name: string | null;
          email: string;
          role: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          company_id?: string | null;
          role_id?: string | null;
          full_name?: string | null;
          email: string;
          role: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string | null;
          role_id?: string | null;
          full_name?: string | null;
          email?: string;
          role?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profiles_role_id_fkey";
            columns: ["role_id"];
            isOneToOne: false;
            referencedRelation: "app_roles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
