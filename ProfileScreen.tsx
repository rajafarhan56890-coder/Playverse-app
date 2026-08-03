import React, { useState } from "react";
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
  const [saveMessage, setSaveMessage] = useState<{ text: string; isError: boolean } | null>(null);

  if (!profile || !firebaseUser) return <ScreenLoader />;

  const isDirty = name !== profile.name || phone !== (profile.phone ?? "");

  async function handleSave() {
    setSaveMessage(null);
    if (!name.trim()) {
      setSaveMessage({ text: "Name cannot be empty.", isError: true });
      return;
    }
    setIsSaving(true);
    try {
      await updateDoc(doc(db, "users", firebaseUser.uid), {
        name: name.trim(),
        phone: phone.trim() || null,
      });
      setSaveMessage({ text: "Profile updated.", isError: false });
    } catch {
      setSaveMessage({ text: "Could not save changes. Try again.", isError: true });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleShareReferral() {
    try {
      await Share.share({
        message: `Join me on PlayVerse and earn real rewards! Use my code ${profile!.referralCode} when you sign up.`,
      });
    } catch {
      // user cancelled share sheet — no action needed
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Account info</Text>
        <Field label="Name" value={name} onChangeText={setName} />
        <Field label="Email" value={profile.email} onChangeText={() => {}} editable={false} />
        <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

        {saveMessage && (
          <Text style={[styles.saveMessage, { color: saveMessage.isError ? colors.danger : colors.success }]}>
            {saveMessage.text}
          </Text>
        )}

        <Pressable
          style={[styles.saveButton, (!isDirty || isSaving) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!isDirty || isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color={colors.textOnPrimary} />
          ) : (
            <Text style={styles.saveButtonText}>Save changes</Text>
          )}
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Wallet</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Coins</Text>
          <Text style={styles.rowValue}>{(wallet?.coins ?? 0).toLocaleString()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Total earned</Text>
          <Text style={styles.rowValue}>{(wallet?.totalEarned ?? 0).toLocaleString()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Total withdrawn</Text>
          <Text style={styles.rowValue}>{(wallet?.totalWithdrawn ?? 0).toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Referral</Text>
        <View style={styles.referralBox}>
          <Text style={styles.referralCode}>{profile.referralCode}</Text>
        </View>
        <Pressable style={styles.shareButton} onPress={handleShareReferral}>
          <Text style={styles.shareButtonText}>Share invite</Text>
        </Pressable>
        <Text style={styles.referralNote}>
          You'll also earn a bonus when someone you referred brings in a friend of their own.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Support</Text>
        <Text style={styles.supportText}>
          Need help? Reach us at support@playverse.app
        </Text>
      </View>

      <Pressable style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>
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

function Field({ label, value, onChangeText, editable = true, keyboardType = "default" }: FieldProps) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, !editable && styles.inputDisabled]}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        keyboardType={keyboardType}
        placeholderTextColor={colors.textMuted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase },
  content: { padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xxl },
  title: { ...typeScale.h2, color: colors.textPrimary, marginBottom: spacing.md },
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  sectionLabel: { ...typeScale.caption, color: colors.textSecondary, marginBottom: spacing.md, textTransform: "uppercase" },
  fieldLabel: { ...typeScale.caption, color: colors.textSecondary, marginBottom: spacing.xs },
  input: {
    backgroundColor: colors.bgElevated2,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    ...typeScale.body,
  },
  inputDisabled: { opacity: 0.5 },
  saveMessage: { ...typeScale.caption, marginBottom: spacing.sm },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm + 2,
    alignItems: "center",
  },
  saveButtonDisabled: { opacity: 0.5 },
  saveButtonText: { ...typeScale.bodyMedium, color: colors.textOnPrimary },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
  },
  rowLabel: { ...typeScale.body, color: colors.textSecondary },
  rowValue: { ...typeScale.coinInline, color: colors.textPrimary },
  referralBox: {
    backgroundColor: colors.bgElevated2,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginBottom: spacing.md,
  },
  referralCode: { ...typeScale.h2, color: colors.coin, letterSpacing: 2 },
  shareButton: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: spacing.sm + 2,
    alignItems: "center",
  },
  shareButtonText: { ...typeScale.bodyMedium, color: colors.primary },
  referralNote: { ...typeScale.caption, color: colors.textMuted, marginTop: spacing.sm, textAlign: "center" },
  supportText: { ...typeScale.body, color: colors.textSecondary },
  logoutButton: { alignItems: "center", marginTop: spacing.md, marginBottom: spacing.xxl },
  logoutText: { ...typeScale.bodyMedium, color: colors.danger },
});
