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
import apiService from '../services/apiService';
import { authStorage } from '../services/authStorage';

const AddCardScreen = ({ navigateTo, onCardAdded }) => {
    const [formData, setFormData] = useState({
        cardName: '',
        cardNumber: '',
        cvv: '',
        expiryMonth: '',
        expiryYear: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        if (!formData.cardName.trim()) {
            newErrors.cardName = 'Card name is required';
        }

        if (!formData.cardNumber.trim()) {
            newErrors.cardNumber = 'Card number is required';
        } else if (!/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/.test(formData.cardNumber)) {
            newErrors.cardNumber = 'Please enter a valid 16-digit card number';
        }

        if (!formData.cvv.trim()) {
            newErrors.cvv = 'CVV is required';
        } else if (!/^\d{3,4}$/.test(formData.cvv)) {
            newErrors.cvv = 'Please enter a valid CVV (3-4 digits)';
        }

        if (!formData.expiryMonth.trim()) {
            newErrors.expiryMonth = 'Expiry month is required';
        } else if (!/^(0[1-9]|1[0-2])$/.test(formData.expiryMonth)) {
            newErrors.expiryMonth = 'Please enter a valid month (01-12)';
        }

        if (!formData.expiryYear.trim()) {
            newErrors.expiryYear = 'Expiry year is required';
        } else if (!/^\d{2}$/.test(formData.expiryYear)) {
            newErrors.expiryYear = 'Please enter a valid year (2 digits)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const formatCardNumber = (text) => {
        // Remove all non-digits
        const cleaned = text.replace(/\D/g, '');

        // Add spaces every 4 digits
        const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');

        // Limit to 16 digits + 3 spaces = 19 characters
        return formatted.slice(0, 19);
    };

    const handleInputChange = (field, value) => {
        if (field === 'cardNumber') {
            value = formatCardNumber(value);
        }

        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const handleAddCard = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            // Get logged-in user ID
            const userId = authStorage.getUserId();
            if (!userId) {
                Alert.alert('Error', 'Please log in to add a card');
                setLoading(false);
                return;
            }

            // Get card issuer from card number
            const cardNumber = formData.cardNumber.replace(/\s/g, '');
            const issuer = getCardIssuer(cardNumber);
            const network = getCardType(cardNumber);
            const lastFour = cardNumber.slice(-4);

            // Format expiry date as MM/YY
            const expiryDate = `${formData.expiryMonth}/${formData.expiryYear}`;

            // Call backend API to add card
            const response = await apiService.addCard(userId, {
                issuer: issuer,
                card_name: formData.cardName,
                last_four: lastFour,
                expiry_date: expiryDate,
                cvv: formData.cvv,
            });

            console.log('Card added successfully:', response);

            // Create card object for UI
            const newCard = {
                id: response.id,
                name: formData.cardName,
                number: formData.cardNumber.replace(/\d(?=\d{4})/g, '*'),
                expiry: `${formData.expiryMonth}/${formData.expiryYear}`,
                image: '💳',
                type: network,
                issuer: issuer,
                last_four: lastFour,
            };

            // Call the callback to add the card
            if (onCardAdded) {
                onCardAdded(newCard);
            }

            Alert.alert('Success', 'Credit card added successfully!', [
                { text: 'OK', onPress: () => navigateTo('Home') }
            ]);
        } catch (error) {
            console.error('Error adding card:', error);
            Alert.alert('Error', error.message || 'Failed to add credit card. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getCardType = (cardNumber) => {
        if (cardNumber.startsWith('4')) return 'visa';
        if (cardNumber.startsWith('5')) return 'mastercard';
        if (cardNumber.startsWith('3')) return 'amex';
        return 'unknown';
    };

    const getCardIssuer = (cardNumber) => {
        // Determine issuer based on card number patterns
        if (cardNumber.startsWith('4')) return 'Visa';
        if (cardNumber.startsWith('51') || cardNumber.startsWith('52') ||
            cardNumber.startsWith('53') || cardNumber.startsWith('54') ||
            cardNumber.startsWith('55')) return 'Mastercard';
        if (cardNumber.startsWith('34') || cardNumber.startsWith('37')) return 'American Express';
        if (cardNumber.startsWith('6011') || cardNumber.startsWith('65')) return 'Discover';
        return 'Unknown';
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigateTo('Home')}
                        style={styles.backButton}
                    >
                        <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Add Credit Card</Text>
                    <View style={styles.placeholder} />
                </View>

                {/* Card Preview */}
                <View style={styles.cardPreview}>
                    <View style={styles.previewHeader}>
                        <Text style={styles.previewIcon}>💳</Text>
                        <Text style={styles.previewName}>
                            {formData.cardName || 'Card Name'}
                        </Text>
                    </View>
                    <Text style={styles.previewNumber}>
                        {formData.cardNumber || '**** **** **** ****'}
                    </Text>
                    <View style={styles.previewFooter}>
                        <Text style={styles.previewExpiry}>
                            {formData.expiryMonth && formData.expiryYear
                                ? `${formData.expiryMonth}/${formData.expiryYear}`
                                : 'MM/YY'
                            }
                        </Text>
                    </View>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <Input
                        label="Card Name"
                        placeholder="e.g., Visa Classic, Mastercard Gold"
                        value={formData.cardName}
                        onChangeText={(value) => handleInputChange('cardName', value)}
                        error={errors.cardName}
                        autoCapitalize="words"
                    />

                    <Input
                        label="Card Number"
                        placeholder="1234 5678 9012 3456"
                        value={formData.cardNumber}
                        onChangeText={(value) => handleInputChange('cardNumber', value)}
                        keyboardType="numeric"
                        maxLength={19}
                        error={errors.cardNumber}
                    />

                    <View style={styles.row}>
                        <View style={styles.halfWidth}>
                            <Input
                                label="CVV"
                                placeholder="123"
                                value={formData.cvv}
                                onChangeText={(value) => handleInputChange('cvv', value)}
                                keyboardType="numeric"
                                maxLength={4}
                                error={errors.cvv}
                                secureTextEntry
                            />
                        </View>
                        <View style={styles.halfWidth}>
                            <Input
                                label="Expiry Month"
                                placeholder="12"
                                value={formData.expiryMonth}
                                onChangeText={(value) => handleInputChange('expiryMonth', value)}
                                keyboardType="numeric"
                                maxLength={2}
                                error={errors.expiryMonth}
                            />
                        </View>
                    </View>

                    <Input
                        label="Expiry Year"
                        placeholder="25"
                        value={formData.expiryYear}
                        onChangeText={(value) => handleInputChange('expiryYear', value)}
                        keyboardType="numeric"
                        maxLength={2}
                        error={errors.expiryYear}
                    />

                    <Button
                        title="Add Credit Card"
                        onPress={handleAddCard}
                        loading={loading}
                        style={styles.addButton}
                    />
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
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing['2xl'],
    },
    backButton: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    backButtonText: {
        fontSize: typography.fontSize.base,
        color: colors.primary,
        fontWeight: typography.fontWeight.medium,
    },
    title: {
        fontSize: typography.fontSize['2xl'],
        color: colors.text,
        fontWeight: typography.fontWeight.bold,
    },
    placeholder: {
        width: 60, // Same width as back button for centering
    },
    cardPreview: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: spacing.xl,
        marginBottom: spacing['2xl'],
        borderWidth: 1,
        borderColor: colors.border,
    },
    previewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    previewIcon: {
        fontSize: 24,
        marginRight: spacing.md,
    },
    previewName: {
        fontSize: typography.fontSize.lg,
        color: colors.text,
        fontWeight: typography.fontWeight.semibold,
    },
    previewNumber: {
        fontSize: typography.fontSize.xl,
        color: colors.text,
        fontWeight: typography.fontWeight.bold,
        marginBottom: spacing.md,
        letterSpacing: 2,
    },
    previewFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    previewExpiry: {
        fontSize: typography.fontSize.base,
        color: colors.textSecondary,
    },
    form: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfWidth: {
        width: '48%',
    },
    addButton: {
        marginTop: spacing.lg,
    },
});

export default AddCardScreen;
