import React, { useState } from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import { colors, typography, spacing } from '../theme';

const PayButton = ({ style }) => {
    const [isTransmitting, setIsTransmitting] = useState(false);

    // Generate random payment data
    const generateRandomPaymentData = () => {
        const transactionId = Math.random().toString(36).substring(2, 15);
        const amount = (Math.random() * 1000 + 1).toFixed(2);
        const timestamp = new Date().toISOString();
        const merchantId = Math.random().toString(36).substring(2, 10);

        return {
            transactionId,
            amount,
            timestamp,
            merchantId,
            cardToken: Math.random().toString(36).substring(2, 20),
        };
    };

    const handlePay = async () => {
        try {
            setIsTransmitting(true);

            // Check if NFC is available
            const isSupported = await NfcManager.isSupported();
            if (!isSupported) {
                Alert.alert(
                    'NFC Not Supported',
                    'Your device does not support NFC functionality.',
                    [{ text: 'OK' }]
                );
                return;
            }

            // Check if NFC is enabled
            const isEnabled = await NfcManager.isEnabled();
            if (!isEnabled) {
                Alert.alert(
                    'NFC Disabled',
                    'Please enable NFC in your device settings to use this feature.',
                    [{ text: 'OK' }]
                );
                return;
            }

            // Start NFC session
            await NfcManager.start();

            // Show scanning alert
            Alert.alert(
                'NFC Scanning Started',
                'Hold your device near an NFC card to scan it.',
                [
                    {
                        text: 'Cancel',
                        onPress: () => {
                            NfcManager.cancelTechnologyRequest();
                            setIsTransmitting(false);
                        },
                        style: 'cancel',
                    },
                ]
            );

            // Request NFC technology to read cards
            await NfcManager.requestTechnology(NfcTech.Ndef);

            // Read the NFC tag
            const tag = await NfcManager.getTag();
            console.log('NFC Tag detected:', tag);

            // Generate card data based on the scanned tag
            const cardData = {
                uid: tag.id || '058B52E49B4300', // Use actual UID or fallback
                mcc: '5811', // Default to dining category
                ts: Math.floor(Date.now() / 1000) // Current timestamp
            };

            // Update the hello.json file via API
            const response = await fetch('http://localhost:8000/update-json', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cardData),
            });

            if (response.ok) {
                Alert.alert(
                    'Card Scanned Successfully',
                    `Card UID: ${cardData.uid}\nCategory: ${cardData.mcc}\nProcessing recommendation...`,
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                NfcManager.cancelTechnologyRequest();
                                setIsTransmitting(false);
                            },
                        },
                    ]
                );
            } else {
                throw new Error('Failed to update card data');
            }

        } catch (error) {
            console.error('NFC Error:', error);

            let errorMessage = 'Failed to scan NFC card.';
            if (error.message.includes('User cancelled')) {
                errorMessage = 'NFC scanning was cancelled.';
            } else if (error.message.includes('Tag was lost')) {
                errorMessage = 'NFC connection lost. Please try again.';
            } else if (error.message.includes('No NDEF')) {
                errorMessage = 'No NFC data found on the card.';
            }

            Alert.alert(
                'Scanning Failed',
                errorMessage,
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            NfcManager.cancelTechnologyRequest();
                            setIsTransmitting(false);
                        },
                    },
                ]
            );
        } finally {
            // Clean up NFC session
            try {
                await NfcManager.cancelTechnologyRequest();
            } catch (cleanupError) {
                console.error('NFC Cleanup Error:', cleanupError);
            }
            setIsTransmitting(false);
        }
    };

    return (
        <TouchableOpacity
            style={[styles.payButton, style]}
            onPress={handlePay}
            disabled={isTransmitting}
        >
            {isTransmitting ? (
                <ActivityIndicator size="small" color={colors.background} />
            ) : (
                <>
                    <Text style={styles.payButtonIcon}>📱</Text>
                    <Text style={styles.payButtonText}>Pay with NFC</Text>
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    payButton: {
        backgroundColor: colors.primary,
        borderRadius: 16,
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xl,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: spacing.md,
        shadowColor: colors.primary,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    payButtonIcon: {
        fontSize: 20,
        marginRight: spacing.sm,
    },
    payButtonText: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.buttonPrimaryText,
        letterSpacing: 0.5,
    },
});

export default PayButton;
