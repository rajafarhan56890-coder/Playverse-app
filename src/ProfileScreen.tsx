import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Share,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from "react-native";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { useAuthStore } from "../../store/authStore";
import { useWalletStore } from "../../store/walletStore";
import { logout } from "../../services/auth.service";
import ScreenLoader from "../../components/common/ScreenLoader";
import { colors } from "../../theme/colors";
import { typeScale } from "../../theme/typography";
import { spacing, radius } from "../../theme/spacing";

export default function ProfileScreen() {
  const profile = useAuthStore((s) => s.profile);
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const wallet = useWalletStore((s) => s.wallet);

  const [name, setName] = useState(profile?.name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // BUG FIX: Set timeout for loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingTimeout(true);
    }, 5000); // 5 second timeout

    return () => clearTimeout(timer);
  }, []);

  // BUG FIX: Show fallback if loading takes too long
  if ((!profile || !firebaseUser) && !loadingTimeout) {
    return <ScreenLoader />;
  }

  // Use fallback values if not loaded
  const displayProfile = profile || {
    name: "User",
    email: firebaseUser?.email || "not@available.com",
    phone: "",
    referralCode: "GUEST_CODE",
    totalReferrals: 0,
    referralBonus: 0,
  };

  const isDirty = name !== displayProfile.name || phone !== (displayProfile.phone ?? "");

  async function handleSave() {
    setSaveMessage(null);
    if (!name.trim()) {
      setSaveMessage({ text: "Name cannot be empty.", isError: true });
      return;
    }
    setIsSaving(true);
    try {
      if (firebaseUser) {
        await updateDoc(doc(db, "users", firebaseUser.uid), {
          name: name.trim(),
          phone: phone.trim() || null,
        });
        setSaveMessage({ text: "Profile updated successfully!", isError: false });
        
        // Update local state
        if (profile) {
          profile.name = name.trim();
          profile.phone = phone.trim();
        }
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      setSaveMessage({ text: "Could not save changes. Try again.", isError: true });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleShareReferral() {
    try {
      const referralCode = displayProfile.referralCode || "GUEST_CODE";
      await Share.share({
        message: `Join me on PlayVerse and earn real rewards! 🎮💰 Use my code ${referralCode} when you sign up. Let's earn together!`,
        url: "https://playverse.app/download", // Optional: Add download link
      });
    } catch (error) {
      console.error("Error sharing referral:", error);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Profile</Text>

      {/* Account Info Card */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Account Info</Text>
        <Field
          label="Name"
          value={name}
          onChangeText={setName}
          editable={profile !== null}
        />
        <Field
          label="Email"
          value={displayProfile.email}
          onChangeText={() => {}}
          editable={false}
        />
        <Field
          label="Phone"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          editable={profile !== null}
        />

        {saveMessage && (
          <Text
            style={[
              styles.saveMessage,
              {
                color: saveMessage.isError ? colors.error : colors.success,
              },
            ]}
          >
            {saveMessage.text}
          </Text>
        )}

        <Pressable
          style={[
            styles.saveButton,
            (!isDirty || isSaving || !profile) && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={!isDirty || isSaving || !profile}
        >
          {isSaving ? (
            <ActivityIndicator color={colors.text.light} />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </Pressable>
      </View>

      {/* Wallet Card */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Wallet</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>💰 Coins</Text>
          <Text style={styles.rowValue}>
            {(wallet?.coins ?? 0).toLocaleString()}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>📊 Total Earned</Text>
          <Text style={styles.rowValue}>
            {(wallet?.totalEarned ?? 0).toLocaleString()}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>💸 Total Withdrawn</Text>
          <Text style={styles.rowValue}>
            {(wallet?.totalWithdrawn ?? 0).toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Referral Card */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>🎁 Referral Program</Text>

        <View style={styles.referralBox}>
          <Text style={styles.referralLabel}>Your Code</Text>
          <Text style={styles.referralCode}>{displayProfile.referralCode}</Text>
        </View>

        <Pressable style={styles.shareButton} onPress={handleShareReferral}>
          <Text style={styles.shareButtonText}>📤 Share Invite Code</Text>
        </Pressable>

        <View style={styles.referralStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Referrals</Text>
            <Text style={styles.statValue}>
              {displayProfile.totalReferrals || 0}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Bonus Earned</Text>
            <Text style={styles.statValue}>
              {(displayProfile.referralBonus || 0).toLocaleString()} coins
            </Text>
          </View>
        </View>

        <Text style={styles.referralNote}>
          ✨ Earn extra coins when your friends join! You get a bonus for each
          friend, and they get a bonus too!
        </Text>
      </Card>

      {/* Settings Card */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>⚙️ Settings</Text>
        <Pressable style={styles.settingRow}>
          <Text style={styles.settingText}>Notification Preferences</Text>
          <Text style={styles.settingArrow}>→</Text>
        </Pressable>
        <Pressable style={styles.settingRow}>
          <Text style={styles.settingText}>Withdrawal Settings</Text>
          <Text style={styles.settingArrow}>→</Text>
        </Pressable>
        <Pressable style={styles.settingRow}>
          <Text style={styles.settingText}>Privacy & Security</Text>
          <Text style={styles.settingArrow}>→</Text>
        </Pressable>
      </View>

      {/* Support Card */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Support</Text>
        <Text style={styles.supportText}>
          Need help? Contact us at support@playverse.app
        </Text>
      </View>

      {/* Logout Button */}
      <Pressable style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>🚪 Log Out</Text>
      </Pressable>

      <View style={styles.footer} />
    </ScrollView>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  editable?: boolean;
  keyboardType?: "default" | "phone-pad";
}

function Field({
  label,
  value,
  onChangeText,
  editable = true,
  keyboardType = "default",
}: FieldProps) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, !editable && styles.inputDisabled]}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        keyboardType={keyboardType}
        placeholderTextColor={colors.text.secondary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  title: {
    fontSize: typeScale.title,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionLabel: {
    fontSize: typeScale.subtitle,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  fieldLabel: {
    fontSize: typeScale.body,
    fontWeight: "500",
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.input,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typeScale.body,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputDisabled: {
    backgroundColor: colors.disabled,
    color: colors.text.secondary,
  },
  saveMessage: {
    fontSize: typeScale.small,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
    marginTop: spacing.lg,
  },
  saveButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  saveButtonText: {
    color: colors.text.light,
    fontSize: typeScale.body,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: {
    fontSize: typeScale.body,
    color: colors.text.secondary,
  },
  rowValue: {
    fontSize: typeScale.body,
    fontWeight: "600",
    color: colors.text.primary,
  },
  referralBox: {
    backgroundColor: colors.input,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  referralLabel: {
    fontSize: typeScale.small,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  referralCode: {
    fontSize: typeScale.title,
    fontWeight: "700",
    color: colors.primary,
    letterSpacing: 2,
  },
  shareButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
    marginBottom: spacing.md,
  },
  shareButtonText: {
    color: colors.text.light,
    fontSize: typeScale.body,
    fontWeight: "600",
  },
  referralStats: {
    flexDirection: "row",
    gap: spacing.md,
    marginVertical: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: typeScale.small,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typeScale.subtitle,
    fontWeight: "700",
    color: colors.primary,
  },
  referralNote: {
    fontSize: typeScale.small,
    color: colors.text.secondary,
    fontStyle: "italic",
    lineHeight: 18,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingText: {
    fontSize: typeScale.body,
    color: colors.text.primary,
    fontWeight: "500",
  },
  settingArrow: {
    fontSize: typeScale.title,
    color: colors.primary,
  },
  supportText: {
    fontSize: typeScale.body,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  logoutButton: {
    backgroundColor: colors.error,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  logoutText: {
    color: colors.text.light,
    fontSize: typeScale.body,
    fontWeight: "600",
  },
  footer: {
    height: spacing.xl,
  },
});
