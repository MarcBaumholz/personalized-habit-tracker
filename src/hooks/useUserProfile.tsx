
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useUserProfile = (userId?: string) => {
  // Fetch user profile
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["user-profile", userId],
    queryFn: async () => {
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user found");
        userId = user.id;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // Fetch user's habits
  const { data: habits, isLoading: isHabitsLoading } = useQuery({
    queryKey: ["user-habits", userId],
    queryFn: async () => {
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user found");
        userId = user.id;
      }

      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  // Get unique life areas from habits
  const lifeAreas = habits 
    ? [...new Set(habits.filter(h => h.life_area).map(h => h.life_area))]
    : [];

  // Get keystone habits
  const keystoneHabits = habits
    ? habits.filter(h => h.is_keystone)
    : [];

  return {
    profile,
    habits,
    keystoneHabits,
    lifeAreas,
    isLoading: isProfileLoading || isHabitsLoading
  };
};
