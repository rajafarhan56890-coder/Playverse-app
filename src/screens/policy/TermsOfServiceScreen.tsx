import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";
import { typeScale } from "../../theme/typography";
import { spacing } from "../../theme/spacing";

export default function TermsOfServiceScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Terms of Service</Text>

      <View style={styles.section}>
        <Text style={styles.heading}>1. Acceptance of Terms</Text>
        <Text style={styles.text}>
          By downloading, installing, or using PlayVerse, you agree to be
          bound by these Terms of Service. If you do not agree, please do
          not use the app.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>2. Eligibility</Text>
        <Text style={styles.text}>
          You must be at least 18 years old to use PlayVerse and participate
          in coin earning or withdrawal features.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>3. Coins & Rewards</Text>
        <Text style={styles.text}>
          Coins earned through games, tasks, or referrals have no cash value
          until converted through the app's official withdrawal process.
          PlayVerse reserves the right to adjust coin values, reward rates,
          and game structures at any time.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>4. Withdrawals</Text>
        <Text style={styles.text}>
          Withdrawal requests are subject to minimum and maximum limits set
          by PlayVerse. Processing times may vary. PlayVerse reserves the
          right to reject withdrawal requests that violate these terms or
          show signs of fraudulent activity.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>5. Fair Use & Fraud Prevention</Text>
        <Text style={styles.text}>
          Any attempt to manipulate games, exploit bugs, use bots, create
          multiple accounts, or abuse the referral system will result in
          account suspension and forfeiture of coins/earnings.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>6. Account Suspension</Text>
        <Text style={styles.text}>
          PlayVerse reserves the right to suspend or terminate accounts that
          violate these terms, engage in fraudulent activity, or misuse the
          platform in any way.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>7. Changes to Terms</Text>
        <Text style={styles.text}>
          These terms may be updated periodically. Continued use of the app
          after changes constitutes acceptance of the revised terms.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>8. Contact Us</Text>
        <Text style={styles.text}>
          For questions regarding these Terms of Service, contact us at
          support@playverse.app
        </Text>
      </View>

      <View style={styles.footer} />
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
    fontSize: typeScale.h1.fontSize,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  heading: {
    fontSize: typeScale.h3.fontSize,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: spacing.md,
  },
  text: {
    fontSize: typeScale.body.fontSize,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  footer: {
    height: spacing.xl,
  },
});
