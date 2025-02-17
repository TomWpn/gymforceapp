import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { auth } from "../services/firebaseConfig";
import { useUserProfileContext } from "../context/UserProfileContext";
import {
  sendMembershipInterest,
  checkMembershipInterestStatus,
  claimMembership,
} from "../services/membershipService";

interface MembershipStatus {
  userClaimedMembership: boolean;
  userClaimedMembershipAt?: Date;
  sent?: boolean;
  sentAt?: Date;
}

export const useMembershipStatus = (gym: any) => {
  const { userProfile } = useUserProfileContext();
  const [membershipStatus, setMembershipStatus] =
    useState<MembershipStatus | null>(null);
  const [sendingInterest, setSendingInterest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      setIsLoading(true);
      try {
        if (gym?.id && auth.currentUser && gym.isOnNetwork) {
          const status = await checkMembershipInterestStatus(
            auth.currentUser.uid,
            gym.id
          );
          setMembershipStatus({
            userClaimedMembership: status?.userClaimedMembership || false,
            userClaimedMembershipAt: status?.userClaimedMembershipAt,
            sent: status?.sent || false,
            sentAt: status?.sentAt,
          });
        } else if (!gym?.isOnNetwork) {
          // For non-network gyms, set default status that allows check-ins
          setMembershipStatus({
            userClaimedMembership: true,
            userClaimedMembershipAt: new Date(),
            sent: false,
          });
        }
      } catch (error) {
        console.error("Error checking membership status:", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkStatus();
  }, [gym?.id, gym?.isOnNetwork]);

  const handleExistingMember = async () => {
    if (!gym?.id) return;

    try {
      await claimMembership(auth.currentUser?.uid || "anonymous", gym.id);
      setMembershipStatus((prev) => ({
        ...prev!,
        userClaimedMembership: true,
        userClaimedMembershipAt: new Date(),
      }));
      Alert.alert("Welcome!", "You can now start checking in at this gym!");
    } catch (error) {
      console.error("Error claiming membership:", error);
      Alert.alert(
        "Error",
        "There was a problem. Please try again or contact support."
      );
    }
  };

  const handleMembershipInterest = async () => {
    if (!gym?.id) return;

    try {
      setSendingInterest(true);

      if (auth.currentUser?.email && userProfile?.name) {
        await sendMembershipInterest({
          userId: auth.currentUser.uid,
          userEmail: auth.currentUser.email,
          userName: userProfile.name,
          userPhone: userProfile.phone,
          gymId: gym.id,
          gymName: gym.properties.name,
          gymAddress: gym.properties.address,
          gymCity: gym.properties.city,
          gymState: gym.properties.state,
          gymDomain: gym.properties.domain,
        });
        setMembershipStatus((prev) => ({
          ...prev!,
          sent: true,
          sentAt: new Date(),
        }));
        Alert.alert(
          "Thank you!",
          "We've notified the gym of your interest. They will contact you about membership options."
        );
      } else {
        Alert.alert(
          "Profile Required",
          "Please complete your profile with email and name to express interest in membership."
        );
      }
    } catch (error) {
      console.error("Error in membership process:", error);
      Alert.alert(
        "Error",
        "There was a problem sending your membership interest. Please try again or contact support."
      );
    } finally {
      setSendingInterest(false);
    }
  };

  const handleGymContact = () => {
    Alert.alert(
      "Gym Contact",
      "If the gym hasn't contacted you yet, feel free to visit during business hours or give them a call!"
    );
  };

  return {
    membershipStatus,
    sendingInterest,
    handleExistingMember,
    handleMembershipInterest,
    handleGymContact,
    isLoading,
  };
};
