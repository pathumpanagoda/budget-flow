import { StyleSheet, ScrollView } from 'react-native';
import { Text, View } from '../../components/Themed';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { router } from 'expo-router';
import { useTheme } from '../../context/theme';

export default function AboutScreen() {
  const { colors } = useTheme();
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Card style={styles.card}>
        <Text style={styles.title}>About BudgetFlow</Text>
        <Text style={styles.paragraph}>BudgetFlow helps you track project funding, categories, and expenses with real-time updates powered by Firebase.</Text>
        <Text style={styles.subtitle}>Key Features</Text>
        <Text style={styles.paragraph}>
          • Real-time expense & status tracking{"\n"}
          • Category & funder breakdowns{"\n"}
          • PDF report generation{"\n"}
          • Dark mode support
        </Text>
        <Text style={styles.subtitle}>Developer</Text>
        <Text style={styles.paragraph}>Developed by Dilshan Pathum (pathumpanagoda@gmail.com).</Text>
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
