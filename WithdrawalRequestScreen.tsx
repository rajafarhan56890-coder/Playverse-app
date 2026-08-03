import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { db } from "../../config/firebase";
import { useAuthStore } from "../../store/authStore";
import { useWalletStore } from "../../store/walletStore";
import { submitWithdrawalRequest } from "../../services/withdrawal.service";
import ScreenLoader from "../../components/common/ScreenLoader";
import { colors } from "../../theme/colors";
import { typeScale } from "../../theme/typography";
import { spacing, radius } from "../../theme/spacing";

type PayoutMethod = "easypaisa" | "jazzcash";

const ACCOUNT_NUMBER_REGEX = /^0?3\d{9}$/;

export default function WithdrawalRequestScreen() {
  const navigation = useNavigation<any>();
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const wallet = useWalletStore((s) => s.wallet);

  const [minAmount, setMinAmount] = useState<number | null>(null);
  const [maxAmount, setMaxAmount] = useState<number | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);

  const [amount, setAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethod>("easypaisa");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getDoc(doc(db, "settings", "global")).then((snap) => {
      if (cancelled) return;
      const data = snap.data();
      setMinAmount(data?.minWithdrawalAmount ?? null);
      setMaxAmount(data?.maxWithdrawalAmount ?? null);
      setSettingsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function validate(): boolean {
    const next: Record<string, string> = {};
    const numericAmount = Number(amount);

    if (!amount.trim() || Number.isNaN(numericAmount) || numericAmount <= 0) {
      next.amount = "Enter a valid amount.";
    } else if (minAmount !== null && numericAmount < minAmount) {
      next.amount = `Minimum withdrawal is ${minAmount.toLocaleString()} coins.`;
    } else if (maxAmount !== null && numericAmount > maxAmount) {
      next.amount = `Maximum withdrawal is ${maxAmount.toLocaleString()} coins.`;
    } else if (wallet && numericAmount > wallet.coins) {
      next.amount = "You don't have enough coins for this withdrawal.";
    }

    if (!accountName.trim() || accountName.trim().length < 2) {
      next.accountName = "Enter the account holder's name.";
    }

    const cleanAccountNumber = accountNumber.trim().replace(/[\s-]/g, "");
    if (!ACCOUNT_NUMBER_REGEX.test(cleanAccountNumber)) {
      next.accountNumber = "Enter a valid mobile account number (e.g. 03001234567).";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit() {
    setFormError(null);
    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);
    const result = await submitWithdrawalRequest({
      amount: Number(amount),
      payoutMethod,
      accountName: accountName.trim(),
      accountNumber: accountNumber.trim().replace(/[\s-]/g, ""),
    });
    setIsSubmitting(false);

    if (result.success) {
      setSubmitted(true);
    } else {
      setFormError(result.error ?? "Could not submit withdrawal request.");
    }
  }

  if (!firebaseUser || !wallet || settingsLoading) return <ScreenLoader />;

  if (submitted) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successTitle}>Request submitted</Text>
        <Text style={styles.successBody}>
          Your withdrawal is pending review. Coins have been held from your
          spendable balance and will be released back if this request is
          declined.
        </Text>
        <Pressable
          style={styles.primaryButton}
          onPress={() => navigation.navigate("WithdrawalHistory")}
        >
          <Text style={styles.primaryButtonText}>View withdrawal history</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Withdraw</Text>
      <Text style={styles.balanceLine}>
        Available balance: <Text style={styles.balanceValue}>{wallet.coins.toLocaleString()} coins</Text>
      </Text>
      {(minAmount || maxAmount) && (
        <Text style={styles.limitLine}>
          Min {minAmount?.toLocaleString()} · Max {maxAmount?.toLocaleString()} coins
        </Text>
      )}

      <View style={styles.form}>
        <Text style={styles.label}>Payment method</Text>
        <View style={styles.methodRow}>
          <MethodButton
            label="EasyPaisa"
            selected={payoutMethod === "easypaisa"}
            onPress={() => setPayoutMethod("easypaisa")}
          />
          <MethodButton
            label="JazzCash"
            selected={payoutMethod === "jazzcash"}
            onPress={() => setPayoutMethod("jazzcash")}
          />
        </View>

        <Text style={[styles.label, { marginTop: spacing.md }]}>Withdrawal amount</Text>
        <TextInput
          style={[styles.input, errors.amount && styles.inputError]}
          placeholder="e.g. 1000"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          value={amount}
          onChangeText={setAmount}
          editable={!isSubmitting}
        />
        {errors.amount && <Text style={styles.fieldError}>{errors.amount}</Text>}

        <Text style={[styles.label, { marginTop: spacing.md }]}>Account holder name</Text>
        <TextInput
          style={[styles.input, errors.accountName && styles.inputError]}
          placeholder="Full name on the account"
          placeholderTextColor={colors.textMuted}
          value={accountName}
          onChangeText={setAccountName}
          editable={!isSubmitting}
        />
        {errors.accountName && <Text style={styles.fieldError}>{errors.accountName}</Text>}

        <Text style={[styles.label, { marginTop: spacing.md }]}>Account number</Text>
        <TextInput
          style={[styles.input, errors.accountNumber && styles.inputError]}
          placeholder="03001234567"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          value={accountNumber}
          onChangeText={setAccountNumber}
          editable={!isSubmitting}
        />
        {errors.accountNumber && <Text style={styles.fieldError}>{errors.accountNumber}</Text>}

        {formError && (
          <View style={styles.formErrorBox}>
            <Text style={styles.formErrorText}>{formError}</Text>
          </View>
        )}

        <Pressable
          style={[styles.primaryButton, isSubmitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.textOnPrimary} />
          ) : (
            <Text style={styles.primaryButtonText}>Submit request</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

function MethodButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.methodButton, selected && styles.methodButtonSelected]}
      onPress={onPress}
    >
      <Text style={[styles.methodButtonText, selected && styles.methodButtonTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase },
  content: { padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xxl },
  title: { ...typeScale.h2, color: colors.textPrimary },
  balanceLine: { ...typeScale.body, color: colors.textSecondary, marginTop: spacing.xs },
  balanceValue: { color: colors.coin, fontWeight: "600" },
  limitLine: { ...typeScale.caption, color: colors.textMuted, marginTop: 2 },
  form: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.lg,
  },
  label: { ...typeScale.caption, color: colors.textSecondary, marginBottom: spacing.xs },
  methodRow: { flexDirection: "row", gap: spacing.sm },
  methodButton: {
    flex: 1,
    paddingVertical: spacing.sm + 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgElevated2,
    alignItems: "center",
  },
  methodButtonSelected: { borderColor: colors.primary, backgroundColor: "rgba(123,92,255,0.15)" },
  methodButtonText: { ...typeScale.bodyMedium, color: colors.textSecondary },
  methodButtonTextSelected: { color: colors.primary },
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
  successContainer: {
    flex: 1,
    backgroundColor: colors.bgBase,
    padding: spacing.lg,
    justifyContent: "center",
  },
  successTitle: { ...typeScale.h2, color: colors.success, textAlign: "center" },
  successBody: {
    ...typeScale.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
});
