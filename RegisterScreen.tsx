import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { registerWithEmail } from "../../services/auth.service";
import { colors } from "../../theme/colors";
import { typeScale } from "../../theme/typography";
import { spacing, radius } from "../../theme/spacing";
import type { AuthStackParamList } from "../../navigation/AuthNavigator";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  referralCode: string;
}

const initialForm: FormState = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  referralCode: "",
};

export default function RegisterScreen({ navigation, route }: Props) {
  const [form, setForm] = useState<FormState>({
    ...initialForm,
    referralCode: route.params?.referralCode ?? "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = "Name is required.";
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!isValidEmail(form.email)) next.email = "Enter a valid email address.";
    if (form.phone && !/^\+?[0-9]{7,15}$/.test(form.phone.trim())) {
      next.phone = "Enter a valid phone number.";
    }
    if (!form.password) next.password = "Password is required.";
    else if (form.password.length < 6)
      next.password = "Password must be at least 6 characters.";
    if (form.confirmPassword !== form.password)
      next.confirmPassword = "Passwords do not match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleRegister() {
    setFormError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    const result = await registerWithEmail({
      name: form.name,
      email: form.email,
      password: form.password,
      phone: form.phone || undefined,
      referralCode: form.referralCode || undefined,
    });
    setIsSubmitting(false);

    if (!result.success) {
      setFormError(result.error ?? "Registration failed. Please try again.");
    }
    // On success, RootNavigator switches to the main app automatically.
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>
          Start at 0 coins — every reward you earn from here is real.
        </Text>

        <View style={styles.form}>
          <Field
            label="Full name"
            value={form.name}
            onChangeText={(v) => setField("name", v)}
            error={errors.name}
            editable={!isSubmitting}
          />
          <Field
            label="Email"
            value={form.email}
            onChangeText={(v) => setField("email", v)}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isSubmitting}
          />
          <Field
            label="Phone (optional)"
            value={form.phone}
            onChangeText={(v) => setField("phone", v)}
            error={errors.phone}
            keyboardType="phone-pad"
            editable={!isSubmitting}
          />
          <Field
            label="Password"
            value={form.password}
            onChangeText={(v) => setField("password", v)}
            error={errors.password}
            secureTextEntry
            editable={!isSubmitting}
          />
          <Field
            label="Confirm password"
            value={form.confirmPassword}
            onChangeText={(v) => setField("confirmPassword", v)}
            error={errors.confirmPassword}
            secureTextEntry
            editable={!isSubmitting}
          />
          <Field
            label="Referral code (optional)"
            value={form.referralCode}
            onChangeText={(v) => setField("referralCode", v.toUpperCase())}
            autoCapitalize="characters"
            editable={!isSubmitting}
          />

          {formError && (
            <View style={styles.formErrorBox}>
              <Text style={styles.formErrorText}>{formError}</Text>
            </View>
          )}

          <Pressable
            style={[styles.primaryButton, isSubmitting && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.textOnPrimary} />
            ) : (
              <Text style={styles.primaryButtonText}>Create account</Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("Login")}
            disabled={isSubmitting}
            style={styles.loginRow}
          >
            <Text style={styles.loginPrompt}>
              Already have an account? <Text style={styles.loginLink}>Log in</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "characters" | "words" | "sentences";
  editable: boolean;
}

function Field({
  label,
  value,
  onChangeText,
  error,
  secureTextEntry,
  keyboardType = "default",
  autoCapitalize = "sentences",
  editable,
}: FieldProps) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        placeholderTextColor={colors.textMuted}
        editable={editable}
      />
      {error && <Text style={styles.fieldError}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bgBase },
  container: { flexGrow: 1, padding: spacing.lg, paddingTop: spacing.xxl },
  title: { ...typeScale.h1, color: colors.textPrimary },
  subtitle: {
    ...typeScale.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  form: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { ...typeScale.caption, color: colors.textSecondary, marginBottom: spacing.xs },
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
  inputError: { borderColor: colors.danger },
  fieldError: { ...typeScale.caption, color: colors.danger, marginTop: spacing.xs },
  formErrorBox: {
    backgroundColor: "rgba(255,92,92,0.12)",
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  formErrorText: { ...typeScale.caption, color: colors.danger },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  buttonDisabled: { opacity: 0.6 },
  primaryButtonText: { ...typeScale.bodyMedium, color: colors.textOnPrimary },
  loginRow: { marginTop: spacing.lg, alignItems: "center" },
  loginPrompt: { ...typeScale.caption, color: colors.textSecondary },
  loginLink: { color: colors.primary, fontWeight: "600" },
});
