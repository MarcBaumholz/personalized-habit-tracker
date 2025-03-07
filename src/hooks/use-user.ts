
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type UserProfile = {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
};

export const useUser = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setUserProfile(null);
          return;
        }

        // Get user profile information
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching user profile:", error);
          return;
        }

        setUserProfile({
          id: user.id,
          full_name: data?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          avatar_url: data?.avatar_url
        });
      } catch (error) {
        console.error("Error in useUser hook:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  return { userProfile, loading };
};
