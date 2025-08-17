import { StyleSheet, ScrollView } from 'react-native';
import { Text, View } from '../../components/Themed';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { router } from 'expo-router';
import { useTheme } from '../../context/theme';

export default function HelpScreen() {
  const { colors } = useTheme();
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Card style={styles.card}>
        <Text style={styles.title}>Help & Support</Text>
        <Text style={styles.paragraph}>Need assistance using BudgetFlow? Below are quick tips.</Text>
        <Text style={styles.subtitle}>Adding Expenses</Text>
        <Text style={styles.paragraph}>Use the Add Expense button on the home or expenses tabs. Assign a category and funder for accurate summaries.</Text>
        <Text style={styles.subtitle}>Statuses</Text>
        <Text style={styles.paragraph}>Outstanding & Pending represent funds not yet received. Available is received funds that can be spent. Spent tracks used funds.</Text>
        <Text style={styles.subtitle}>Real-Time Updates</Text>
        <Text style={styles.paragraph}>All budget, category and funder stats update live as you add or edit data.</Text>
        <Text style={styles.subtitle}>Need More Help?</Text>
        <Text style={styles.paragraph}>Email us at pathumpanagoda@gmail.com.</Text>
        <Button title="Back" variant="outline" onPress={()=> router.back()} style={styles.backBtn} />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1 },
  card: { margin:16 },
  title: { fontSize:22, fontWeight:'bold', marginBottom:12 },
  subtitle: { fontSize:16, fontWeight:'600', marginTop:16, marginBottom:4 },
  paragraph: { fontSize:14, lineHeight:20 },
  backBtn: { marginTop:24 },
});
