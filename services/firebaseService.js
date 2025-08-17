import { 
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Category Operations
export const getCategories = async () => {
  try {
    const categoriesRef = collection(db, 'categories');
    const q = query(categoriesRef, orderBy('name'));
    const querySnapshot = await getDocs(q);
    
    const categories = [];
    querySnapshot.forEach((doc) => {
      categories.push({ id: doc.id, ...doc.data() });
    });
    
    return categories;
  } catch (error) {
    console.error('Error getting categories:', error);
    throw error;
  }
};

export const addCategory = async (categoryData) => {
  try {
    const categoriesRef = collection(db, 'categories');
    const newCategory = {
      ...categoryData,
      createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(categoriesRef, newCategory);
    return { id: docRef.id, ...newCategory };
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
};

export const updateCategory = async (categoryId, categoryData) => {
  try {
    const categoryRef = doc(db, 'categories', categoryId);
    await updateDoc(categoryRef, {
      ...categoryData,
      updatedAt: serverTimestamp(),
    });
    
    return { id: categoryId, ...categoryData };
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

export const deleteCategory = async (categoryId) => {
  try {
    await deleteDoc(doc(db, 'categories', categoryId));
    return categoryId;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

// Expense Operations
export const getExpense = async (id) => {
  try {
    const expenseRef = doc(db, 'expenses', id);
    const expenseSnap = await getDoc(expenseRef);
    
    if (!expenseSnap.exists()) {
      return null;
    }
    
    return {
      id: expenseSnap.id,
      ...expenseSnap.data()
    };
  } catch (error) {
    console.error('Error getting expense:', error);
    throw error;
  }
};

export const getExpenses = async (categoryId = null) => {
  try {
    const expensesRef = collection(db, 'expenses');
    let q;
    
    if (categoryId) {
      q = query(
        expensesRef,
        where('categoryId', '==', categoryId),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(expensesRef, orderBy('createdAt', 'desc'));
    }
    
    const querySnapshot = await getDocs(q);
    
    const expenses = [];
    querySnapshot.forEach((doc) => {
      expenses.push({ id: doc.id, ...doc.data() });
    });
    
    return expenses;
  } catch (error) {
    console.error('Error getting expenses:', error);
    throw error;
  }
};

// Real-time listener for expenses
export const listenExpenses = (categoryId = null, callback) => {
  try {
    const expensesRef = collection(db, 'expenses');
    let q;
    if (categoryId) {
      q = query(
        expensesRef,
        where('categoryId', '==', categoryId),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(expensesRef, orderBy('createdAt', 'desc'));
    }
    return onSnapshot(q, (snapshot) => {
      const expenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(expenses);
    });
  } catch (error) {
    console.error('Error listening to expenses:', error);
    return () => {};
  }
};

// Real-time listener for categories
export const listenCategories = (callback) => {
  try {
    const categoriesRef = collection(db, 'categories');
    const q = query(categoriesRef, orderBy('name'));
    return onSnapshot(q, (snapshot) => {
      const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(categories);
    });
  } catch (error) {
    console.error('Error listening to categories:', error);
    return () => {};
  }
};

// Real-time listener for funders
export const listenFunders = (callback) => {
  try {
    const fundersRef = collection(db, 'funders');
    const q = query(fundersRef, orderBy('name'));
    return onSnapshot(q, (snapshot) => {
      const funders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(funders);
    });
  } catch (error) {
    console.error('Error listening to funders:', error);
    return () => {};
  }
};

export const addExpense = async (expenseData) => {
  try {
    const expensesRef = collection(db, 'expenses');
    const newExpense = {
      ...expenseData,
      createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(expensesRef, newExpense);
    return { id: docRef.id, ...newExpense };
  } catch (error) {
    console.error('Error adding expense:', error);
    throw error;
  }
};

export const updateExpense = async (expenseId, expenseData) => {
  try {
    const expenseRef = doc(db, 'expenses', expenseId);
    await updateDoc(expenseRef, {
      ...expenseData,
      updatedAt: serverTimestamp(),
    });
    
    return { id: expenseId, ...expenseData };
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
};

export const deleteExpense = async (expenseId) => {
  try {
    await deleteDoc(doc(db, 'expenses', expenseId));
    return expenseId;
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};

// Budget Operations
export const getBudgetSummary = async () => {
  try {
    const budgetRef = doc(db, 'budget', 'summary');
    const docSnap = await getDoc(budgetRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      // Create default budget if not exists
      const defaultBudget = {
        totalBudget: 0,
        receivedFund: 0,
        peopleOverFund: 0,
        remainingFund: 0,
      };
      
      await setDoc(budgetRef, defaultBudget);
      return defaultBudget;
    }
  } catch (error) {
    console.error('Error getting budget summary:', error);
    throw error;
  }
};

export const updateBudgetSummary = async (budgetData) => {
  try {
    const budgetRef = doc(db, 'budget', 'summary');
    await setDoc(budgetRef, {
      ...budgetData,
      updatedAt: serverTimestamp(),
    });
    
    return budgetData;
  } catch (error) {
    console.error('Error updating budget summary:', error);
    throw error;
  }
};

// Helper Operations
export const getHelpers = async () => {
  try {
    const helpersRef = collection(db, 'helpers');
    const q = query(helpersRef, orderBy('name'));
    const querySnapshot = await getDocs(q);
    
    const helpers = [];
    querySnapshot.forEach((doc) => {
      helpers.push({ id: doc.id, ...doc.data() });
    });
    
    return helpers;
  } catch (error) {
    console.error('Error getting helpers:', error);
    throw error;
  }
};

export const addHelper = async (helperData) => {
  try {
    const helpersRef = collection(db, 'helpers');
    const newHelper = {
      ...helperData,
      createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(helpersRef, newHelper);
    return { id: docRef.id, ...newHelper };
  } catch (error) {
    console.error('Error adding helper:', error);
    throw error;
  }
}; 

// Funder Operations
export const getFunders = async () => {
  try {
    const fundersRef = collection(db, 'funders');
    const q = query(fundersRef, orderBy('name'));
    const querySnapshot = await getDocs(q);
    
    const funders = [];
    querySnapshot.forEach((doc) => {
      funders.push({ id: doc.id, ...doc.data() });
    });
    
    return funders;
  } catch (error) {
    console.error('Error getting funders:', error);
    throw error;
  }
};

export const addFunder = async (funderData) => {
  try {
    const fundersRef = collection(db, 'funders');
    const newFunder = {
      ...funderData,
      createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(fundersRef, newFunder);
    return { id: docRef.id, ...newFunder };
  } catch (error) {
    console.error('Error adding funder:', error);
    throw error;
  }
};

export const updateFunder = async (funderId, funderData) => {
  try {
    const funderRef = doc(db, 'funders', funderId);
    await updateDoc(funderRef, {
      ...funderData,
      updatedAt: serverTimestamp(),
    });
    
    return { id: funderId, ...funderData };
  } catch (error) {
    console.error('Error updating funder:', error);
    throw error;
  }
};

export const deleteFunder = async (funderId) => {
  try {
    await deleteDoc(doc(db, 'funders', funderId));
    return funderId;
  } catch (error) {
    console.error('Error deleting funder:', error);
    throw error;
  }
}; 