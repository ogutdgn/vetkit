export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5';
  };
  public: {
    Tables: {
      blog_post_related_posts: {
        Row: {
          blog_post_id: string;
          position: number;
          related_post_id: string;
          tenant_id: string;
        };
        Insert: {
          blog_post_id: string;
          position?: number;
          related_post_id: string;
          tenant_id: string;
        };
        Update: {
          blog_post_id?: string;
          position?: number;
          related_post_id?: string;
          tenant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'blog_post_related_posts_blog_post_id_fkey';
            columns: ['blog_post_id'];
            isOneToOne: false;
            referencedRelation: 'blog_posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'blog_post_related_posts_related_post_id_fkey';
            columns: ['related_post_id'];
            isOneToOne: false;
            referencedRelation: 'blog_posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'blog_post_related_posts_tenant_id_fkey';
            columns: ['tenant_id'];
            isOneToOne: false;
            referencedRelation: 'tenants';
            referencedColumns: ['id'];
          },
        ];
      };
      blog_post_related_services: {
        Row: {
          blog_post_id: string;
          position: number;
          service_id: string;
          tenant_id: string;
        };
        Insert: {
          blog_post_id: string;
          position?: number;
          service_id: string;
          tenant_id: string;
        };
        Update: {
          blog_post_id?: string;
          position?: number;
          service_id?: string;
          tenant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'blog_post_related_services_blog_post_id_fkey';
            columns: ['blog_post_id'];
            isOneToOne: false;
            referencedRelation: 'blog_posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'blog_post_related_services_service_id_fkey';
            columns: ['service_id'];
            isOneToOne: false;
            referencedRelation: 'services';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'blog_post_related_services_tenant_id_fkey';
            columns: ['tenant_id'];
            isOneToOne: false;
            referencedRelation: 'tenants';
            referencedColumns: ['id'];
          },
        ];
      };
      blog_posts: {
        Row: {
          author_id: string | null;
          body: Json | null;
          category: string | null;
          cover_image_media_id: string | null;
          created_at: string;
          excerpt: string | null;
          id: string;
          meta_description: string | null;
          meta_title: string | null;
          no_index: boolean;
          og_image_id: string | null;
          published_at: string | null;
          slug: string;
          sort_order: number;
          status: string;
          tags: string[];
          tenant_id: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          author_id?: string | null;
          body?: Json | null;
          category?: string | null;
          cover_image_media_id?: string | null;
          created_at?: string;
          excerpt?: string | null;
          id?: string;
          meta_description?: string | null;
          meta_title?: string | null;
          no_index?: boolean;
          og_image_id?: string | null;
          published_at?: string | null;
          slug: string;
          sort_order?: number;
          status?: string;
          tags?: string[];
          tenant_id: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          author_id?: string | null;
          body?: Json | null;
          category?: string | null;
          cover_image_media_id?: string | null;
          created_at?: string;
          excerpt?: string | null;
          id?: string;
          meta_description?: string | null;
          meta_title?: string | null;
          no_index?: boolean;
          og_image_id?: string | null;
          published_at?: string | null;
          slug?: string;
          sort_order?: number;
          status?: string;
          tags?: string[];
          tenant_id?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'blog_posts_author_id_fkey';
            columns: ['author_id'];
            isOneToOne: false;
            referencedRelation: 'team_members';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'blog_posts_cover_image_media_id_fkey';
            columns: ['cover_image_media_id'];
            isOneToOne: false;
            referencedRelation: 'media';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'blog_posts_og_image_id_fkey';
            columns: ['og_image_id'];
            isOneToOne: false;
            referencedRelation: 'media';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'blog_posts_tenant_id_fkey';
            columns: ['tenant_id'];
            isOneToOne: false;
            referencedRelation: 'tenants';
            referencedColumns: ['id'];
          },
        ];
      };
      faqs: {
        Row: {
          answer: Json | null;
          category: string | null;
          created_at: string;
          id: string;
          published_at: string | null;
          question: string;
          sort_order: number;
          status: string;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          answer?: Json | null;
          category?: string | null;
          created_at?: string;
          id?: string;
          published_at?: string | null;
          question: string;
          sort_order?: number;
          status?: string;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          answer?: Json | null;
          category?: string | null;
          created_at?: string;
          id?: string;
          published_at?: string | null;
          question?: string;
          sort_order?: number;
          status?: string;
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'faqs_tenant_id_fkey';
            columns: ['tenant_id'];
            isOneToOne: false;
            referencedRelation: 'tenants';
            referencedColumns: ['id'];
          },
        ];
      };
      gallery_images: {
        Row: {
          caption: string | null;
          category: string | null;
          created_at: string;
          id: string;
          media_id: string | null;
          published_at: string | null;
          sort_order: number;
          status: string;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          caption?: string | null;
          category?: string | null;
          created_at?: string;
          id?: string;
          media_id?: string | null;
          published_at?: string | null;
          sort_order?: number;
          status?: string;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          caption?: string | null;
          category?: string | null;
          created_at?: string;
          id?: string;
          media_id?: string | null;
          published_at?: string | null;
          sort_order?: number;
          status?: string;
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'gallery_images_media_id_fkey';
            columns: ['media_id'];
            isOneToOne: false;
            referencedRelation: 'media';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'gallery_images_tenant_id_fkey';
            columns: ['tenant_id'];
            isOneToOne: false;
            referencedRelation: 'tenants';
            referencedColumns: ['id'];
          },
        ];
      };
      hero_slides: {
        Row: {
          created_at: string;
          cta: Json | null;
          heading: string;
          id: string;
          media_id: string | null;
          sort_order: number;
          subheading: string | null;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          cta?: Json | null;
          heading: string;
          id?: string;
          media_id?: string | null;
          sort_order?: number;
          subheading?: string | null;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          cta?: Json | null;
          heading?: string;
          id?: string;
          media_id?: string | null;
          sort_order?: number;
          subheading?: string | null;
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'hero_slides_media_id_fkey';
            columns: ['media_id'];
            isOneToOne: false;
            referencedRelation: 'media';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'hero_slides_tenant_id_fkey';
            columns: ['tenant_id'];
            isOneToOne: false;
            referencedRelation: 'tenants';
            referencedColumns: ['id'];
          },
        ];
      };
      media: {
        Row: {
          alt: string | null;
          bucket_path: string;
          created_at: string;
          focal_x: number | null;
          focal_y: number | null;
          height: number | null;
          id: string;
          mime: string | null;
          tenant_id: string;
          width: number | null;
        };
        Insert: {
          alt?: string | null;
          bucket_path: string;
          created_at?: string;
          focal_x?: number | null;
          focal_y?: number | null;
          height?: number | null;
          id?: string;
          mime?: string | null;
          tenant_id: string;
          width?: number | null;
        };
        Update: {
          alt?: string | null;
          bucket_path?: string;
          created_at?: string;
          focal_x?: number | null;
          focal_y?: number | null;
          height?: number | null;
          id?: string;
          mime?: string | null;
          tenant_id?: string;
          width?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'media_tenant_id_fkey';
            columns: ['tenant_id'];
            isOneToOne: false;
            referencedRelation: 'tenants';
            referencedColumns: ['id'];
          },
        ];
      };
      memberships: {
        Row: {
          created_at: string;
          id: string;
          role: string;
          tenant_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role?: string;
          tenant_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: string;
          tenant_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'memberships_tenant_id_fkey';
            columns: ['tenant_id'];
            isOneToOne: false;
            referencedRelation: 'tenants';
            referencedColumns: ['id'];
          },
        ];
      };
      page_featured_team_members: {
        Row: {
          page_id: string;
          position: number;
          team_member_id: string;
          tenant_id: string;
        };
        Insert: {
          page_id: string;
          position?: number;
          team_member_id: string;
          tenant_id: string;
        };
        Update: {
          page_id?: string;
          position?: number;
          team_member_id?: string;
          tenant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'page_featured_team_members_page_id_fkey';
            columns: ['page_id'];
            isOneToOne: false;
            referencedRelation: 'pages';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'page_featured_team_members_team_member_id_fkey';
            columns: ['team_member_id'];
            isOneToOne: false;
            referencedRelation: 'team_members';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'page_featured_team_members_tenant_id_fkey';
            columns: ['tenant_id'];
            isOneToOne: false;
            referencedRelation: 'tenants';
            referencedColumns: ['id'];
          },
        ];
      };
      pages: {
        Row: {
          body: Json | null;
          created_at: string;
          cta_buttons: Json | null;
          hero_image_media_id: string | null;
          id: string;
          meta_description: string | null;
          meta_title: string | null;
          no_index: boolean;
          og_image_id: string | null;
          published_at: string | null;
          slug: string;
          sort_order: number;
          status: string;
          tenant_id: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          body?: Json | null;
          created_at?: string;
          cta_buttons?: Json | null;
          hero_image_media_id?: string | null;
          id?: string;
          meta_description?: string | null;
          meta_title?: string | null;
          no_index?: boolean;
          og_image_id?: string | null;
          published_at?: string | null;
          slug: string;
          sort_order?: number;
          status?: string;
          tenant_id: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          body?: Json | null;
          created_at?: string;
          cta_buttons?: Json | null;
          hero_image_media_id?: string | null;
          id?: string;
          meta_description?: string | null;
          meta_title?: string | null;
          no_index?: boolean;
          og_image_id?: string | null;
          published_at?: string | null;
          slug?: string;
          sort_order?: number;
          status?: string;
          tenant_id?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'pages_hero_image_media_id_fkey';
            columns: ['hero_image_media_id'];
            isOneToOne: false;
            referencedRelation: 'media';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'pages_og_image_id_fkey';
            columns: ['og_image_id'];
            isOneToOne: false;
            referencedRelation: 'media';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'pages_tenant_id_fkey';
            columns: ['tenant_id'];
            isOneToOne: false;
            referencedRelation: 'tenants';
            referencedColumns: ['id'];
          },
        ];
      };
      platform_admins: {
        Row: {
          created_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          full_name: string | null;
          id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          full_name?: string | null;
          id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          full_name?: string | null;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      service_related_faqs: {
        Row: {
          faq_id: string;
          position: number;
          service_id: string;
          tenant_id: string;
        };
        Insert: {
          faq_id: string;
          position?: number;
          service_id: string;
          tenant_id: string;
        };
        Update: {
          faq_id?: string;
          position?: number;
          service_id?: string;
          tenant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'service_related_faqs_faq_id_fkey';
            columns: ['faq_id'];
            isOneToOne: false;
            referencedRelation: 'faqs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'service_related_faqs_service_id_fkey';
            columns: ['service_id'];
            isOneToOne: false;
            referencedRelation: 'services';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'service_related_faqs_tenant_id_fkey';
            columns: ['tenant_id'];
            isOneToOne: false;
            referencedRelation: 'tenants';
            referencedColumns: ['id'];
          },
        ];
      };
      services: {
        Row: {
          created_at: string;
          description: Json | null;
          emergency_available: boolean;
          icon_media_id: string | null;
          id: string;
          main_image_media_id: string | null;
          meta_description: string | null;
          meta_title: string | null;
          no_index: boolean;
          og_image_id: string | null;
          pet_types: string[];
          pricing: string | null;
          published_at: string | null;
          service_location: string;
          short_description: string | null;
          slug: string;
          sort_order: number;
          status: string;
          tenant_id: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: Json | null;
          emergency_available?: boolean;
          icon_media_id?: string | null;
          id?: string;
          main_image_media_id?: string | null;
          meta_description?: string | null;
          meta_title?: string | null;
          no_index?: boolean;
          og_image_id?: string | null;
          pet_types?: string[];
          pricing?: string | null;
          published_at?: string | null;
          service_location?: string;
          short_description?: string | null;
          slug: string;
          sort_order?: number;
          status?: string;
          tenant_id: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: Json | null;
          emergency_available?: boolean;
          icon_media_id?: string | null;
          id?: string;
          main_image_media_id?: string | null;
          meta_description?: string | null;
          meta_title?: string | null;
          no_index?: boolean;
          og_image_id?: string | null;
          pet_types?: string[];
          pricing?: string | null;
          published_at?: string | null;
          service_location?: string;
          short_description?: string | null;
          slug?: string;
          sort_order?: number;
          status?: string;
          tenant_id?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'services_icon_media_id_fkey';
            columns: ['icon_media_id'];
            isOneToOne: false;
            referencedRelation: 'media';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'services_main_image_media_id_fkey';
            columns: ['main_image_media_id'];
            isOneToOne: false;
            referencedRelation: 'media';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'services_og_image_id_fkey';
            columns: ['og_image_id'];
            isOneToOne: false;
            referencedRelation: 'media';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'services_tenant_id_fkey';
            columns: ['tenant_id'];
            isOneToOne: false;
            referencedRelation: 'tenants';
            referencedColumns: ['id'];
          },
        ];
      };
      site_settings: {
        Row: {
          address: Json | null;
          brand_color_hex: string | null;
          brand_color_name: string | null;
          clinic_name: string;
          contact: Json | null;
          created_at: string;
          default_seo: Json | null;
          emergency_banner: Json | null;
          footer_links: Json | null;
          footer_text: string | null;
          id: string;
          logo_media_id: string | null;
          opening_hours: Json | null;
          social_links: Json | null;
          tagline: string | null;
          tenant_id: string;
          updated_at: string;
          vercel_analytics_enabled: boolean;
        };
        Insert: {
          address?: Json | null;
          brand_color_hex?: string | null;
          brand_color_name?: string | null;
          clinic_name: string;
          contact?: Json | null;
          created_at?: string;
          default_seo?: Json | null;
          emergency_banner?: Json | null;
          footer_links?: Json | null;
          footer_text?: string | null;
          id?: string;
          logo_media_id?: string | null;
          opening_hours?: Json | null;
          social_links?: Json | null;
          tagline?: string | null;
          tenant_id: string;
          updated_at?: string;
          vercel_analytics_enabled?: boolean;
        };
        Update: {
          address?: Json | null;
          brand_color_hex?: string | null;
          brand_color_name?: string | null;
          clinic_name?: string;
          contact?: Json | null;
          created_at?: string;
          default_seo?: Json | null;
          emergency_banner?: Json | null;
          footer_links?: Json | null;
          footer_text?: string | null;
          id?: string;
          logo_media_id?: string | null;
          opening_hours?: Json | null;
          social_links?: Json | null;
          tagline?: string | null;
          tenant_id?: string;
          updated_at?: string;
          vercel_analytics_enabled?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'site_settings_logo_media_id_fkey';
            columns: ['logo_media_id'];
            isOneToOne: false;
            referencedRelation: 'media';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'site_settings_tenant_id_fkey';
            columns: ['tenant_id'];
            isOneToOne: true;
            referencedRelation: 'tenants';
            referencedColumns: ['id'];
          },
        ];
      };
      submissions: {
        Row: {
          created_at: string;
          email: string | null;
          id: string;
          message: string;
          meta: Json | null;
          name: string;
          pet_type: string | null;
          phone: string | null;
          source: string;
          status: string;
          tenant_id: string;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          id?: string;
          message: string;
          meta?: Json | null;
          name: string;
          pet_type?: string | null;
          phone?: string | null;
          source?: string;
          status?: string;
          tenant_id: string;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          id?: string;
          message?: string;
          meta?: Json | null;
          name?: string;
          pet_type?: string | null;
          phone?: string | null;
          source?: string;
          status?: string;
          tenant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'submissions_tenant_id_fkey';
            columns: ['tenant_id'];
            isOneToOne: false;
            referencedRelation: 'tenants';
            referencedColumns: ['id'];
          },
        ];
      };
      team_members: {
        Row: {
          bio: Json | null;
          created_at: string;
          credentials: string[];
          email: string | null;
          id: string;
          name: string;
          phone: string | null;
          photo_media_id: string | null;
          published_at: string | null;
          short_bio: string | null;
          slug: string | null;
          social_links: Json | null;
          sort_order: number;
          specialties: string[];
          status: string;
          tenant_id: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          bio?: Json | null;
          created_at?: string;
          credentials?: string[];
          email?: string | null;
          id?: string;
          name: string;
          phone?: string | null;
          photo_media_id?: string | null;
          published_at?: string | null;
          short_bio?: string | null;
          slug?: string | null;
          social_links?: Json | null;
          sort_order?: number;
          specialties?: string[];
          status?: string;
          tenant_id: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          bio?: Json | null;
          created_at?: string;
          credentials?: string[];
          email?: string | null;
          id?: string;
          name?: string;
          phone?: string | null;
          photo_media_id?: string | null;
          published_at?: string | null;
          short_bio?: string | null;
          slug?: string | null;
          social_links?: Json | null;
          sort_order?: number;
          specialties?: string[];
          status?: string;
          tenant_id?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'team_members_photo_media_id_fkey';
            columns: ['photo_media_id'];
            isOneToOne: false;
            referencedRelation: 'media';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'team_members_tenant_id_fkey';
            columns: ['tenant_id'];
            isOneToOne: false;
            referencedRelation: 'tenants';
            referencedColumns: ['id'];
          },
        ];
      };
      tenants: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          primary_domain: string | null;
          slug: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          primary_domain?: string | null;
          slug: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          primary_domain?: string | null;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      testimonials: {
        Row: {
          author_name: string;
          author_photo_media_id: string | null;
          content: Json | null;
          created_at: string;
          featured: boolean;
          id: string;
          published_at: string | null;
          rating: number | null;
          sort_order: number;
          source: string;
          source_url: string | null;
          status: string;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          author_name: string;
          author_photo_media_id?: string | null;
          content?: Json | null;
          created_at?: string;
          featured?: boolean;
          id?: string;
          published_at?: string | null;
          rating?: number | null;
          sort_order?: number;
          source?: string;
          source_url?: string | null;
          status?: string;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          author_name?: string;
          author_photo_media_id?: string | null;
          content?: Json | null;
          created_at?: string;
          featured?: boolean;
          id?: string;
          published_at?: string | null;
          rating?: number | null;
          sort_order?: number;
          source?: string;
          source_url?: string | null;
          status?: string;
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'testimonials_author_photo_media_id_fkey';
            columns: ['author_photo_media_id'];
            isOneToOne: false;
            referencedRelation: 'media';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'testimonials_tenant_id_fkey';
            columns: ['tenant_id'];
            isOneToOne: false;
            referencedRelation: 'tenants';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
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
    Enums: {},
  },
} as const;
