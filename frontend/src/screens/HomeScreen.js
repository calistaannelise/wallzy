import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Modal,
    FlatList,
    Image,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { colors, typography, spacing } from '../theme';
import Button from '../components/Button';
import apiService from '../services/apiService';
import { authStorage } from '../services/authStorage';

const HomeScreen = ({ navigateTo }) => {
    const [showCardList, setShowCardList] = useState(false);
    const [creditCards, setCreditCards] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [transactionsLoading, setTransactionsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch cards and transactions from API on mount
    useEffect(() => {
        fetchCards();
        fetchTransactions();
    }, []);

    const fetchCards = async () => {
        try {
            setLoading(true);
            setError(null);
            const userId = authStorage.getUserId();
            if (!userId) {
                setError('Please log in to view your cards');
                setLoading(false);
                return;
            }
            const cards = await apiService.getUserCards(userId);
            
            // Transform API response to match UI format
            const transformedCards = cards.map(card => ({
                id: card.id.toString(),
                name: card.card_name,
                number: `**** **** **** ${card.last_four}`,
                expiry: card.expiry_date || '12/25', // Use expiry from API or fallback
                image: '💳',
                balance: '$0.00', // Mock balance since not in API
                type: card.issuer ? card.issuer.toLowerCase() : 'unknown',
                issuer: card.issuer,
                last_four: card.last_four,
            }));
            
            setCreditCards(transformedCards);
        } catch (err) {
            console.error('Error fetching cards:', err);
            setError(err.message);
            // Keep empty array on error
            setCreditCards([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchTransactions = async () => {
        try {
            setTransactionsLoading(true);
            const userId = authStorage.getUserId();
            if (!userId) {
                setTransactionsLoading(false);
                return;
            }
            
            const txns = await apiService.getUserTransactions(userId, 10);
            
            // Transform API response to match UI format
            const transformedTxns = txns.map(txn => {
                const isExpense = txn.amount_cents > 0;
                const amount = Math.abs(txn.amount_dollars);
                
                return {
                    id: txn.id.toString(),
                    title: txn.merchant_name || 'Transaction',
                    description: txn.description || getCategoryDescription(txn.category),
                    amount: isExpense ? `-$${amount.toFixed(2)}` : `+$${amount.toFixed(2)}`,
                    date: formatTransactionDate(txn.transaction_date),
                    type: isExpense ? 'expense' : 'income',
                    category: txn.category || 'other',
                    cardUsed: txn.card_name,
                    rewards: txn.rewards > 0 ? `+${txn.rewards} points` : null
                };
            });
            
            setTransactions(transformedTxns);
        } catch (err) {
            console.error('Error fetching transactions:', err);
            // Keep empty array on error
            setTransactions([]);
        } finally {
            setTransactionsLoading(false);
        }
    };

    const getCategoryDescription = (category) => {
        const descriptions = {
            'food': 'Dining & Food',
            'transport': 'Transportation',
            'shopping': 'Shopping',
            'entertainment': 'Entertainment',
            'travel': 'Travel',
            'gas': 'Gas Station',
            'groceries': 'Groceries'
        };
        return descriptions[category] || 'Purchase';
    };

    const formatTransactionDate = (dateString) => {
        if (!dateString) return 'Unknown date';
        
        const txnDate = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - txnDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return txnDate.toLocaleDateString();
    };

    const renderCreditCard = ({ item }) => (
        <View style={styles.cardItem}>
            <TouchableOpacity style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardImage}>{item.image}</Text>
                    <Text style={styles.cardName}>{item.name}</Text>
                </View>
                <Text style={styles.cardNumber}>{item.number}</Text>
                <View style={styles.cardFooter}>
                    <Text style={styles.cardExpiry}>{item.expiry}</Text>
                    <Text style={styles.cardBalance}>{item.balance}</Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveCard(item.id)}
            >
                <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
        </View>
    );

    const renderTransaction = ({ item }) => (
        <View style={styles.transactionItem}>
            <View style={styles.transactionLeft}>
                <View style={[styles.transactionIcon,
                item.type === 'income' ? styles.incomeIcon : styles.expenseIcon
                ]}>
                    <Text style={styles.transactionEmoji}>
                        {item.category === 'food' ? '🍽️' :
                            item.category === 'transport' ? '⛽' :
                                item.category === 'salary' ? '💰' :
                                    item.category === 'freelance' ? '💼' : '💳'}
                    </Text>
                </View>
                <View style={styles.transactionDetails}>
                    <Text style={styles.transactionTitle}>{item.title}</Text>
                    <Text style={styles.transactionDescription}>{item.description}</Text>
                    <Text style={styles.transactionDate}>{item.date}</Text>
                    {item.cardUsed && (
                        <View style={styles.transactionMeta}>
                            <Text style={styles.cardUsedText}>💳 {item.cardUsed}</Text>
                            {item.rewards && (
                                <Text style={styles.rewardsText}>{item.rewards}</Text>
                            )}
                        </View>
                    )}
                </View>
            </View>
            <Text style={[
                styles.transactionAmount,
                item.type === 'income' ? styles.incomeAmount : styles.expenseAmount
            ]}>
                {item.amount}
            </Text>
        </View>
    );

    const getGreeting = () => {
        const hour = new Date().getHours();

        if (hour >= 5 && hour < 12) {
            return 'Good morning!';
        } else if (hour >= 12 && hour < 17) {
            return 'Good afternoon!';
        } else if (hour >= 17 && hour < 21) {
            return 'Good evening!';
        } else {
            return 'Good night!';
        }
    };

    const handleLogout = () => {
        authStorage.clearUser();
        navigateTo('Login');
    };

    const handleAddCard = (newCard) => {
        setCreditCards(prev => [...prev, newCard]);
        // Refresh cards from API to get latest data
        fetchCards();
    };

    const handleRemoveCard = async (cardId) => {
        Alert.alert(
            'Remove Card',
            'Are you sure you want to permanently delete this credit card? This will also delete all associated transactions and rules.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Call API to delete card from database
                            await apiService.deleteCard(cardId);
                            
                            // Remove from UI
                            setCreditCards(prev => prev.filter(card => card.id !== cardId));
                            
                            // Refresh transactions since they might be affected
                            fetchTransactions();
                            
                            Alert.alert('Success', 'Card deleted successfully');
                        } catch (error) {
                            console.error('Error deleting card:', error);
                            Alert.alert('Error', error.message || 'Failed to delete card. Please try again.');
                        }
                    }
                }
            ]
        );
    };

    const navigateToAddCard = () => {
        navigateTo('AddCard', { onCardAdded: handleAddCard });
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>{getGreeting()}</Text>
                        <Text style={styles.userName}>{authStorage.getUser()?.name || 'User'}</Text>
                    </View>
                    <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>

                {/* Credit Card Section */}
                <View style={styles.cardSection}>
                    <Text style={styles.sectionTitle}>Your Cards</Text>
                    {loading ? (
                        <View style={styles.cardPlaceholder}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={styles.cardPlaceholderSubtext}>Loading cards...</Text>
                        </View>
                    ) : error ? (
                        <TouchableOpacity
                            style={styles.cardPlaceholder}
                            onPress={fetchCards}
                        >
                            <Text style={styles.cardPlaceholderIcon}>⚠️</Text>
                            <Text style={styles.cardPlaceholderText}>Failed to load cards</Text>
                            <Text style={styles.cardPlaceholderSubtext}>Tap to retry</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles.cardPlaceholder}
                            onPress={() => setShowCardList(true)}
                        >
                            <Text style={styles.cardPlaceholderIcon}>💳</Text>
                            <Text style={styles.cardPlaceholderText}>Tap to view all cards</Text>
                            <Text style={styles.cardPlaceholderSubtext}>{creditCards.length} cards available</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Transaction History Section */}
                <View style={styles.transactionSection}>
                    <Text style={styles.sectionTitle}>Recent Transactions</Text>
                    {transactionsLoading ? (
                        <View style={styles.transactionPlaceholder}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={styles.placeholderText}>Loading transactions...</Text>
                        </View>
                    ) : transactions.length === 0 ? (
                        <View style={styles.transactionPlaceholder}>
                            <Text style={styles.placeholderIcon}>📊</Text>
                            <Text style={styles.placeholderText}>No transactions yet</Text>
                            <Text style={styles.placeholderSubtext}>Your transaction history will appear here</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={transactions}
                            renderItem={renderTransaction}
                            keyExtractor={(item) => item.id}
                            scrollEnabled={false}
                            showsVerticalScrollIndicator={false}
                        />
                    )}
                </View>

                {/* View All Transactions Button */}
                <Button
                    title="View All Transactions"
                    variant="secondary"
                    style={styles.viewAllButton}
                    onPress={() => console.log('View all transactions')}
                />
            </ScrollView>

            {/* Credit Cards Modal */}
            <Modal
                visible={showCardList}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Your Credit Cards</Text>
                        <TouchableOpacity
                            onPress={() => setShowCardList(false)}
                            style={styles.closeButton}
                        >
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={creditCards}
                        renderItem={renderCreditCard}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.cardsList}
                        showsVerticalScrollIndicator={false}
                    />

                    <View style={styles.modalActions}>
                        <Button
                            title="Add New Card"
                            onPress={navigateToAddCard}
                            style={styles.addCardButton}
                        />
                    </View>
                </SafeAreaView>
            </Modal>
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
    greeting: {
        fontSize: typography.fontSize.lg,
        color: colors.textSecondary,
        fontWeight: typography.fontWeight.medium,
    },
    userName: {
        fontSize: typography.fontSize['2xl'],
        color: colors.text,
        fontWeight: typography.fontWeight.bold,
        marginTop: spacing.xs,
    },
    logoutButton: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 8,
        backgroundColor: colors.surfaceVariant,
    },
    logoutText: {
        color: colors.primary,
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
    },
    cardSection: {
        marginBottom: spacing['2xl'],
    },
    sectionTitle: {
        fontSize: typography.fontSize.xl,
        color: colors.text,
        fontWeight: typography.fontWeight.bold,
        marginBottom: spacing.lg,
    },
    cardPlaceholder: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: spacing.xl,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.border,
        borderStyle: 'dashed',
        minHeight: 120,
        justifyContent: 'center',
    },
    cardPlaceholderIcon: {
        fontSize: 48,
        marginBottom: spacing.md,
    },
    cardPlaceholderText: {
        fontSize: typography.fontSize.lg,
        color: colors.text,
        fontWeight: typography.fontWeight.medium,
        marginBottom: spacing.xs,
    },
    cardPlaceholderSubtext: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
    },
    transactionSection: {
        marginBottom: spacing.lg,
    },
    transactionPlaceholder: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: spacing.xl,
        alignItems: 'center',
        minHeight: 120,
        justifyContent: 'center',
    },
    placeholderIcon: {
        fontSize: 48,
        marginBottom: spacing.md,
    },
    placeholderText: {
        fontSize: typography.fontSize.base,
        color: colors.text,
        fontWeight: typography.fontWeight.medium,
        marginBottom: spacing.xs,
    },
    placeholderSubtext: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    transactionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    transactionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    transactionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    incomeIcon: {
        backgroundColor: colors.success + '20',
    },
    expenseIcon: {
        backgroundColor: colors.error + '20',
    },
    transactionEmoji: {
        fontSize: 20,
    },
    transactionDetails: {
        flex: 1,
    },
    transactionTitle: {
        fontSize: typography.fontSize.base,
        color: colors.text,
        fontWeight: typography.fontWeight.medium,
        marginBottom: 2,
    },
    transactionDescription: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginBottom: 2,
    },
    transactionDate: {
        fontSize: typography.fontSize.xs,
        color: colors.textTertiary,
    },
    transactionMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.xs,
    },
    cardUsedText: {
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
        marginRight: spacing.md,
    },
    rewardsText: {
        fontSize: typography.fontSize.xs,
        color: colors.primary,
        fontWeight: typography.fontWeight.medium,
    },
    transactionAmount: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
    },
    incomeAmount: {
        color: colors.success,
    },
    expenseAmount: {
        color: colors.text,
    },
    viewAllButton: {
        marginBottom: spacing['2xl'],
    },
    modalContainer: {
        flex: 1,
        backgroundColor: colors.background,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    modalTitle: {
        fontSize: typography.fontSize['2xl'],
        color: colors.text,
        fontWeight: typography.fontWeight.bold,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.surfaceVariant,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: typography.fontSize.lg,
        color: colors.text,
        fontWeight: typography.fontWeight.bold,
    },
    cardsList: {
        padding: spacing.lg,
    },
    cardItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardContent: {
        flex: 1,
    },
    removeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.error + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: spacing.md,
    },
    removeButtonText: {
        fontSize: typography.fontSize.lg,
        color: colors.error,
        fontWeight: typography.fontWeight.bold,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    cardImage: {
        fontSize: 24,
        marginRight: spacing.md,
    },
    cardName: {
        fontSize: typography.fontSize.lg,
        color: colors.text,
        fontWeight: typography.fontWeight.semibold,
    },
    cardNumber: {
        fontSize: typography.fontSize.xl,
        color: colors.text,
        fontWeight: typography.fontWeight.bold,
        marginBottom: spacing.md,
        letterSpacing: 2,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardExpiry: {
        fontSize: typography.fontSize.base,
        color: colors.textSecondary,
    },
    cardBalance: {
        fontSize: typography.fontSize.lg,
        color: colors.primary,
        fontWeight: typography.fontWeight.bold,
    },
    modalActions: {
        padding: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    addCardButton: {
        marginBottom: spacing.sm,
    },
});

export default HomeScreen;
