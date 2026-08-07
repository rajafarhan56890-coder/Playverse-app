import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useWalletStore } from "../../store/walletStore";
import { colors } from "../../theme/colors";
import { typeScale } from "../../theme/typography";
import { spacing, radius } from "../../theme/spacing";

const COIN_RATE = 0.5; // 1 rupee = 2 coins

export default function ConversionCalculatorScreen({ route }: any) {
  const navigation = useNavigation<any>();
  const coins = route.params?.coins ?? 0;
  
  const [inputCoins, setInputCoins] = useState("");
  const [rupeesValue, setRupeesValue] = useState("0");

  useEffect(() => {
    if (!inputCoins) {
      setRupeesValue("0");
      return;
    }
    
    const numCoins = parseInt(inputCoins) || 0;
    const rupees = numCoins * COIN_RATE;
    setRupeesValue(rupees.toFixed(2));
  }, [inputCoins]);

  const handleMaxCoins = () => {
    setInputCoins(coins.toString());
  };

  const handleConvert = () => {
    if (!inputCoins) {
      alert("Enter coin amount");
      return;
    }
    
    navigation.navigate("WithdrawalRequest", {
      availableCoins: parseInt(inputCoins),
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Coins to Cash</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Your Coins</Text>
        <Text style={styles.bigNumber}>{coins.toLocaleString()}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Enter Coins to Convert</Text>
        <TextInput
          style={styles.input}
          placeholder="0"
          value={inputCoins}
          onChangeText={setInputCoins}
          keyboardType="number-pad"
          placeholderTextColor={colors.textMuted}
        />
        <Pressable style={styles.maxButton} onPress={handleMaxCoins}>
          <Text style={styles.maxButtonText}>Use All ({coins})</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>You Will Get</Text>
        <View style={styles.resultBox}>
          <Text style={styles.resultValue}>₹ {rupeesValue}</Text>
          <Text style={styles.rate}>Rate: 1₹ = 2 coins</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Fees & Charges</Text>
        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>Processing Fee (2%)</Text>
          <Text style={styles.feeValue}>₹ {(parseFloat(rupeesValue) * 0.02).toFixed(2)}</Text>
        </View>
        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>You Get After Fees</Text>
          <Text style={styles.feeValue} style={{ color: colors.success, fontWeight: "700" }}>
            ₹ {(parseFloat(rupeesValue) * 0.98).toFixed(2)}
          </Text>
        </View>
      </View>

      <Pressable style={styles.convertButton} onPress={handleConvert}>
        <Text style={styles.convertButtonText}>Proceed to Withdraw</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgBase,
    padding: spacing.lg,
  },
  title: {
    fontSize: typeScale.h2.fontSize,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    fontSize: typeScale.body.fontSize,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  bigNumber: {
    fontSize: typeScale.h1.fontSize,
    fontWeight: "700",
    color: colors.primary,
  },
  input: {
    backgroundColor: colors.bgElevated2,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typeScale.body.fontSize,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  maxButton: {
    backgroundColor: colors.border,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: "center",
  },
  maxButtonText: {
    fontSize: typeScale.caption.fontSize,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  resultBox: {
    backgroundColor: colors.primary + "20",
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: "center",
  },
  resultValue: {
    fontSize: typeScale.h1.fontSize,
    fontWeight: "700",
    color: colors.primary,
  },
  rate: {
    fontSize: typeScale.caption.fontSize,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  feeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  feeLabel: {
    fontSize: typeScale.body.fontSize,
    color: colors.textSecondary,
  },
  feeValue: {
    fontSize: typeScale.body.fontSize,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  convertButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    alignItems: "center",
    marginTop: spacing.xl,
  },
  convertButtonText: {
    fontSize: typeScale.body.fontSize,
    fontWeight: "600",
    color: colors.textOnPrimary,
  },
});
