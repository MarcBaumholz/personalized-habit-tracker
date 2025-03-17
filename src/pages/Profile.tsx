
import { useState } from "react";
import { BigFiveSection } from "@/components/profile/BigFiveSection";
import { CoachingSection } from "@/components/profile/CoachingSection";
import { KeystoneHabitsSection } from "@/components/profile/KeystoneHabitsSection";
import { LifeAreasSection } from "@/components/profile/LifeAreasSection";
import { ZRMSection } from "@/components/profile/ZRMSection";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { useUserProfile } from "@/hooks/useUserProfile";
import { UserHabitsSection } from "@/components/profile/UserHabitsSection";
import { UserLifeAreasSection } from "@/components/profile/UserLifeAreasSection";

export default function Profile() {
  const [isFollowing, setIsFollowing] = useState(false);
  const { profile, habits, keystoneHabits, lifeAreas, isLoading } = useUserProfile();

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
  };

  const handleRestartOnboarding = () => {
    // This would typically navigate to the onboarding flow
    window.location.href = "/onboarding";
  };

  if (isLoading) {
    return <div className="container p-4">Lade Profil...</div>;
  }

  return (
    <div className="container p-4 space-y-6">
      <ProfileHeader 
        profile={profile}
        isFollowing={isFollowing}
        onFollowToggle={handleFollowToggle}
        onRestartOnboarding={handleRestartOnboarding}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UserHabitsSection habits={habits || []} />
        <UserLifeAreasSection lifeAreas={lifeAreas || []} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <KeystoneHabitsSection />
        <LifeAreasSection />
      </div>

      <BigFiveSection />
      <ZRMSection />
      <CoachingSection />
    </div>
  );
}
