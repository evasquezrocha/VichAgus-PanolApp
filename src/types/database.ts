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
          button_background_color: string;
          button_text_color: string;
          tab_background_color: string;
          tab_text_color: string;
          tab_active_background_color: string;
          tab_active_text_color: string;
          popup_background_color: string;
          popup_text_color: string;
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
          button_background_color?: string;
          button_text_color?: string;
          tab_background_color?: string;
          tab_text_color?: string;
          tab_active_background_color?: string;
          tab_active_text_color?: string;
          popup_background_color?: string;
          popup_text_color?: string;
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
          button_background_color?: string;
          button_text_color?: string;
          tab_background_color?: string;
          tab_text_color?: string;
          tab_active_background_color?: string;
          tab_active_text_color?: string;
          popup_background_color?: string;
          popup_text_color?: string;
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
      pdf_layout_templates: {
        Row: {
          id: string;
          company_id: string;
          template_key: string;
          name: string;
          description: string | null;
          target_path: string;
          layout_config: Json;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          template_key: string;
          name: string;
          description?: string | null;
          target_path: string;
          layout_config?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          template_key?: string;
          name?: string;
          description?: string | null;
          target_path?: string;
          layout_config?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pdf_layout_templates_company_id_fkey";
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
      tdp_profile_configs: {
        Row: {
          id: string;
          user_id: string;
          profile_code: string;
          full_name: string;
          company_name: string;
          description: string;
          background_1: string;
          use_second_background: boolean;
          background_2: string;
          text_color: string;
          main_button_color: string;
          icon_color: string;
          widget_button_bg: string;
          widget_button_text: string;
          widget_button_hover: string;
          show_save_contact: boolean;
          contact_title: string;
          widget_ids: string[];
          widget_configs: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          profile_code?: string;
          full_name?: string;
          company_name?: string;
          description?: string;
          background_1?: string;
          use_second_background?: boolean;
          background_2?: string;
          text_color?: string;
          main_button_color?: string;
          icon_color?: string;
          widget_button_bg?: string;
          widget_button_text?: string;
          widget_button_hover?: string;
          show_save_contact?: boolean;
          contact_title?: string;
          widget_ids?: string[];
          widget_configs?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          profile_code?: string;
          full_name?: string;
          company_name?: string;
          description?: string;
          background_1?: string;
          use_second_background?: boolean;
          background_2?: string;
          text_color?: string;
          main_button_color?: string;
          icon_color?: string;
          widget_button_bg?: string;
          widget_button_text?: string;
          widget_button_hover?: string;
          show_save_contact?: boolean;
          contact_title?: string;
          widget_ids?: string[];
          widget_configs?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      employee_companies: {
        Row: {
          id: string;
          company_id: string;
          nombre: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          nombre: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          nombre?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "employee_companies_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      employees: {
        Row: {
          id: string;
          company_id: string;
          employee_company_id: string;
          rut: string;
          nombres: string;
          apellidos: string;
          email: string | null;
          telefono: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          employee_company_id: string;
          rut: string;
          nombres: string;
          apellidos: string;
          email?: string | null;
          telefono?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          employee_company_id?: string;
          rut?: string;
          nombres?: string;
          apellidos?: string;
          email?: string | null;
          telefono?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "employees_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "employees_employee_company_id_fkey";
            columns: ["employee_company_id"];
            isOneToOne: false;
            referencedRelation: "employee_companies";
            referencedColumns: ["id"];
          },
        ];
      };
      employee_equipment_assignments: {
        Row: {
          id: string;
          company_id: string;
          equipment_id: string;
          employee_id: string | null;
          assigned_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          equipment_id: string;
          employee_id?: string | null;
          assigned_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          equipment_id?: string;
          employee_id?: string | null;
          assigned_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "employee_equipment_assignments_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "employee_equipment_assignments_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "employee_equipment_assignments_equipment_id_fkey";
            columns: ["equipment_id"];
            isOneToOne: false;
            referencedRelation: "equipments";
            referencedColumns: ["id"];
          },
        ];
      };
      employee_tool_allocations: {
        Row: {
          id: string;
          company_id: string;
          tool_id: string;
          employee_id: string | null;
          quantity: number;
          assigned_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          tool_id: string;
          employee_id?: string | null;
          quantity: number;
          assigned_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          tool_id?: string;
          employee_id?: string | null;
          quantity?: number;
          assigned_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "employee_tool_allocations_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "employee_tool_allocations_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "employee_tool_allocations_tool_id_fkey";
            columns: ["tool_id"];
            isOneToOne: false;
            referencedRelation: "tools";
            referencedColumns: ["id"];
          },
        ];
      };
      employee_transfers: {
        Row: {
          id: string;
          company_id: string;
          transfer_number: number;
          origin_type: string;
          origin_employee_id: string | null;
          origin_location_id: string | null;
          destination_type: string;
          destination_employee_id: string | null;
          destination_location_id: string | null;
          created_by_user_id: string | null;
          signed_by_user_id: string | null;
          signature_data: string | null;
          observations: string | null;
          transfer_date: string;
          transfer_time: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          transfer_number?: number;
          origin_type: string;
          origin_employee_id?: string | null;
          origin_location_id?: string | null;
          destination_type: string;
          destination_employee_id?: string | null;
          destination_location_id?: string | null;
          created_by_user_id?: string | null;
          signed_by_user_id?: string | null;
          signature_data?: string | null;
          observations?: string | null;
          transfer_date: string;
          transfer_time: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          transfer_number?: number;
          origin_type?: string;
          origin_employee_id?: string | null;
          origin_location_id?: string | null;
          destination_type?: string;
          destination_employee_id?: string | null;
          destination_location_id?: string | null;
          created_by_user_id?: string | null;
          signed_by_user_id?: string | null;
          signature_data?: string | null;
          observations?: string | null;
          transfer_date?: string;
          transfer_time?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "employee_transfers_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "employee_transfers_created_by_user_id_fkey";
            columns: ["created_by_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "employee_transfers_destination_employee_id_fkey";
            columns: ["destination_employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "employee_transfers_destination_location_id_fkey";
            columns: ["destination_location_id"];
            isOneToOne: false;
            referencedRelation: "panol_locations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "employee_transfers_origin_employee_id_fkey";
            columns: ["origin_employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "employee_transfers_origin_location_id_fkey";
            columns: ["origin_location_id"];
            isOneToOne: false;
            referencedRelation: "panol_locations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "employee_transfers_signed_by_user_id_fkey";
            columns: ["signed_by_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      employee_transfer_items: {
        Row: {
          id: string;
          transfer_id: string;
          item_type: string;
          equipment_id: string | null;
          tool_id: string | null;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          transfer_id: string;
          item_type: string;
          equipment_id?: string | null;
          tool_id?: string | null;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          transfer_id?: string;
          item_type?: string;
          equipment_id?: string | null;
          tool_id?: string | null;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "employee_transfer_items_transfer_id_fkey";
            columns: ["transfer_id"];
            isOneToOne: false;
            referencedRelation: "employee_transfers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "employee_transfer_items_equipment_id_fkey";
            columns: ["equipment_id"];
            isOneToOne: false;
            referencedRelation: "equipments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "employee_transfer_items_tool_id_fkey";
            columns: ["tool_id"];
            isOneToOne: false;
            referencedRelation: "tools";
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
      panol_locations: {
        Row: {
          id: string;
          company_id: string;
          nombre: string;
          responsible_user_id: string | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          nombre: string;
          responsible_user_id?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          nombre?: string;
          responsible_user_id?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "panol_locations_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "panol_locations_responsible_user_id_fkey";
            columns: ["responsible_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      tools: {
        Row: {
          id: string;
          company_id: string;
          tool_group_id: string;
          ubicacion_id: string;
          codigo: string;
          descripcion: string;
          cantidad: number;
          unidad: string;
          estado: string | null;
          marca: string | null;
          modelo: string | null;
          image_url: string | null;
          image_storage_path: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          tool_group_id: string;
          ubicacion_id: string;
          codigo: string;
          descripcion: string;
          cantidad?: number;
          unidad: string;
          estado?: string | null;
          marca?: string | null;
          modelo?: string | null;
          image_url?: string | null;
          image_storage_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          tool_group_id?: string;
          ubicacion_id?: string;
          codigo?: string;
          descripcion?: string;
          cantidad?: number;
          unidad?: string;
          estado?: string | null;
          marca?: string | null;
          modelo?: string | null;
          image_url?: string | null;
          image_storage_path?: string | null;
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
          {
            foreignKeyName: "tools_ubicacion_id_fkey";
            columns: ["ubicacion_id"];
            isOneToOne: false;
            referencedRelation: "panol_locations";
            referencedColumns: ["id"];
          },
        ];
      };
      tool_custom_fields: {
        Row: {
          id: string;
          company_id: string;
          codigo: string;
          nombre: string;
          field_type: string;
          options: string[];
          is_required: boolean;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          codigo: string;
          nombre: string;
          field_type: string;
          options?: string[];
          is_required?: boolean;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          codigo?: string;
          nombre?: string;
          field_type?: string;
          options?: string[];
          is_required?: boolean;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tool_custom_fields_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      tool_custom_field_values: {
        Row: {
          id: string;
          company_id: string;
          tool_id: string;
          custom_field_id: string;
          value_text: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          tool_id: string;
          custom_field_id: string;
          value_text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          tool_id?: string;
          custom_field_id?: string;
          value_text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tool_custom_field_values_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tool_custom_field_values_tool_id_fkey";
            columns: ["tool_id"];
            isOneToOne: false;
            referencedRelation: "tools";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tool_custom_field_values_custom_field_id_fkey";
            columns: ["custom_field_id"];
            isOneToOne: false;
            referencedRelation: "tool_custom_fields";
            referencedColumns: ["id"];
          },
        ];
      };
      asset_catalog_options: {
        Row: {
          id: string;
          company_id: string;
          field_key: string;
          value: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          field_key: string;
          value: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          field_key?: string;
          value?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "asset_catalog_options_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      assets: {
        Row: {
          id: string;
          company_id: string;
          af: string;
          patente: string;
          tipo: string;
          marca: string;
          modelo: string;
          anio: string;
          centro_costos: string;
          id_gps: string | null;
          horometro: number | null;
          kilometraje: number | null;
          image_url: string | null;
          image_storage_path: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          af: string;
          patente: string;
          tipo: string;
          marca: string;
          modelo: string;
          anio: string;
          centro_costos: string;
          id_gps?: string | null;
          horometro?: number | null;
          kilometraje?: number | null;
          image_url?: string | null;
          image_storage_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          af?: string;
          patente?: string;
          tipo?: string;
          marca?: string;
          modelo?: string;
          anio?: string;
          centro_costos?: string;
          id_gps?: string | null;
          horometro?: number | null;
          kilometraje?: number | null;
          image_url?: string | null;
          image_storage_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "assets_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      asset_document_types: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "asset_document_types_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      asset_document_categories: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "asset_document_categories_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      asset_documents: {
        Row: {
          id: string;
          company_id: string;
          asset_id: string;
          document_type_id: string;
          category: string;
          visible_qr: boolean;
          expiration_date: string | null;
          notice_days: number;
          file_url: string;
          file_storage_path: string;
          file_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          asset_id: string;
          document_type_id: string;
          category: string;
          visible_qr?: boolean;
          expiration_date?: string | null;
          notice_days?: number;
          file_url: string;
          file_storage_path: string;
          file_name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          asset_id?: string;
          document_type_id?: string;
          category?: string;
          visible_qr?: boolean;
          expiration_date?: string | null;
          notice_days?: number;
          file_url?: string;
          file_storage_path?: string;
          file_name?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "asset_documents_asset_id_fkey";
            columns: ["asset_id"];
            isOneToOne: false;
            referencedRelation: "assets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "asset_documents_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "asset_documents_document_type_id_fkey";
            columns: ["document_type_id"];
            isOneToOne: false;
            referencedRelation: "asset_document_types";
            referencedColumns: ["id"];
          },
        ];
      };
      equipment_groups: {
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
            foreignKeyName: "equipment_groups_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      equipments: {
        Row: {
          id: string;
          company_id: string;
          tool_group_id: string;
          ubicacion_id: string;
          codigo: string;
          descripcion: string;
          nro_serie: string | null;
          cantidad: number;
          unidad: string | null;
          estado: string | null;
          marca: string | null;
          modelo: string | null;
          image_url: string | null;
          image_storage_path: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          tool_group_id: string;
          ubicacion_id: string;
          codigo: string;
          descripcion: string;
          nro_serie?: string | null;
          cantidad?: number;
          unidad?: string | null;
          estado?: string | null;
          marca?: string | null;
          modelo?: string | null;
          image_url?: string | null;
          image_storage_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          tool_group_id?: string;
          ubicacion_id?: string;
          codigo?: string;
          descripcion?: string;
          nro_serie?: string | null;
          cantidad?: number;
          unidad?: string | null;
          estado?: string | null;
          marca?: string | null;
          modelo?: string | null;
          image_url?: string | null;
          image_storage_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "equipments_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "equipments_tool_group_id_fkey";
            columns: ["tool_group_id"];
            isOneToOne: false;
            referencedRelation: "equipment_groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "equipments_ubicacion_id_fkey";
            columns: ["ubicacion_id"];
            isOneToOne: false;
            referencedRelation: "panol_locations";
            referencedColumns: ["id"];
          },
        ];
      };
      equipment_custom_fields: {
        Row: {
          id: string;
          company_id: string;
          codigo: string;
          nombre: string;
          field_type: string;
          options: string[];
          is_required: boolean;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          codigo: string;
          nombre: string;
          field_type: string;
          options?: string[];
          is_required?: boolean;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          codigo?: string;
          nombre?: string;
          field_type?: string;
          options?: string[];
          is_required?: boolean;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "equipment_custom_fields_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      equipment_custom_field_values: {
        Row: {
          id: string;
          company_id: string;
          tool_id: string;
          custom_field_id: string;
          value_text: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          tool_id: string;
          custom_field_id: string;
          value_text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          tool_id?: string;
          custom_field_id?: string;
          value_text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "equipment_custom_field_values_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "equipment_custom_field_values_tool_id_fkey";
            columns: ["tool_id"];
            isOneToOne: false;
            referencedRelation: "equipments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "equipment_custom_field_values_custom_field_id_fkey";
            columns: ["custom_field_id"];
            isOneToOne: false;
            referencedRelation: "equipment_custom_fields";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_employee_transfer: {
        Args: {
          p_company_id: string;
          p_created_by_user_id: string;
          p_created_by_is_admin: boolean;
          p_signed_by_user_id: string;
          p_origin_type: string;
          p_origin_employee_id: string | null;
          p_origin_location_id: string | null;
          p_destination_type: string;
          p_destination_employee_id: string | null;
          p_destination_location_id: string | null;
          p_transfer_date: string;
          p_transfer_time: string;
          p_signature_data: string;
          p_observations: string | null;
          p_items: Json;
        };
        Returns: string;
      };
      ensure_profile_for_auth_user: {
        Args: {
          p_bootstrap_super_admin?: boolean;
          p_company_id?: string | null;
          p_email: string;
          p_full_name?: string | null;
          p_is_active?: boolean;
          p_role_id?: string | null;
          p_user_id: string;
        };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
