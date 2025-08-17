import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View as RNView, ActivityIndicator, RefreshControl, TouchableOpacity, Alert, Platform } from 'react-native';
import { Text, View } from '../../components/Themed';
import { FontAwesome5 } from '@expo/vector-icons';
import BudgetSummary from '../../components/BudgetSummary';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { getBudgetSummary, getExpenses, getCategories, getFunders, listenExpenses, listenCategories, listenFunders } from '../../services/firebaseService';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useTheme } from '../../context/theme';

export default function DashboardScreen() {
  const { colors, isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [budgetSummary, setBudgetSummary] = useState({
    totalBudget: 0,
    receivedFund: 0,
    peopleOverFund: 0,
    remainingFund: 0,
  });
  const [statusCounts, setStatusCounts] = useState({
    remaining: 0,
    pending: 0,
    received: 0,
    spent: 0,
  });
  const [statusAmounts, setStatusAmounts] = useState({
    remaining: 0,
    pending: 0,
    received: 0,
    spent: 0,
  });
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [funderBreakdown, setFunderBreakdown] = useState([]);
  const [funderMap, setFunderMap] = useState({}); // id -> name for report usage
  const [recentExpenses, setRecentExpenses] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [budgetData, expensesDataRaw, categoriesData, fundersData] = await Promise.all([
        getBudgetSummary(),
        getExpenses(),
        getCategories(),
        getFunders()
      ]);
      // Normalize Firestore Timestamp fields to ISO strings for reliable Date handling
      const expensesData = expensesDataRaw.map(exp => ({
        ...exp,
        createdAt: exp.createdAt?.toDate ? exp.createdAt.toDate().toISOString() : exp.createdAt,
        updatedAt: exp.updatedAt?.toDate ? exp.updatedAt.toDate().toISOString() : exp.updatedAt,
      }));
      
      // Calculate total budget as sum of all expenses
      const totalBudget = expensesData.reduce((sum, expense) => sum + (expense.amount || 0), 0);
      
      // Calculate received fund as sum of expenses with status "Received"
      const receivedFund = expensesData
        .filter(expense => expense.status === 'Received')
        .reduce((sum, expense) => sum + (expense.amount || 0), 0);
      
      setBudgetSummary({
        totalBudget,
        receivedFund,
        remainingFund: totalBudget - receivedFund,
        peopleOverFund: 0, // This is not used anymore
      });
      
      // Calculate status counts and amounts
      const counts = {
        remaining: 0,
        pending: 0,
        received: 0,
        spent: 0,
      };
      
      const amounts = {
        remaining: 0,
        pending: 0,
        received: 0,
        spent: 0,
      };
      
      expensesData.forEach(expense => {
        if (expense.status === 'Outstanding') {
          counts.remaining += 1;
          amounts.remaining += expense.amount;
        } else if (expense.status === 'Pending') {
          counts.pending += 1;
          amounts.pending += expense.amount;
        } else if (expense.status === 'Received') {
          counts.received += 1;
          amounts.received += expense.amount;
        } else if (expense.status === 'Spent') {
          counts.spent += 1;
          amounts.spent += expense.amount;
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
  // Build simple id->name map for reporting
  const funderNameMap = {};
  fundersData.forEach(f => { funderNameMap[f.id] = f.name; });
  setFunderMap(funderNameMap);

      // Get recent expenses
      const sortedExpenses = [...expensesData]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
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
    // Real-time updates for expenses
  const unsubExpenses = listenExpenses(null, (expensesLive) => {
      // Normalize timestamps
      const expensesData = expensesLive.map(exp => ({
        ...exp,
        createdAt: exp.createdAt?.toDate ? exp.createdAt.toDate().toISOString() : exp.createdAt,
      }));

      // Recalculate summaries dependent on expenses only
      const totalBudget = expensesData.reduce((sum, expense) => sum + (expense.amount || 0), 0);
      const receivedFund = expensesData
        .filter(expense => expense.status === 'Received')
        .reduce((sum, expense) => sum + (expense.amount || 0), 0);
      setBudgetSummary(prev => ({
        ...prev,
        totalBudget,
        receivedFund,
        remainingFund: totalBudget - receivedFund,
      }));

      const counts = { remaining:0, pending:0, received:0, spent:0 };
      const amounts = { remaining:0, pending:0, received:0, spent:0 };
      expensesData.forEach(expense => {
        if (expense.status === 'Outstanding') { counts.remaining++; amounts.remaining += expense.amount || 0; }
        else if (expense.status === 'Pending') { counts.pending++; amounts.pending += expense.amount || 0; }
        else if (expense.status === 'Received') { counts.received++; amounts.received += expense.amount || 0; }
        else if (expense.status === 'Spent') { counts.spent++; amounts.spent += expense.amount || 0; }
      });
      setStatusCounts(counts);
      setStatusAmounts(amounts);

      // Recompute category breakdown using current categories state
      setCategoryBreakdown(prevCats => {
        const catMap = {}; // id -> {id,name,totalAmount,count}
        prevCats.forEach(c => { catMap[c.id] = { ...c, totalAmount:0, count:0 }; });
        expensesData.forEach(exp => {
          if (exp.categoryId && catMap[exp.categoryId]) {
            catMap[exp.categoryId].totalAmount += exp.amount || 0;
            catMap[exp.categoryId].count += 1;
          }
        });
        return Object.values(catMap).sort((a,b)=> b.totalAmount - a.totalAmount);
      });

      // Recompute funder breakdown using current funderMap
      setFunderBreakdown(prev => {
        const funderBase = {}; // id -> {id,name,totalAmount,count}
        Object.entries(funderMap).forEach(([id,name])=> { funderBase[id]={ id, name, totalAmount:0, count:0 }; });
        expensesData.forEach(exp => {
          if (exp.funderId && funderBase[exp.funderId]) {
            funderBase[exp.funderId].totalAmount += exp.amount || 0;
            funderBase[exp.funderId].count += 1;
          }
        });
        return Object.values(funderBase).sort((a,b)=> b.totalAmount - a.totalAmount);
      });

      // Recent expenses
      const sortedExpenses = [...expensesData]
        .sort((a,b)=> new Date(b.createdAt||0)-new Date(a.createdAt||0))
        .slice(0,5);
      setRecentExpenses(sortedExpenses);
    });
    // Real-time categories
    const unsubCategories = listenCategories((catsLive) => {
      // Recompute category breakdown with current expenses
      setCategoryBreakdown(prev => {
        // We'll recompute after expenses change; here just map base
        const map = catsLive.map(c => ({ id: c.id, name: c.name, totalAmount:0, count:0 }));
        return map;
      });
    });
    // Real-time funders
    const unsubFunders = listenFunders((fundersLive) => {
      setFunderBreakdown(prev => {
        const list = fundersLive.map(f => ({ id: f.id, name: f.name, totalAmount:0, count:0 }));
        return list;
      });
      const funderNameMap = {};
      fundersLive.forEach(f=> funderNameMap[f.id]=f.name);
      setFunderMap(funderNameMap);
    });
    return () => {
      unsubExpenses && unsubExpenses();
      unsubCategories && unsubCategories();
      unsubFunders && unsubFunders();
    };
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
            border-bottom: 2px solid #64a12d;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #64a12d;
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
            color: #64a12d;
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
            color: #64a12d;
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
            color: #64a12d;
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
        <td>Received (Available + Spent)</td>
        <td class="amount">Rs. ${(statusAmounts.received + statusAmounts.spent).toLocaleString()}</td>
      </tr>
      <tr>
        <td>Remaining (Outstanding + Pending)</td>
        <td class="amount">Rs. ${(statusAmounts.remaining + statusAmounts.pending).toLocaleString()}</td>
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
                <td>Outstanding</td>
                <td>${statusCounts.remaining}</td>
                <td class="amount">Rs. ${statusAmounts.remaining.toLocaleString()}</td>
            </tr>
            <tr>
                <td>Pending</td>
                <td>${statusCounts.pending}</td>
                <td class="amount">Rs. ${statusAmounts.pending.toLocaleString()}</td>
            </tr>
            <tr>
                <td>Available</td>
                <td>${statusCounts.received}</td>
                <td class="amount">Rs. ${statusAmounts.received.toLocaleString()}</td>
            </tr>
            <tr>
                <td>Spent</td>
                <td>${statusCounts.spent}</td>
                <td class="amount">Rs. ${statusAmounts.spent.toLocaleString()}</td>
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
                        <th>Funder</th>
                        <th>Date</th>
                    </tr>
                    ${recentExpenses
                        .filter(expense => expense.categoryId === category.id)
                        .map(expense => `
                            <tr>
                                <td>${expense.title}</td>
                                <td class="amount">Rs. ${expense.amount.toLocaleString()}</td>
                                <td class="${expense.status === 'Pending' ? 'status-took-over' : ''}">${expense.status}</td>
                                <td>${funderMap[expense.funderId] || 'Not Assigned'}</td>
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
                <th>Funder</th>
                <th>Date</th>
            </tr>
            ${recentExpenses.map(expense => `
                <tr>
                    <td>${expense.title}</td>
                    <td class="amount">Rs. ${expense.amount.toLocaleString()}</td>
                    <td class="${expense.status === 'Pending' ? 'status-took-over' : ''}">${expense.status}</td>
                    <td>${funderMap[expense.funderId] || 'Not Assigned'}</td>
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
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <BudgetSummary
        totalBudget={budgetSummary.totalBudget}
        receivedFund={budgetSummary.receivedFund}
        spent={statusAmounts.spent}
      />
      
      <Card style={styles.card}>
        <RNView style={styles.reportButtonContainer}>
          <Button
            title="Download Report"
            onPress={handleDownloadReport}
            variant="outline"
            style={styles.reportButton}
            icon={<FontAwesome5 name="download" size={16} color={colors.primary} style={styles.reportButtonIcon} />}
          />
        </RNView>
      </Card>
      
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Expense Status</Text>
        <RNView style={styles.statusCardsContainer}>
          <RNView style={[styles.statusCard, { backgroundColor: isDarkMode ? 'rgba(255, 39, 39, 0.63)' : '#FFCCCC' }]}>
            <Text style={styles.statusNumber}>{statusCounts.remaining}</Text>
            <Text style={styles.statusLabel}>Outstanding</Text>
            <Text style={styles.statusAmount}>Rs. {statusAmounts.remaining.toLocaleString()}</Text>
          </RNView>
          <RNView style={[styles.statusCard, { backgroundColor: isDarkMode ? 'rgba(255, 166, 33, 0.7)' : '#FFE0B2' }]}>
            <Text style={styles.statusNumber}>{statusCounts.pending}</Text>
            <Text style={styles.statusLabel}>Pending</Text>
            <Text style={styles.statusAmount}>Rs. {statusAmounts.pending.toLocaleString()}</Text>
          </RNView>
          <RNView style={[styles.statusCard, { backgroundColor: isDarkMode ? 'rgba(51, 125, 254, 0.57)' : '#c4d9ffff' }]}>
            <Text style={styles.statusNumber}>{statusCounts.received}</Text>
            <Text style={styles.statusLabel}>Available</Text>
            <Text style={styles.statusAmount}>Rs. {statusAmounts.received.toLocaleString()}</Text>
          </RNView>
          <RNView style={[styles.statusCard, { backgroundColor: isDarkMode ? 'rgba(83, 255, 49, 0.5)' : '#baffacff' }]}>
            <Text style={styles.statusNumber}>{statusCounts.spent}</Text>
            <Text style={styles.statusLabel}>Spent</Text>
            <Text style={styles.statusAmount}>Rs. {statusAmounts.spent.toLocaleString()}</Text>
          </RNView>
        </RNView>
      </Card>
      
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Expenses by Category</Text>
        {categoryBreakdown.length === 0 ? (
          <RNView style={styles.emptyState}>
            <FontAwesome5 name="chart-pie" size={24} color={colors.text} />
            <Text style={styles.emptyText}>No expense data</Text>
          </RNView>
        ) : (
          categoryBreakdown.map((category) => (
            <RNView key={category.id} style={styles.breakdownItem}>
              <RNView style={styles.breakdownHeader}>
                <RNView style={[styles.categoryDot, { backgroundColor: colors.primary }]} />
                <Text style={styles.breakdownName}>{category.name}</Text>
              </RNView>
              <RNView style={styles.breakdownDetails}>
                <Text style={[styles.breakdownAmount, { color: colors.primary }]}>Rs. {category.totalAmount.toLocaleString()}</Text>
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
            <FontAwesome5 name="users" size={24} color={colors.text} />
            <Text style={styles.emptyText}>No funder data</Text>
          </RNView>
        ) : (
          funderBreakdown.map((funder) => (
            <RNView key={funder.id} style={styles.breakdownItem}>
              <RNView style={styles.breakdownHeader}>
                <FontAwesome5 name="user" size={14} color={colors.primary} style={styles.funderIcon} />
                <Text style={styles.breakdownName}>{funder.name}</Text>
              </RNView>
              <RNView style={styles.breakdownDetails}>
                <Text style={[styles.breakdownAmount, { color: colors.primary }]}>Rs. {funder.totalAmount.toLocaleString()}</Text>
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
            <FontAwesome5 name="receipt" size={24} color={colors.text} />
            <Text style={styles.emptyText}>No recent expenses</Text>
          </RNView>
        ) : (
          recentExpenses.map((expense) => (
            <RNView key={expense.id} style={[styles.recentExpenseItem, { borderBottomColor: colors.border }]}>
              <RNView style={styles.recentExpenseHeader}>
                <Text style={styles.recentExpenseTitle}>{expense.title}</Text>
                <Text style={[styles.recentExpenseAmount, { color: colors.primary }]}>Rs. {expense.amount.toLocaleString()}</Text>
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
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
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
  },
  breakdownCount: {
    fontSize: 14,
  },
  recentExpenseItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
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
  },
  recentExpenseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentExpenseStatus: {
    fontSize: 14,
  },
  recentExpenseDate: {
    fontSize: 14,
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