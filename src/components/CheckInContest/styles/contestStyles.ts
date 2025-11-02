import { StyleSheet } from "react-native";

export const contestColors = {
  primary: "#FF4B2B", // GymForce primary orange
  secondary: "#2B2D42", // GymForce secondary navy
  accent: "#8D99AE", // GymForce accent gray
  background: "#F8F9FA", // More neutral light gray background
  white: "#FFFFFF",
  gray100: "#F8F9FA",
  gray200: "#E9ECEF",
  gray300: "#DEE2E6",
  gray400: "#CED4DA",
  gray500: "#ADB5BD",
  gray600: "#6C757D",
  gray700: "#495057",
  gray800: "#343A40",
  gray900: "#212529",

  // Contest specific colors
  gold: "#FFD700",
  silver: "#C0C0C0",
  bronze: "#CD7F32",
  success: "#28A745",
  warning: "#FFC107",
  danger: "#DC3545",
  info: "#17A2B8",
};

export const contestSizes = {
  // Spacing
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,

  // Font sizes
  textXs: 12,
  textSm: 14,
  textBase: 16,
  textLg: 18,
  textXl: 20,
  text2xl: 24,
  text3xl: 30,
  text4xl: 36,

  // Border radius
  radiusSm: 4,
  radiusBase: 8,
  radiusLg: 12,
  radiusXl: 16,
  radiusFull: 9999,

  // Icon sizes
  iconSm: 16,
  iconBase: 20,
  iconLg: 24,
  iconXl: 32,
};

export const contestStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: contestColors.background,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: contestColors.white,
    borderTopLeftRadius: contestSizes.radiusXl,
    borderTopRightRadius: contestSizes.radiusXl,
  },

  contentContainer: {
    padding: contestSizes.lg,
  },

  // Header styles
  header: {
    alignItems: "center",
    paddingVertical: contestSizes.lg,
    borderBottomWidth: 1,
    borderBottomColor: contestColors.gray200,
  },

  headerTitle: {
    fontSize: contestSizes.text2xl,
    fontWeight: "bold",
    color: contestColors.gray900,
    fontFamily: "Gymforce",
  },

  headerSubtitle: {
    fontSize: contestSizes.textBase,
    color: contestColors.gray600,
    marginTop: contestSizes.xs,
  },

  // Card styles
  card: {
    backgroundColor: contestColors.white,
    borderRadius: contestSizes.radiusLg,
    padding: contestSizes.md,
    marginVertical: contestSizes.xs,
    shadowColor: contestColors.gray900,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // User rank card styles
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: contestSizes.md,
    borderRadius: contestSizes.radiusLg,
    marginVertical: contestSizes.xs,
  },

  userCardCurrent: {
    backgroundColor: contestColors.gray100, // More neutral background
    borderColor: contestColors.primary + "60", // Keep primary border but slightly more visible
    borderWidth: 2,
  },

  userCardDefault: {
    backgroundColor: contestColors.white,
    borderColor: contestColors.gray200,
    borderWidth: 1,
  },

  // Rank indicator styles
  rankContainer: {
    width: 48,
    height: 48,
    borderRadius: contestSizes.radiusFull,
    justifyContent: "center",
    alignItems: "center",
    marginRight: contestSizes.md,
  },

  rankContainerGold: {
    backgroundColor: contestColors.gold + "20",
  },

  rankContainerSilver: {
    backgroundColor: contestColors.silver + "20",
  },

  rankContainerBronze: {
    backgroundColor: contestColors.bronze + "20",
  },

  rankContainerDefault: {
    backgroundColor: contestColors.gray100,
  },

  rankText: {
    fontSize: contestSizes.textSm,
    fontWeight: "bold",
  },

  rankTextGold: {
    color: contestColors.gold,
  },

  rankTextSilver: {
    color: contestColors.silver,
  },

  rankTextBronze: {
    color: contestColors.bronze,
  },

  rankTextDefault: {
    color: contestColors.gray600,
  },

  // Avatar styles
  avatar: {
    width: 40,
    height: 40,
    borderRadius: contestSizes.radiusFull,
    marginRight: contestSizes.md,
  },

  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: contestSizes.radiusFull,
    backgroundColor: contestColors.gray300,
    justifyContent: "center",
    alignItems: "center",
    marginRight: contestSizes.md,
  },

  // Text styles
  userName: {
    fontSize: contestSizes.textBase,
    fontWeight: "600",
    color: contestColors.gray900,
  },

  userStats: {
    fontSize: contestSizes.textSm,
    color: contestColors.gray600,
    marginTop: contestSizes.xs,
  },

  userPoints: {
    fontSize: contestSizes.textLg,
    fontWeight: "bold",
    color: contestColors.primary,
  },

  // Button styles
  primaryButton: {
    backgroundColor: contestColors.primary,
    paddingVertical: contestSizes.md,
    paddingHorizontal: contestSizes.lg,
    borderRadius: contestSizes.radiusLg,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: contestSizes.sm,
  },

  primaryButtonText: {
    color: contestColors.white,
    fontSize: contestSizes.textBase,
    fontWeight: "600",
  },

  secondaryButton: {
    backgroundColor: contestColors.white,
    borderColor: contestColors.primary,
    borderWidth: 2,
    paddingVertical: contestSizes.md,
    paddingHorizontal: contestSizes.lg,
    borderRadius: contestSizes.radiusLg,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: contestSizes.sm,
  },

  secondaryButtonText: {
    color: contestColors.primary,
    fontSize: contestSizes.textBase,
    fontWeight: "600",
  },

  // Progress styles
  progressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: contestSizes.md,
  },

  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: contestColors.gray200,
    borderRadius: contestSizes.radiusSm,
    marginHorizontal: contestSizes.md,
  },

  progressFill: {
    height: "100%",
    backgroundColor: contestColors.primary,
    borderRadius: contestSizes.radiusSm,
  },

  // Stats styles
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: contestSizes.lg,
    borderTopWidth: 1,
    borderTopColor: contestColors.gray200,
  },

  statItem: {
    alignItems: "center",
  },

  statValue: {
    fontSize: contestSizes.text2xl,
    fontWeight: "bold",
    color: contestColors.primary,
  },

  statLabel: {
    fontSize: contestSizes.textSm,
    color: contestColors.gray600,
    marginTop: contestSizes.xs,
  },

  // Toggle styles
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: contestColors.gray100,
    borderRadius: contestSizes.radiusLg,
    padding: contestSizes.xs,
    marginVertical: contestSizes.md,
  },

  toggleButton: {
    flex: 1,
    paddingVertical: contestSizes.sm,
    paddingHorizontal: contestSizes.md,
    borderRadius: contestSizes.radiusLg,
    alignItems: "center",
  },

  toggleButtonActive: {
    backgroundColor: contestColors.primary,
  },

  toggleButtonInactive: {
    backgroundColor: "transparent",
  },

  toggleTextActive: {
    color: contestColors.white,
    fontWeight: "600",
  },

  toggleTextInactive: {
    color: contestColors.gray600,
  },

  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: contestSizes.xl,
  },

  loadingText: {
    fontSize: contestSizes.textBase,
    color: contestColors.gray600,
    marginTop: contestSizes.md,
  },

  // Empty state styles
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: contestSizes.xl,
  },

  emptyText: {
    fontSize: contestSizes.textLg,
    color: contestColors.gray600,
    textAlign: "center",
    marginTop: contestSizes.md,
  },

  // Badge styles
  badge: {
    paddingHorizontal: contestSizes.sm,
    paddingVertical: contestSizes.xs,
    borderRadius: contestSizes.radiusFull,
    marginLeft: contestSizes.sm,
  },

  badgePrimary: {
    backgroundColor: contestColors.primary,
  },

  badgeSuccess: {
    backgroundColor: contestColors.success,
  },

  badgeText: {
    color: contestColors.white,
    fontSize: contestSizes.textXs,
    fontWeight: "600",
  },
});
