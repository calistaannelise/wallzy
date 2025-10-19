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

            // Generate random payment data
            const paymentData = generateRandomPaymentData();

            // Convert payment data to NDEF message
            const paymentDataString = JSON.stringify(paymentData);
            const payloadBytes = [];
            for (let i = 0; i < paymentDataString.length; i++) {
                payloadBytes.push(paymentDataString.charCodeAt(i));
            }

            const ndefMessage = [
                {
                    id: [],
                    type: [0x54], // 'T' for text
                    payload: [0x02, 0x65, 0x6e], // 'en' language code
                    tnf: 1,
                },
                {
                    id: [],
                    type: [0x54], // 'T' for text
                    payload: payloadBytes,
                    tnf: 1,
                },
            ];

            // Show transmission started alert
            Alert.alert(
                'NFC Transmission Started',
                'Hold your device near an NFC reader to transmit payment data.',
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

            // Request NFC technology and transmit data
            await NfcManager.requestTechnology(NfcTech.Ndef);

            // Write the NDEF message
            await NfcManager.ndefHandler.writeNdefMessage(ndefMessage);

            // Show success message
            Alert.alert(
                'Payment Data Transmitted',
                'Payment information has been successfully sent to the NFC reader.',
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

        } catch (error) {
            console.error('NFC Error:', error);

            let errorMessage = 'Failed to transmit payment data.';
            if (error.message.includes('User cancelled')) {
                errorMessage = 'NFC transmission was cancelled.';
            } else if (error.message.includes('Tag was lost')) {
                errorMessage = 'NFC connection lost. Please try again.';
            } else if (error.message.includes('Not enough space')) {
                errorMessage = 'NFC tag does not have enough space.';
            }

            Alert.alert(
                'Transmission Failed',
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
        color: colors.background,
    },
});

export default PayButton;
