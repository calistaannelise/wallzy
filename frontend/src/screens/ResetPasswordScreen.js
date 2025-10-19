import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors, typography, spacing } from '../theme';
import Button from '../components/Button';
import Input from '../components/Input';

const ResetPasswordScreen = ({ navigation, route }) => {
  const { email } = route.params || {};
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Password Reset Successful',
        'Your password has been reset successfully. You can now sign in with your new password.',
        [
          {
            text: 'Sign In',
            onPress: () => navigateTo('Login')
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Password reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Create a new password for your account
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="New Password"
            placeholder="Enter your new password"
            value={formData.password}
            onChangeText={value => updateFormData('password', value)}
            secureTextEntry
            error={errors.password}
          />

          <Input
            label="Confirm New Password"
            placeholder="Confirm your new password"
            value={formData.confirmPassword}
            onChangeText={value => updateFormData('confirmPassword', value)}
            secureTextEntry
            error={errors.confirmPassword}
          />

          <View style={styles.passwordRequirements}>
            <Text style={styles.requirementsTitle}>Password Requirements:</Text>
            <Text style={styles.requirement}>• At least 8 characters long</Text>
            <Text style={styles.requirement}>• Contains uppercase letter</Text>
            <Text style={styles.requirement}>• Contains lowercase letter</Text>
            <Text style={styles.requirement}>• Contains at least one number</Text>
          </View>

          <Button
            title="Reset Password"
            onPress={handleResetPassword}
            loading={loading}
            style={styles.resetButton}
          />

          <View style={styles.helpContainer}>
            <Text style={styles.helpText}>
              Remember your password?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigateTo('Login')}>
              <Text style={styles.helpLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  header: {
    marginBottom: spacing['3xl'],
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
  },
  backButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  title: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.lg,
  },
  form: {
    flex: 1,
  },
  passwordRequirements: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  requirementsTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  requirement: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  resetButton: {
    marginBottom: spacing.xl,
  },
  helpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  helpLink: {
    fontSize: typography.fontSize.base,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
});

export default ResetPasswordScreen;
