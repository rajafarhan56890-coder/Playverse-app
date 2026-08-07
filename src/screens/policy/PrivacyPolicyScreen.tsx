import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";
import { typeScale } from "../../theme/typography";
import { spacing, radius } from "../../theme/spacing";

export default function PrivacyPolicyScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Privacy Policy</Text>

      <View style={styles.section}>
        <Text style={styles.heading}>1. Information We Collect</Text>
        <Text style={styles.text}>
          We collect information you provide directly, including name, email, phone number, and payment information.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>2. How We Use Your Information</Text>
        <Text style={styles.text}>
          Your information is used to process transactions, send updates, and improve our services.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>3. Data Security</Text>
        <Text style={styles.text}>
          We use industry-standard encryption to protect your data. Your payment information is never stored on our servers.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>4. Third-Party Services</Text>
        <Text style={styles.text}>
          We use Firebase for authentication and data storage, which has its own privacy policy.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>5. Your Rights</Text>
        <Text style={styles.text}>
          You can request, update, or delete your personal information at any time by contacting support@playverse.app
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
