const dbService = require('./sqliteService.js'); // Changed to require

const log = (message) => console.log(`[TEST LOG] ${message}`);
const assertEquals = (expected, actual, message) => {
  if (JSON.stringify(expected) !== JSON.stringify(actual)) {
    console.error(`[ASSERTION FAILED] ${message}. Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}`);
    // Log the actual types as well for debugging
    console.error(`Expected type: ${typeof expected}, Actual type: ${typeof actual}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  log(`[ASSERTION PASSED] ${message}`);
};

const assert = (condition, message) => {
  if (!condition) {
    console.error(`[ASSERTION FAILED] ${message}. Condition was false.`);
    throw new Error(`Assertion failed: ${message}`);
  }
  log(`[ASSERTION PASSED] ${message}`);
};

async function runAllTests() {
  try {
    log("Starting all tests...");

    // Test Database Initialization
    log("--- Testing Database Initialization ---");
    await dbService.initializeDatabase(); // This now returns a Promise
    log("initializeDatabase called successfully.");

    // Categories Tests
    log("--- Testing Categories ---");
    const category1Id = `cat_${Date.now()}_1`;
    const category2Id = `cat_${Date.now()}_2`;
    const category3Id = `cat_${Date.now()}_3`;

    await dbService.addCategory({ id: category1Id, name: 'Groceries' });
    log("Added category Groceries");
    await dbService.addCategory({ id: category2Id, name: 'Salary' });
    log("Added category Salary");
    await dbService.addCategory({ id: category3Id, name: 'Books' });
    log("Added category Books");

    let categories = await dbService.getCategories();
    assertEquals(3, categories.length, "Should have 3 categories after adding");
    assertEquals('Books', categories[0].name, "Categories should be ordered by name (Books first)");
    assertEquals('Groceries', categories[1].name, "Categories should be ordered by name (Groceries second)");
    assertEquals('Salary', categories[2].name, "Categories should be ordered by name (Salary third)");
    log("getCategories returned correct initial categories");

    await dbService.updateCategory(category1Id, { name: 'Food Shopping' });
    log("Updated Groceries to Food Shopping");
    
    categories = await dbService.getCategories();
    const updatedCategory = categories.find(cat => cat.id === category1Id);
    assert(updatedCategory !== undefined, "Updated category should exist");
    assertEquals('Food Shopping', updatedCategory.name, "Category name should be updated to Food Shopping");
    log("getCategories returned updated category name");

    await dbService.deleteCategory(category2Id);
    log("Deleted category Salary");

    categories = await dbService.getCategories();
    assertEquals(2, categories.length, "Should have 2 categories after deletion");
    assert(!categories.some(cat => cat.id === category2Id), "Deleted category Salary should not exist");
    log("getCategories verified category deletion");
    const foodShoppingCat = categories.find(cat => cat.name === 'Food Shopping'); 
    assert(foodShoppingCat !== undefined, "Food Shopping category should exist for expense tests");
    const booksCat = categories.find(cat => cat.name === 'Books');
    assert(booksCat !== undefined, "Books category should exist for expense tests");


    // Expenses Tests
    log("--- Testing Expenses ---");
    const foodShoppingCatId = foodShoppingCat.id;
    const booksCatId = booksCat.id;

    const expense1Id = `exp_${Date.now()}_1`;
    const expense2Id = `exp_${Date.now()}_2`;
    const expense3Id = `exp_${Date.now()}_3`;
    const today = new Date().toISOString().split('T')[0];
    const funderForTestId = `funder_exp_test_${Date.now()}`;
    await dbService.addFunder({ id: funderForTestId, name: 'Expense Test Funder', amount: 0 });


    await dbService.addExpense({ id: expense1Id, categoryId: foodShoppingCatId, title: 'Milk', amount: 2.50, date: today, description: 'From corner store', status: 'Remaining', funderId: null });
    log("Added expense Milk");
    await dbService.addExpense({ id: expense2Id, categoryId: foodShoppingCatId, title: 'Bread', amount: 3.00, date: today, description: 'Whole wheat', status: 'Spent', funderId: funderForTestId });
    log("Added expense Bread");
    await dbService.addExpense({ id: expense3Id, categoryId: booksCatId, title: 'Programming Book', amount: 50.00, date: today, description: 'JS Advanced Concepts', status: 'Pending', funderId: null });
    log("Added expense Programming Book");


    let allExpenses = await dbService.getExpenses();
    assertEquals(3, allExpenses.length, "Should have 3 expenses in total initially");
    log("getExpenses (all) returned correct number of expenses");

    let categoryExpenses = await dbService.getExpenses(foodShoppingCatId);
    assertEquals(2, categoryExpenses.length, `Should have 2 expenses for category ${foodShoppingCatId}`);
    log(`getExpenses (for category ${foodShoppingCatId}) returned correct number of expenses`);

    let singleExpense = await dbService.getExpense(expense1Id);
    assertEquals(expense1Id, singleExpense.id, "getExpense should return the correct expense by ID (Milk)");
    assertEquals('Milk', singleExpense.title, "getExpense should return the correct expense title (Milk)");
    assertEquals('Remaining', singleExpense.status, "getExpense should return correct status for Milk");
    log("getExpense (single) returned correct expense (Milk)");

    await dbService.updateExpense(expense1Id, { 
      categoryId: foodShoppingCatId, 
      title: 'Almond Milk', 
      amount: 3.50, 
      date: today, 
      description: 'Unsweetened', 
      status: 'Pending', 
      funderId: funderForTestId 
    });
    log("Updated expense Milk to Almond Milk, status Pending, new funder");

    singleExpense = await dbService.getExpense(expense1Id);
    assertEquals('Almond Milk', singleExpense.title, "Updated expense title should be Almond Milk");
    assertEquals(3.50, singleExpense.amount, "Updated expense amount should be 3.50");
    assertEquals('Pending', singleExpense.status, "Updated expense status should be Pending");
    assertEquals(funderForTestId, singleExpense.funderId, "Updated expense funderId should be set");
    log("getExpense (single, after update) verified update for Almond Milk");

    await dbService.deleteExpense(expense2Id);
    log("Deleted expense Bread");

    allExpenses = await dbService.getExpenses();
    assertEquals(2, allExpenses.length, "Should have 2 expenses after deletion");
    const deletedExpenseCheck = await dbService.getExpense(expense2Id);
    assertEquals(null, deletedExpenseCheck, "Deleted expense Bread should not exist / return null");
    log("getExpenses (all, after deletion) and getExpense (single) verified deletion");

    // Budget Tests
    log("--- Testing Budget ---");
    let budgetSummary = await dbService.getBudgetSummary();
    // Default values if first time. ID might be null or 1 depending on prior state.
    assert(budgetSummary.id !== undefined, "Default budget summary should have id");
    assert(budgetSummary.totalBudget !== undefined, "Default budget summary should have totalBudget");
    log("getBudgetSummary (initial/default) returned a summary object");

    const budgetUpdateData = { totalBudget: 1000.75, receivedFund: 500.50, peopleOverFund: 2, remainingFund: 500.25 };
    const updatedSummary = await dbService.updateBudgetSummary(budgetUpdateData); // updateBudgetSummary now returns the updated object
    log("Updated budget summary");
    
    assertEquals(budgetUpdateData.totalBudget, updatedSummary.totalBudget, "Updated totalBudget should match");
    assertEquals(budgetUpdateData.receivedFund, updatedSummary.receivedFund, "Updated receivedFund should match");
    assertEquals(budgetUpdateData.peopleOverFund, updatedSummary.peopleOverFund, "Updated peopleOverFund should match");
    assertEquals(budgetUpdateData.remainingFund, updatedSummary.remainingFund, "Updated remainingFund should match");
    log("getBudgetSummary (after update via returned object) verified update");

    // Helpers Tests
    log("--- Testing Helpers ---");
    const helper1Id = `helper_${Date.now()}_1`;
    const helper2Id = `helper_${Date.now()}_2`;
    await dbService.addHelper({ id: helper1Id, name: 'John Doe' });
    log("Added helper John Doe");
    await dbService.addHelper({ id: helper2Id, name: 'Jane Smith' });
    log("Added helper Jane Smith");

    let helpers = await dbService.getHelpers();
    assertEquals(2, helpers.length, "Should have 2 helpers");
    assertEquals('Jane Smith', helpers[0].name, "Helpers should be ordered by name (Jane Smith first)");
    assertEquals('John Doe', helpers[1].name, "Helpers should be ordered by name (John Doe second)");
    log("getHelpers returned correct helpers");
    // No update/delete for helpers in test plan

    // Funders Tests
    log("--- Testing Funders ---");
    const funder1Id = `funder_${Date.now()}_1`;
    const funder2Id = `funder_${Date.now()}_2`;
    const funder3Id = `funder_${Date.now()}_3`;

    await dbService.addFunder({ id: funder1Id, name: 'Company A', amount: 1000 });
    log("Added funder Company A");
    await dbService.addFunder({ id: funder2Id, name: 'Anonymous Donor', amount: 500 });
    log("Added funder Anonymous Donor");
    await dbService.addFunder({ id: funder3Id, name: 'Charity Foundation', amount: 2000 });
    log("Added funder Charity Foundation");

    let funders = await dbService.getFunders();
    // Filter out funderForTestId if it's still there from expense tests for count consistency
    funders = funders.filter(f => f.id !== funderForTestId);
    assertEquals(3, funders.length, "Should have 3 main test funders after adding");
    assertEquals('Anonymous Donor', funders[0].name, "Funders should be ordered by name (Anonymous Donor first)");
    assertEquals('Charity Foundation', funders[1].name, "Funders should be ordered by name (Charity Foundation second)");
    assertEquals('Company A', funders[2].name, "Funders should be ordered by name (Company A third)");
    log("getFunders returned correct initial funders");

    await dbService.updateFunder(funder1Id, { name: 'Company A Inc.', amount: 1200.00 });
    log("Updated funder Company A to Company A Inc. and amount to 1200.00");

    funders = await dbService.getFunders();
    const updatedFunder = funders.find(f => f.id === funder1Id);
    assert(updatedFunder !== undefined, "Updated funder Company A Inc. should exist");
    assertEquals('Company A Inc.', updatedFunder.name, "Funder name should be updated to Company A Inc.");
    assertEquals(1200.00, updatedFunder.amount, "Funder amount should be updated to 1200.00");
    log("getFunders returned updated funder details for Company A Inc.");

    await dbService.deleteFunder(funder2Id);
    log("Deleted funder Anonymous Donor");

    funders = await dbService.getFunders().then(allF => allF.filter(f => f.id !== funderForTestId)); // filter again
    assertEquals(2, funders.length, "Should have 2 main test funders after deletion");
    const deletedFunderCheck = await dbService.getFunders().then(allF => allF.find(f => f.id === funder2Id));
    assertEquals(undefined, deletedFunderCheck, "Deleted funder Anonymous Donor should not exist");
    log("getFunders verified funder deletion");
    
    // Clean up the test funder from expenses
    await dbService.deleteFunder(funderForTestId);
    log("Cleaned up expense test funder");


    log("All tests completed successfully!");
    return true;
  } catch (error) {
    console.error("A test failed:", error.message);
    console.error("Stack trace:", error.stack);
    return false;
  }
}

// Run tests if script is executed directly
runAllTests().then(success => {
  if (success) {
    log("Test script finished: SUCCESS");
  } else {
    log("Test script finished: FAILED");
    process.exit(1); 
  }
}).catch(e => {
  console.error("Unhandled critical error during test execution:", e);
  process.exit(1);
});

// No explicit export needed if only run as a script
// module.exports = { runAllTests };
