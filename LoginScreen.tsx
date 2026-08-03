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
import { loginWithEmail } from "../../services/auth.service";
import { colors } from "../../theme/colors";
import { typeScale } from "../../theme/typography";
import { spacing, radius } from "../../theme/spacing";
import type { AuthStackParamList } from "../../navigation/AuthNavigator";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): boolean {
    const errors: typeof fieldErrors = {};
    if (!email.trim()) errors.email = "Email is required.";
    else if (!isValidEmail(email)) errors.email = "Enter a valid email address.";
    if (!password) errors.password = "Password is required.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleLogin() {
    setFormError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    const result = await loginWithEmail(email, password);
    setIsSubmitting(false);

    if (!result.success) {
      setFormError(result.error ?? "Login failed. Please try again.");
    }
    // On success, RootNavigator's auth-state listener switches stacks automatically.
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
        <View style={styles.brandBlock}>
          <View style={styles.logoMark}>
            <Text style={styles.logoMarkText}>PV</Text>
          </View>
          <Text style={styles.brandTitle}>PlayVerse</Text>
          <Text style={styles.brandSubtitle}>Play. Earn. Level up.</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, fieldErrors.email && styles.inputError]}
            placeholder="you@example.com"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            editable={!isSubmitting}
          />
          {fieldErrors.email && (
            <Text style={styles.fieldError}>{fieldErrors.email}</Text>
          )}

          <Text style={[styles.label, { marginTop: spacing.md }]}>
            Password
          </Text>
          <TextInput
            style={[styles.input, fieldErrors.password && styles.inputError]}
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!isSubmitting}
          />
          {fieldErrors.password && (
            <Text style={styles.fieldError}>{fieldErrors.password}</Text>
          )}

          <Pressable
            onPress={() => navigation.navigate("ForgotPassword")}
            style={styles.forgotLink}
            disabled={isSubmitting}
          >
            <Text style={styles.forgotLinkText}>Forgot password?</Text>
          </Pressable>

          {formError && (
            <View style={styles.formErrorBox}>
              <Text style={styles.formErrorText}>{formError}</Text>
            </View>
          )}

          <Pressable
            style={[styles.primaryButton, isSubmitting && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.textOnPrimary} />
            ) : (
              <Text style={styles.primaryButtonText}>Log in</Text>
            )}
          </Pressable>

          <View style={styles.registerRow}>
            <Text style={styles.registerPrompt}>New to PlayVerse?</Text>
            <Pressable
              onPress={() => navigation.navigate("Register")}
              disabled={isSubmitting}
            >
              <Text style={styles.registerLink}> Create an account</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bgBase },
  container: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: "center",
  },
  brandBlock: { alignItems: "center", marginBottom: spacing.xl },
  logoMark: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    shadowColor: colors.primary,
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  logoMarkText: {
    ...typeScale.h2,
    color: colors.textOnPrimary,
  },
  brandTitle: { ...typeScale.h1, color: colors.textPrimary },
  brandSubtitle: {
    ...typeScale.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
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
  fieldError: {
    ...typeScale.caption,
    color: colors.danger,
    marginTop: spacing.xs,
  },
  forgotLink: { alignSelf: "flex-end", marginTop: spacing.sm },
  forgotLinkText: { ...typeScale.caption, color: colors.primary },
  formErrorBox: {
    backgroundColor: "rgba(255,92,92,0.12)",
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginTop: spacing.md,
  },
  formErrorText: { ...typeScale.caption, color: colors.danger },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.lg,
  },
  buttonDisabled: { opacity: 0.6 },
  primaryButtonText: { ...typeScale.bodyMedium, color: colors.textOnPrimary },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.lg,
  },
  registerPrompt: { ...typeScale.caption, color: colors.textSecondary },
  registerLink: { ...typeScale.caption, color: colors.primary, fontWeight: "600" },
});
