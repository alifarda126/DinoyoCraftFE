export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          role: "user" | "admin" | "artisan";
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      schedules: {
        Row: {
          id: string;
          date: string;
          start_time: string;
          end_time: string;
          max_capacity: number;
          current_bookings: number;
          is_locked: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["schedules"]["Row"], "id" | "created_at" | "updated_at" | "current_bookings">;
        Update: Partial<Database["public"]["Tables"]["schedules"]["Row"]>;
      };
      bookings: {
        Row: {
          id: string;
          user_id: string;
          schedule_id: string;
          group_name: string;
          participant_count: number;
          phone: string;
          booking_code: string;
          status: "pending" | "confirmed" | "cancelled";
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["bookings"]["Row"], "id" | "booking_code" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["bookings"]["Row"]>;
      };
      participants: {
        Row: {
          id: string;
          booking_id: string;
          name: string;
          phone: string;
          email: string;
          attended: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["participants"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["participants"]["Row"]>;
      };
      payments: {
        Row: {
          id: string;
          booking_id: string;
          amount: number;
          payment_method: "transfer" | "va" | "ewallet" | "qris";
          status: "pending" | "confirmed" | "failed";
          transaction_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["payments"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["payments"]["Row"]>;
      };
      artworks: {
        Row: {
          id: string;
          artisan_id: string;
          title: string;
          description: string | null;
          price: number;
          image_url: string;
          category: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["artworks"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["artworks"]["Row"]>;
      };
      custom_orders: {
        Row: {
          id: string;
          user_id: string;
          artisan_id: string | null;
          title: string;
          description: string;
          budget: number;
          status: "draft" | "submitted" | "quoted" | "accepted" | "completed";
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["custom_orders"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["custom_orders"]["Row"]>;
      };
      chat_messages: {
        Row: {
          id: string;
          sender_id: string;
          recipient_id: string;
          message: string;
          is_from_admin: boolean;
          read: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["chat_messages"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["chat_messages"]["Row"]>;
      };
      alley_map: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          latitude: number;
          longitude: number;
          artisan_count: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["alley_map"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["alley_map"]["Row"]>;
      };
      financial_reports: {
        Row: {
          id: string;
          date: string;
          booking_revenue: number;
          custom_order_revenue: number;
          total_revenue: number;
          total_expenses: number;
          profit: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["financial_reports"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["financial_reports"]["Row"]>;
      };
    };
    Functions: {
      increment_bookings: {
        Args: { schedule_id: string; increment_by: number };
        Returns: void;
      };
    };
  };
};
