import React from 'react';
import { View, StyleSheet } from 'react-native';

const WalletIcon = ({ size = 80, style }) => {
    return (
        <View style={[styles.container, { width: size, height: size }, style]}>
            {/* Secondary card (peeking out from behind) */}
            <View style={styles.secondaryCard} />

            {/* Main card */}
            <View style={styles.mainCard}>
                {/* Card chip */}
                <View style={styles.chip} />

                {/* NFC waves */}
                <View style={styles.nfcWaves}>
                    <View style={[styles.wave, styles.wave1]} />
                    <View style={[styles.wave, styles.wave2]} />
                    <View style={[styles.wave, styles.wave3]} />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    mainCard: {
        width: 60,
        height: 38,
        backgroundColor: '#FFFFFF', // White card background
        borderRadius: 8,
        position: 'relative',
        shadowColor: '#003333',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    secondaryCard: {
        width: 65,
        height: 40,
        backgroundColor: '#F0F0F0', // Light gray for secondary card
        borderRadius: 8,
        position: 'absolute',
        top: -3,
        left: -8,
        opacity: 0.9,
    },
    chip: {
        position: 'absolute',
        bottom: 6,
        right: 8,
        width: 12,
        height: 8,
        backgroundColor: '#000000',
        borderRadius: 2,
    },
    nfcWaves: {
        position: 'absolute',
        top: 8,
        right: 10,
    },
    wave: {
        position: 'absolute',
        borderWidth: 2,
        borderColor: '#003333', // Darkest teal for NFC waves
        borderRadius: 50,
    },
    wave1: {
        width: 6,
        height: 6,
        top: 0,
        right: 0,
    },
    wave2: {
        width: 10,
        height: 10,
        top: -2,
        right: -2,
    },
    wave3: {
        width: 14,
        height: 14,
        top: -4,
        right: -4,
    },
});

export default WalletIcon;
