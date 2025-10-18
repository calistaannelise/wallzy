import React, { useState, useEffect } from 'react';
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
import OTPInput from '../components/OTPInput';

const OTPVerificationScreen = ({ navigateTo, data }) => {
  const { email } = data || {};
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleOTPComplete = async (otpValue) => {
    setOtp(otpValue);
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // For demo purposes, accept any 6-digit OTP
      if (otpValue.length === 6) {
        Alert.alert(
          'OTP Verified',
          'Your OTP has been verified successfully!',
          [
            {
              text: 'Continue',
              onPress: () => navigateTo('ResetPassword', { email, otp: otpValue })
            }
          ]
        );
      } else {
        Alert.alert('Error', 'Please enter a valid 6-digit OTP.');
      }
    } catch (error) {
      Alert.alert('Error', 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setTimer(60);
      setCanResend(false);

      Alert.alert('Success', 'OTP has been resent to your email.');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigateTo('ForgotPassword')}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>
            We've sent a 6-digit verification code to{'\n'}
            <Text style={styles.email}>{email || 'your email'}</Text>
          </Text>
        </View>

        <View style={styles.form}>
          <OTPInput
            length={6}
            onComplete={handleOTPComplete}
            style={styles.otpInput}
          />

          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>
              {canResend ? 'Didn\'t receive the code?' : `Resend code in ${formatTime(timer)}`}
            </Text>
            {canResend && (
              <TouchableOpacity onPress={handleResendOTP} disabled={loading}>
                <Text style={styles.resendLink}>Resend OTP</Text>
              </TouchableOpacity>
            )}
          </View>

          <Button
            title="Verify OTP"
            onPress={() => handleOTPComplete(otp)}
            loading={loading}
            disabled={otp.length !== 6}
            style={styles.verifyButton}
          />

          <View style={styles.helpContainer}>
            <Text style={styles.helpText}>
              Wrong email address?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigateTo('ForgotPassword')}>
              <Text style={styles.helpLink}>Change Email</Text>
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
    textAlign: 'center',
  },
  email: {
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  form: {
    flex: 1,
    alignItems: 'center',
  },
  otpInput: {
    marginBottom: spacing.lg,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  timerText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  resendLink: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  verifyButton: {
    width: '100%',
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

export default OTPVerificationScreen;
