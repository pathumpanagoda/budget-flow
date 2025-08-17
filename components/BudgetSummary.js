import { StyleSheet, View as RNView } from 'react-native';
import { Text, View } from './Themed';
import Card from './Card';
import { useTheme } from '../context/theme';

export default function BudgetSummary({ 
  totalBudget = 0, 
  receivedFund = 0,
  spent = 0,
  style
}) {
  const { colors } = useTheme();
  const totalReceived = receivedFund + spent;
  const remainingFund = totalBudget - totalReceived;
  const progressPercentage = totalBudget > 0 ? (totalReceived / totalBudget) * 100 : 0;

  return (
    <View style={[styles.container, style]}>
      <Card style={styles.totalBudgetCard}>
        <Text style={styles.totalBudgetTitle}>Total Budget</Text>
        <Text style={styles.totalBudgetValue}>Rs. {totalBudget.toLocaleString()}</Text>
        
        <RNView style={styles.progressContainer}>
          <RNView style={[styles.progressBar, { backgroundColor: colors.border }]}> 
            <RNView 
              style={[
                styles.progressFill, 
                { width: `${progressPercentage}%` }
              ]} 
            />
          </RNView>
          <Text style={styles.progressText}>
            Rs. {totalReceived.toLocaleString()} received of Rs. {totalBudget.toLocaleString()}
          </Text>
        </RNView>

        <RNView style={[styles.budgetDetails, { borderTopColor: colors.border }]}> 
          <RNView style={styles.budgetDetailItem}>
            <Text style={styles.budgetDetailLabel}>Remaining</Text>
            <Text style={[styles.budgetDetailValue, { color: "red" }]}> 
              Rs. {remainingFund.toLocaleString()}
            </Text>
          </RNView>
          <RNView style={styles.budgetDetailItem}>
            <Text style={styles.budgetDetailLabel}>Received</Text>
            <Text style={[styles.budgetDetailValue, { color: colors.success }]}> 
              Rs. {totalReceived.toLocaleString()}
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
    marginHorizontal: 4,
  },
  totalBudgetTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  totalBudgetValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
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
  },
  budgetDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  budgetDetailItem: {
    flex: 1,
  },
  budgetDetailLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  budgetDetailValue: {
    fontSize: 18,
    fontWeight: 'bold',
  }
}); 