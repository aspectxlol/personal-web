import type { FormStatus } from "@/lib/forms/types";

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
      forms: {
        Row: {
          id: string;
          user_id: string;
          owner_id?: string | null;
          title: string;
          description: string | null;
          slug?: string | null;
          status: FormStatus;
          draft_definition?: Json | null;
          published_version_id?: string | null;
          accepting_responses?: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          owner_id?: string | null;
          title: string;
          description?: string | null;
          slug?: string | null;
          status?: FormStatus;
          draft_definition?: Json | null;
          published_version_id?: string | null;
          accepting_responses?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          owner_id?: string | null;
          title?: string;
          description?: string | null;
          slug?: string | null;
          status?: FormStatus;
          draft_definition?: Json | null;
          published_version_id?: string | null;
          accepting_responses?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      form_versions: {
        Row: {
          id: string;
          form_id: string;
          version_number: number;
          definition: Json;
          created_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          form_id: string;
          version_number: number;
          definition: Json;
          created_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          form_id?: string;
          version_number?: number;
          definition?: Json;
          created_at?: string;
          created_by?: string;
        };
        Relationships: [];
      };
      form_responses: {
        Row: {
          id: string;
          form_id: string;
          form_version_id: string;
          answers: Json;
          respondent_name: string | null;
          respondent_email: string | null;
          respondent_user_id: string | null;
          one_response_per_account: boolean;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          form_id: string;
          form_version_id: string;
          answers?: Json;
          respondent_name?: string | null;
          respondent_email?: string | null;
          respondent_user_id?: string | null;
          one_response_per_account?: boolean;
          submitted_at?: string;
        };
        Update: {
          id?: string;
          form_id?: string;
          form_version_id?: string;
          answers?: Json;
          respondent_name?: string | null;
          respondent_email?: string | null;
          respondent_user_id?: string | null;
          one_response_per_account?: boolean;
          submitted_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
