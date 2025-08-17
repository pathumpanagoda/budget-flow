import { Stack } from 'expo-router';

export default function ScreenLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#64a12d',
        },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen
        name="new-expense"
        options={{
          title: 'New Expense',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="new-category"
        options={{
          title: 'New Category',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="category/[id]"
        options={{
          title: 'Category Details',
        }}
      />
      <Stack.Screen
        name="expense/[id]"
        options={{
          title: 'Expense Details',
        }}
      />
      <Stack.Screen
        name="edit-expense/[id]"
        options={{
          title: 'Edit Expense',
        }}
      />
      <Stack.Screen
        name="all-expenses"
        options={{
          title: 'All Expenses',
        }}
      />
    </Stack>
  );
} 