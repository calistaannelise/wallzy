import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors, typography, spacing } from '../theme';
import Button from '../components/Button';
import Input from '../components/Input';
import { authStorage } from '../services/authStorage';

const SignUpScreen = ({ navigateTo }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

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

  const handleSignUp = async () => {
    if (!validateForm()) return;
    setLoading(true);
  
    try {
      const payload = {
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`,
        password: formData.password,
      };
  
      // For Android emulator → 10.0.2.2
      // For iOS simulator → 127.0.0.1
      // For physical device → your computer's LAN IP (e.g. 192.168.x.x)
      const API_URL = "http://10.0.2.2:8000/users";
  
      console.log("Sending signup request to:", API_URL);
      console.log("Payload:", payload);
  
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);
  
      // Get response text first to handle non-JSON responses
      const responseText = await response.text();
      console.log("Response text:", responseText);
  
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        console.error("Response was:", responseText);
        Alert.alert('Error', 'Server returned an invalid response. Please ensure the backend is running correctly.');
        return;
      }
  
      if (response.ok) {
        // Store user data and auto-login
        authStorage.setUser({
          id: data.id,
          email: data.email,
          name: data.name,
        });
        
        Alert.alert('Success', 'Account created successfully!', [
          { text: 'OK', onPress: () => navigateTo('Home') }
        ]);
      } else {
        Alert.alert('Error', data.detail || 'Sign up failed. Please try again.');
      }
    } catch (error) {
      console.error("Signup error:", error);
      Alert.alert('Error', `Network error: ${error.message}. Please check your connection and ensure the backend is running.`);
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>F</Text>
            </View>
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join our fintech platform today
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.nameRow}>
            <Input
              label="First Name"
              placeholder="John"
              value={formData.firstName}
              onChangeText={value => updateFormData('firstName', value)}
              error={errors.firstName}
              style={styles.halfInput}
            />
            <Input
              label="Last Name"
              placeholder="Doe"
              value={formData.lastName}
              onChangeText={value => updateFormData('lastName', value)}
              error={errors.lastName}
              style={styles.halfInput}
            />
          </View>

          <Input
            label="Email Address"
            placeholder="john.doe@example.com"
            value={formData.email}
            onChangeText={value => updateFormData('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <Input
            label="Phone Number"
            placeholder="+1 (555) 123-4567"
            value={formData.phone}
            onChangeText={value => updateFormData('phone', value)}
            keyboardType="phone-pad"
            error={errors.phone}
          />

          <Input
            label="Password"
            placeholder="Create a strong password"
            value={formData.password}
            onChangeText={value => updateFormData('password', value)}
            secureTextEntry
            error={errors.password}
          />

          <Input
            label="Confirm Password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChangeText={value => updateFormData('confirmPassword', value)}
            secureTextEntry
            error={errors.confirmPassword}
          />

          <Button
            title="Create Account"
            onPress={handleSignUp}
            loading={loading}
            style={styles.signUpButton}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigateTo('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['2xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  logoContainer: {
    marginBottom: spacing.lg,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 32,
    fontWeight: typography.fontWeight.bold,
    color: colors.background,
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
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  halfInput: {
    flex: 1,
    minWidth: 140,
  },
  signUpButton: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  loginText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  loginLink: {
    fontSize: typography.fontSize.base,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
});

export default SignUpScreen;
