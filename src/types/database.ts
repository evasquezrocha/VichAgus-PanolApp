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
          rut: string | null;
          logo_url: string | null;
          sidebar_bg_color: string;
          sidebar_text_color: string;
          sidebar_active_bg_color: string;
          sidebar_active_text_color: string;
          platform_background_color: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          rut?: string | null;
          logo_url?: string | null;
          sidebar_bg_color?: string;
          sidebar_text_color?: string;
          sidebar_active_bg_color?: string;
          sidebar_active_text_color?: string;
          platform_background_color?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          rut?: string | null;
          logo_url?: string | null;
          sidebar_bg_color?: string;
          sidebar_text_color?: string;
          sidebar_active_bg_color?: string;
          sidebar_active_text_color?: string;
          platform_background_color?: string;
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
      tool_groups: {
        Row: {
          id: string;
          company_id: string;
          codigo: string;
          descripcion: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          codigo: string;
          descripcion: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          codigo?: string;
          descripcion?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tool_groups_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      tools: {
        Row: {
          id: string;
          company_id: string;
          tool_group_id: string;
          codigo: string;
          descripcion: string;
          cantidad: number;
          unidad: string;
          marca: string | null;
          modelo: string | null;
          image_url: string | null;
          image_dropbox_path: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          tool_group_id: string;
          codigo: string;
          descripcion: string;
          cantidad?: number;
          unidad: string;
          marca?: string | null;
          modelo?: string | null;
          image_url?: string | null;
          image_dropbox_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          tool_group_id?: string;
          codigo?: string;
          descripcion?: string;
          cantidad?: number;
          unidad?: string;
          marca?: string | null;
          modelo?: string | null;
          image_url?: string | null;
          image_dropbox_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tools_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tools_tool_group_id_fkey";
            columns: ["tool_group_id"];
            isOneToOne: false;
            referencedRelation: "tool_groups";
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
