import { StyleSheet, View as RNView } from 'react-native';
import { Text, View } from './Themed';
import Card from './Card';

export default function BudgetSummary({ 
  totalBudget = 0, 
  receivedFund = 0,
  style
}) {
  const remainingFund = totalBudget - receivedFund;
  const progressPercentage = totalBudget > 0 ? (receivedFund / totalBudget) * 100 : 0;

  return (
    <View style={[styles.container, style]}>
      <Card style={styles.totalBudgetCard}>
        <Text style={styles.totalBudgetTitle}>Total Budget</Text>
        <Text style={styles.totalBudgetValue}>Rs. {totalBudget.toLocaleString()}</Text>
        
        <RNView style={styles.progressContainer}>
          <RNView style={styles.progressBar}>
            <RNView 
              style={[
                styles.progressFill, 
                { width: `${progressPercentage}%` }
              ]} 
            />
          </RNView>
          <Text style={styles.progressText}>
            Rs. {receivedFund.toLocaleString()} received of Rs. {totalBudget.toLocaleString()}
          </Text>
        </RNView>

        <RNView style={styles.budgetDetails}>
          <RNView style={styles.budgetDetailItem}>
            <Text style={styles.budgetDetailLabel}>Received</Text>
            <Text style={[styles.budgetDetailValue, { color: '#4CAF50' }]}>
              Rs. {receivedFund.toLocaleString()}
            </Text>
          </RNView>
          <RNView style={styles.budgetDetailItem}>
            <Text style={styles.budgetDetailLabel}>Remaining</Text>
            <Text style={[styles.budgetDetailValue, { color: remainingFund >= 0 ? '#0F6E66' : '#E53935' }]}>
              Rs. {remainingFund.toLocaleString()}
            </Text>
          </RNView>
        </RNView>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  totalBudgetCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 4,
  },
  totalBudgetTitle: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 8,
  },
  totalBudgetValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 16,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#757575',
  },
  budgetDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  budgetDetailItem: {
    flex: 1,
  },
  budgetDetailLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  budgetDetailValue: {
    fontSize: 18,
    fontWeight: 'bold',
  }
}); 