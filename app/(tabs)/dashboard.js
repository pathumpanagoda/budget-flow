import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View as RNView, ActivityIndicator, RefreshControl, TouchableOpacity, Alert, Platform } from 'react-native';
import { Text, View } from '../../components/Themed';
import { FontAwesome5 } from '@expo/vector-icons';
import BudgetSummary from '../../components/BudgetSummary';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { getBudgetSummary, getExpenses, getCategories, getFunders } from '../../services/firebaseService';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function DashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [budgetSummary, setBudgetSummary] = useState({
    totalBudget: 0,
    receivedFund: 0,
    peopleOverFund: 0,
    remainingFund: 0,
  });
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    tookOver: 0,
    done: 0,
    utilized: 0,
  });
  const [statusAmounts, setStatusAmounts] = useState({
    pending: 0,
    tookOver: 0,
    done: 0,
    utilized: 0,
  });
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [funderBreakdown, setFunderBreakdown] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [budgetData, expensesData, categoriesData, fundersData] = await Promise.all([
        getBudgetSummary(),
        getExpenses(),
        getCategories(),
        getFunders()
      ]);
      
      // Calculate total budget as sum of all expenses
      const totalBudget = expensesData.reduce((sum, expense) => sum + (expense.amount || 0), 0);
      
      // Calculate received fund as sum of expenses with status "Done"
      const receivedFund = expensesData
        .filter(expense => expense.status === 'Done')
        .reduce((sum, expense) => sum + (expense.amount || 0), 0);
      
      setBudgetSummary({
        totalBudget,
        receivedFund,
        remainingFund: totalBudget - receivedFund,
        peopleOverFund: 0, // This is not used anymore
      });
      
      // Calculate status counts and amounts
      const counts = {
        pending: 0,
        tookOver: 0,
        done: 0,
        utilized: 0,
      };
      
      const amounts = {
        pending: 0,
        tookOver: 0,
        done: 0,
        utilized: 0,
      };
      
      expensesData.forEach(expense => {
        if (expense.status === 'Pending') {
          counts.pending += 1;
          amounts.pending += expense.amount;
        } else if (expense.status === 'Took Over') {
          counts.tookOver += 1;
          amounts.tookOver += expense.amount;
        } else if (expense.status === 'Done') {
          counts.done += 1;
          amounts.done += expense.amount;
        } else if (expense.status === 'Utilized') {
          counts.utilized += 1;
          amounts.utilized += expense.amount;
        }
      });
      
      setStatusCounts(counts);
      setStatusAmounts(amounts);
      
      // Calculate category breakdown
      const categoryMap = new Map();
      categoriesData.forEach(category => {
        categoryMap.set(category.id, {
          id: category.id,
          name: category.name,
          totalAmount: 0,
          count: 0,
        });
      });
      
      expensesData.forEach(expense => {
        if (expense.categoryId && categoryMap.has(expense.categoryId)) {
          const category = categoryMap.get(expense.categoryId);
          category.totalAmount += expense.amount;
          category.count += 1;
        }
      });
      
      const breakdownData = Array.from(categoryMap.values())
        .filter(category => category.totalAmount > 0)
        .sort((a, b) => b.totalAmount - a.totalAmount);
      
      setCategoryBreakdown(breakdownData);

      // Calculate funder breakdown
      const funderMap = new Map();
      fundersData.forEach(funder => {
        funderMap.set(funder.id, {
          id: funder.id,
          name: funder.name,
          totalAmount: 0,
          count: 0,
        });
      });
      
      expensesData.forEach(expense => {
        if (expense.funderId && funderMap.has(expense.funderId)) {
          const funder = funderMap.get(expense.funderId);
          funder.totalAmount += expense.amount;
          funder.count += 1;
        }
      });
      
      const funderBreakdownData = Array.from(funderMap.values())
        .filter(funder => funder.totalAmount > 0)
        .sort((a, b) => b.totalAmount - a.totalAmount);
      
      setFunderBreakdown(funderBreakdownData);

      // Get recent expenses
      const sortedExpenses = [...expensesData]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      
      setRecentExpenses(sortedExpenses);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const generateReport = () => {
    const report = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Expense Management Report</title>
    <style>
        @page {
            size: A4;
            margin: 2cm;
        }
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #0F6E66;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #0F6E66;
            margin: 0;
            font-size: 24px;
        }
        .header p {
            color: #666;
            margin: 10px 0 0;
        }
        .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #0F6E66;
            margin-bottom: 15px;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
        }
        .item {
            margin-bottom: 8px;
            display: flex;
            justify-content: space-between;
        }
        .item-label {
            flex: 1;
        }
        .amount {
            color: #0F6E66;
            font-weight: bold;
            text-align: right;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #eee;
            padding-top: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        th, td {
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        th {
            background-color: #f8f8f8;
            color: #0F6E66;
        }
        .category-section {
            margin-top: 20px;
            margin-bottom: 30px;
        }
        .category-title {
            font-size: 16px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
            background-color: #f5f5f5;
            padding: 8px;
            border-radius: 4px;
        }
        .status-took-over {
            color: #FF9800;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Expense Management System Report</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
    </div>

    <div class="section">
        <div class="section-title">Budget Summary</div>
        <table>
            <tr>
                <th>Item</th>
                <th>Amount</th>
            </tr>
            <tr>
                <td>Total Budget</td>
                <td class="amount">Rs. ${budgetSummary.totalBudget.toLocaleString()}</td>
            </tr>
            <tr>
                <td>Received Fund</td>
                <td class="amount">Rs. ${budgetSummary.receivedFund.toLocaleString()}</td>
            </tr>
            <tr>
                <td>Remaining Fund</td>
                <td class="amount">Rs. ${(budgetSummary.totalBudget - budgetSummary.receivedFund).toLocaleString()}</td>
            </tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">Expense Status</div>
        <table>
            <tr>
                <th>Status</th>
                <th>Count</th>
                <th>Amount</th>
            </tr>
            <tr>
                <td>Pending</td>
                <td>${statusCounts.pending}</td>
                <td class="amount">Rs. ${statusAmounts.pending.toLocaleString()}</td>
            </tr>
            <tr>
                <td>Took Over</td>
                <td>${statusCounts.tookOver}</td>
                <td class="amount">Rs. ${statusAmounts.tookOver.toLocaleString()}</td>
            </tr>
            <tr>
                <td>Done</td>
                <td>${statusCounts.done}</td>
                <td class="amount">Rs. ${statusAmounts.done.toLocaleString()}</td>
            </tr>
            <tr>
                <td>Utilized</td>
                <td>${statusCounts.utilized}</td>
                <td class="amount">Rs. ${statusAmounts.utilized.toLocaleString()}</td>
            </tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">Expenses by Category</div>
        ${categoryBreakdown.map(category => `
            <div class="category-section">
                <div class="category-title">${category.name} (${category.count} expenses - Total: Rs. ${category.totalAmount.toLocaleString()})</div>
                <table>
                    <tr>
                        <th>Title</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Assigned To</th>
                        <th>Date</th>
                    </tr>
                    ${recentExpenses
                        .filter(expense => expense.categoryId === category.id)
                        .map(expense => `
                            <tr>
                                <td>${expense.title}</td>
                                <td class="amount">Rs. ${expense.amount.toLocaleString()}</td>
                                <td class="${expense.status === 'Took Over' ? 'status-took-over' : ''}">${expense.status}</td>
                                <td>${expense.status === 'Took Over' ? expense.takenOverBy : (expense.assignedTo || 'Not Assigned')}</td>
                                <td>${new Date(expense.createdAt).toLocaleDateString()}</td>
                            </tr>
                        `).join('')}
                </table>
            </div>
        `).join('')}
    </div>

    <div class="section">
        <div class="section-title">Expenses by Funder</div>
        <table>
            <tr>
                <th>Funder</th>
                <th>Count</th>
                <th>Amount</th>
            </tr>
            ${funderBreakdown.map(funder => `
                <tr>
                    <td>${funder.name}</td>
                    <td>${funder.count}</td>
                    <td class="amount">Rs. ${funder.totalAmount.toLocaleString()}</td>
                </tr>
            `).join('')}
        </table>
    </div>

    <div class="section">
        <div class="section-title">Recent Expenses</div>
        <table>
            <tr>
                <th>Title</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Date</th>
            </tr>
            ${recentExpenses.map(expense => `
                <tr>
                    <td>${expense.title}</td>
                    <td class="amount">Rs. ${expense.amount.toLocaleString()}</td>
                    <td class="${expense.status === 'Took Over' ? 'status-took-over' : ''}">${expense.status}</td>
                    <td>${expense.status === 'Took Over' ? expense.takenOverBy : (expense.assignedTo || 'Not Assigned')}</td>
                    <td>${new Date(expense.createdAt).toLocaleDateString()}</td>
                </tr>
            `).join('')}
        </table>
    </div>

    <div class="footer">
        <p>This report was generated by the Expense Management System</p>
    </div>
</body>
</html>
    `;

    return report;
  };

  const handleDownloadReport = async () => {
    try {
      const report = generateReport();
      
      // Generate PDF
      const { uri } = await Print.printToFileAsync({
        html: report,
        width: 612, // US Letter width in points
        height: 792, // US Letter height in points
      });

      // Share PDF
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Expense Management Report',
        });
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      Alert.alert('Error', 'Could not generate report. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0F6E66" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <BudgetSummary
        totalBudget={budgetSummary.totalBudget}
        receivedFund={budgetSummary.receivedFund}
        remainingFund={budgetSummary.remainingFund}
        peopleOverFund={budgetSummary.peopleOverFund}
      />
      
      <Card style={styles.card}>
        <RNView style={styles.reportButtonContainer}>
          <Button
            title="Download Report"
            onPress={handleDownloadReport}
            variant="outline"
            style={styles.reportButton}
            icon={<FontAwesome5 name="download" size={16} color="#0F6E66" style={styles.reportButtonIcon} />}
          />
        </RNView>
      </Card>
      
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Expense Status</Text>
        <RNView style={styles.statusCardsContainer}>
          <RNView style={[styles.statusCard, { backgroundColor: '#E0E0E0' }]}>
            <Text style={styles.statusNumber}>{statusCounts.pending}</Text>
            <Text style={styles.statusLabel}>Pending</Text>
            <Text style={styles.statusAmount}>Rs. {statusAmounts.pending.toLocaleString()}</Text>
          </RNView>
          <RNView style={[styles.statusCard, { backgroundColor: '#FFE0B2' }]}>
            <Text style={styles.statusNumber}>{statusCounts.tookOver}</Text>
            <Text style={styles.statusLabel}>Took Over</Text>
            <Text style={styles.statusAmount}>Rs. {statusAmounts.tookOver.toLocaleString()}</Text>
          </RNView>
          <RNView style={[styles.statusCard, { backgroundColor: '#C8E6C9' }]}>
            <Text style={styles.statusNumber}>{statusCounts.done}</Text>
            <Text style={styles.statusLabel}>Done</Text>
            <Text style={styles.statusAmount}>Rs. {statusAmounts.done.toLocaleString()}</Text>
          </RNView>
          <RNView style={[styles.statusCard, { backgroundColor: '#E3F2FD' }]}>
            <Text style={styles.statusNumber}>{statusCounts.utilized}</Text>
            <Text style={styles.statusLabel}>Utilized</Text>
            <Text style={styles.statusAmount}>Rs. {statusAmounts.utilized.toLocaleString()}</Text>
          </RNView>
        </RNView>
      </Card>
      
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Expenses by Category</Text>
        {categoryBreakdown.length === 0 ? (
          <RNView style={styles.emptyState}>
            <FontAwesome5 name="chart-pie" size={24} color="#757575" />
            <Text style={styles.emptyText}>No expense data</Text>
          </RNView>
        ) : (
          categoryBreakdown.map((category) => (
            <RNView key={category.id} style={styles.breakdownItem}>
              <RNView style={styles.breakdownHeader}>
                <RNView style={styles.categoryDot} />
                <Text style={styles.breakdownName}>{category.name}</Text>
              </RNView>
              <RNView style={styles.breakdownDetails}>
                <Text style={styles.breakdownAmount}>Rs. {category.totalAmount.toLocaleString()}</Text>
                <Text style={styles.breakdownCount}>({category.count} expenses)</Text>
              </RNView>
            </RNView>
          ))
        )}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Expenses by Funder</Text>
        {funderBreakdown.length === 0 ? (
          <RNView style={styles.emptyState}>
            <FontAwesome5 name="users" size={24} color="#757575" />
            <Text style={styles.emptyText}>No funder data</Text>
          </RNView>
        ) : (
          funderBreakdown.map((funder) => (
            <RNView key={funder.id} style={styles.breakdownItem}>
              <RNView style={styles.breakdownHeader}>
                <FontAwesome5 name="user" size={14} color="#0F6E66" style={styles.funderIcon} />
                <Text style={styles.breakdownName}>{funder.name}</Text>
              </RNView>
              <RNView style={styles.breakdownDetails}>
                <Text style={styles.breakdownAmount}>Rs. {funder.totalAmount.toLocaleString()}</Text>
                <Text style={styles.breakdownCount}>({funder.count} expenses)</Text>
              </RNView>
            </RNView>
          ))
        )}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Recent Expenses</Text>
        {recentExpenses.length === 0 ? (
          <RNView style={styles.emptyState}>
            <FontAwesome5 name="receipt" size={24} color="#757575" />
            <Text style={styles.emptyText}>No recent expenses</Text>
          </RNView>
        ) : (
          recentExpenses.map((expense) => (
            <RNView key={expense.id} style={styles.recentExpenseItem}>
              <RNView style={styles.recentExpenseHeader}>
                <Text style={styles.recentExpenseTitle}>{expense.title}</Text>
                <Text style={styles.recentExpenseAmount}>Rs. {expense.amount.toLocaleString()}</Text>
              </RNView>
              <RNView style={styles.recentExpenseDetails}>
                <Text style={styles.recentExpenseStatus}>{expense.status}</Text>
                <Text style={styles.recentExpenseDate}>
                  {new Date(expense.createdAt).toLocaleDateString()}
                </Text>
              </RNView>
            </RNView>
          ))
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginTop: 16,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statusCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusCard: {
    flex: 1,
    minWidth: '48%',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  statusNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  statusAmount: {
    fontSize: 12,
    color: '#757575',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    marginTop: 8,
  },
  breakdownItem: {
    marginBottom: 16,
  },
  breakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0F6E66',
    marginRight: 8,
  },
  funderIcon: {
    marginRight: 8,
  },
  breakdownName: {
    fontSize: 16,
    fontWeight: '600',
  },
  breakdownDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F6E66',
  },
  breakdownCount: {
    fontSize: 14,
    color: '#757575',
  },
  recentExpenseItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  recentExpenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  recentExpenseTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  recentExpenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F6E66',
  },
  recentExpenseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentExpenseStatus: {
    fontSize: 14,
    color: '#757575',
  },
  recentExpenseDate: {
    fontSize: 14,
    color: '#757575',
  },
  reportButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  reportButton: {
    minWidth: 200,
  },
  reportButtonIcon: {
    marginRight: 8,
  },
}); 