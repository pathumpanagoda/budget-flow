const SQLite = require('expo-sqlite'); // Changed to require

const db = SQLite.openDatabase('budgetApp.db');

const initializeDatabase = () => {
  return new Promise((resolve, reject) => { // Added Promise
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS categories (
          id TEXT PRIMARY KEY,
          name TEXT,
          createdAt TEXT
        );`,
        [],
        () => console.log('Categories table created successfully'),
        (_, error) => {
          console.log('Error creating categories table: ', error);
          reject(error); // Reject promise on error
        }
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS expenses (
          id TEXT PRIMARY KEY,
          categoryId TEXT,
          title TEXT,
          amount REAL,
          date TEXT,
          description TEXT,
          status TEXT, 
          createdAt TEXT,
          updatedAt TEXT,
          FOREIGN KEY (categoryId) REFERENCES categories(id)
        );`, // Added status TEXT
        [],
        () => console.log('Expenses table created successfully'),
        (_, error) => {
          console.log('Error creating expenses table: ', error);
          reject(error);
        }
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS budget (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          totalBudget REAL,
          receivedFund REAL,
          peopleOverFund REAL,
          remainingFund REAL,
          updatedAt TEXT
        );`,
        [],
        () => console.log('Budget table created successfully'),
        (_, error) => {
          console.log('Error creating budget table: ', error);
          reject(error);
        }
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS helpers (
          id TEXT PRIMARY KEY,
          name TEXT,
          createdAt TEXT
        );`,
        [],
        () => console.log('Helpers table created successfully'),
        (_, error) => {
          console.log('Error creating helpers table: ', error);
          reject(error);
        }
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS funders (
          id TEXT PRIMARY KEY,
          name TEXT,
          amount REAL,
          createdAt TEXT,
          updatedAt TEXT
        );`,
        [],
        () => {
          console.log('Funders table created successfully');
          resolve(); // Resolve promise after last statement
        },
        (_, error) => {
          console.log('Error creating funders table: ', error);
          reject(error);
        }
      );
    });
  });
};

const getCategories = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM categories ORDER BY name;',
        [],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

const addCategory = (categoryData) => {
  return new Promise((resolve, reject) => {
    const { id, name } = categoryData;
    const createdAt = new Date().toISOString();
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO categories (id, name, createdAt) VALUES (?, ?, ?);',
        [id, name, createdAt],
        (_, { insertId, rowsAffected }) => resolve({ id: id, name, createdAt }), // Return what was inserted
        (_, error) => reject(error)
      );
    });
  });
};

const updateCategory = (categoryId, categoryData) => {
  return new Promise((resolve, reject) => {
    const { name } = categoryData;
    // SQLite does not automatically update timestamp on UPDATE.
    // If an 'updatedAt' field is desired for categories, it needs to be added to the table
    // and explicitly set here. For now, matching the existing schema.
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE categories SET name = ? WHERE id = ?;', // Removed updatedAt from SET
        [name, categoryId],
        (_, { rowsAffected }) => {
          if (rowsAffected > 0) {
            resolve({ id: categoryId, name }); // Return updated data
          } else {
            reject(new Error(`Category with id ${categoryId} not found`));
          }
        },
        (_, error) => reject(error)
      );
    });
  });
};

const deleteCategory = (categoryId) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM categories WHERE id = ?;',
        [categoryId],
        (_, { rowsAffected }) => {
          if (rowsAffected > 0) {
            resolve();
          } else {
            reject(new Error(`Category with id ${categoryId} not found`));
          }
        },
        (_, error) => reject(error)
      );
    });
  });
};

const getExpense = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM expenses WHERE id = ?;',
        [id],
        (_, { rows }) => {
          if (rows.length > 0) {
            resolve(rows.item(0));
          } else {
            // Changed to resolve with null instead of reject for "not found" cases
            // This makes it easier to assert in tests if an item is expected to be missing
            resolve(null); 
          }
        },
        (_, error) => reject(error)
      );
    });
  });
};

const getExpenses = (categoryId = null) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      let query = 'SELECT * FROM expenses';
      const params = [];
      if (categoryId) {
        query += ' WHERE categoryId = ?';
        params.push(categoryId);
      }
      query += ' ORDER BY createdAt DESC;';
      tx.executeSql(
        query,
        params,
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

const addExpense = (expenseData) => {
  return new Promise((resolve, reject) => {
    const { id, categoryId, title, amount, date, description, status, funderId } = expenseData; // Added status and funderId
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO expenses (id, categoryId, title, amount, date, description, status, funderId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);', // Added status, funderId
        [id, categoryId, title, amount, date, description, status, funderId, createdAt, updatedAt],
        (_, { insertId }) => resolve({ id: id, ...expenseData, createdAt, updatedAt }),
        (_, error) => reject(error)
      );
    });
  });
};

const updateExpense = (expenseId, expenseData) => {
  return new Promise((resolve, reject) => {
    const { categoryId, title, amount, date, description, status, funderId } = expenseData; // Added status and funderId
    const updatedAt = new Date().toISOString();
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE expenses SET categoryId = ?, title = ?, amount = ?, date = ?, description = ?, status = ?, funderId = ?, updatedAt = ? WHERE id = ?;', // Added status, funderId
        [categoryId, title, amount, date, description, status, funderId, updatedAt, expenseId],
        (_, { rowsAffected }) => {
          if (rowsAffected > 0) {
            resolve({ id: expenseId, ...expenseData, updatedAt });
          } else {
            reject(new Error(`Expense with id ${expenseId} not found`));
          }
        },
        (_, error) => reject(error)
      );
    });
  });
};

const deleteExpense = (expenseId) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM expenses WHERE id = ?;',
        [expenseId],
        (_, { rowsAffected }) => {
          if (rowsAffected > 0) {
            resolve();
          } else {
            reject(new Error(`Expense with id ${expenseId} not found`));
          }
        },
        (_, error) => reject(error)
      );
    });
  });
};

const getFunders = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM funders ORDER BY name;',
        [],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

const addFunder = (funderData) => {
  return new Promise((resolve, reject) => {
    const { id, name, amount } = funderData;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt; 
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO funders (id, name, amount, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?);',
        [id, name, amount, createdAt, updatedAt],
        (_, { insertId }) => resolve({ id: id, ...funderData, createdAt, updatedAt }),
        (_, error) => reject(error)
      );
    });
  });
};

const updateFunder = (funderId, funderData) => {
  return new Promise((resolve, reject) => {
    const { name, amount } = funderData;
    const updatedAt = new Date().toISOString();
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE funders SET name = ?, amount = ?, updatedAt = ? WHERE id = ?;',
        [name, amount, updatedAt, funderId],
        (_, { rowsAffected }) => {
          if (rowsAffected > 0) {
            resolve({ id: funderId, ...funderData, updatedAt });
          } else {
            reject(new Error(`Funder with id ${funderId} not found`));
          }
        },
        (_, error) => reject(error)
      );
    });
  });
};

const deleteFunder = (funderId) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM funders WHERE id = ?;',
        [funderId],
        (_, { rowsAffected }) => {
          if (rowsAffected > 0) {
            resolve();
          } else {
            reject(new Error(`Funder with id ${funderId} not found`));
          }
        },
        (_, error) => reject(error)
      );
    });
  });
};

const getHelpers = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM helpers ORDER BY name;',
        [],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

const addHelper = (helperData) => {
  return new Promise((resolve, reject) => {
    const { id, name } = helperData;
    const createdAt = new Date().toISOString();
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO helpers (id, name, createdAt) VALUES (?, ?, ?);',
        [id, name, createdAt],
        (_, { insertId }) => resolve({ id: id, ...helperData, createdAt }),
        (_, error) => reject(error)
      );
    });
  });
};

const getBudgetSummary = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM budget ORDER BY id DESC LIMIT 1;',
        [],
        (_, { rows }) => {
          if (rows.length > 0) {
            resolve(rows.item(0));
          } else {
            const defaultSummary = {
              id: null, // No ID until inserted
              totalBudget: 0,
              receivedFund: 0,
              peopleOverFund: 0,
              remainingFund: 0,
              updatedAt: new Date().toISOString(),
            };
            // Insert the default and then resolve it
            tx.executeSql(
              'INSERT INTO budget (totalBudget, receivedFund, peopleOverFund, remainingFund, updatedAt) VALUES (?, ?, ?, ?, ?);',
              [
                defaultSummary.totalBudget,
                defaultSummary.receivedFund,
                defaultSummary.peopleOverFund,
                defaultSummary.remainingFund,
                defaultSummary.updatedAt,
              ],
              (_, { insertId }) => resolve({ ...defaultSummary, id: insertId }),
              (_, error) => reject(error)
            );
          }
        },
        (_, error) => reject(error)
      );
    });
  });
};

const updateBudgetSummary = (budgetData) => {
  return new Promise((resolve, reject) => {
    const { totalBudget, receivedFund, peopleOverFund, remainingFund } = budgetData;
    const updatedAt = new Date().toISOString();
    db.transaction(tx => {
      tx.executeSql(
        'SELECT id FROM budget ORDER BY id DESC LIMIT 1;', // Get current ID
        [],
        (_, { rows }) => {
          let currentId = null;
          if (rows.length > 0) {
            currentId = rows.item(0).id;
          }

          if (currentId !== null) {
            tx.executeSql(
              'UPDATE budget SET totalBudget = ?, receivedFund = ?, peopleOverFund = ?, remainingFund = ?, updatedAt = ? WHERE id = ?;',
              [totalBudget, receivedFund, peopleOverFund, remainingFund, updatedAt, currentId],
              (_, { rowsAffected }) => {
                if (rowsAffected > 0) {
                  resolve({ id: currentId, ...budgetData, updatedAt });
                } else {
                  // This case should ideally not be reached if ID was found
                  reject(new Error('Failed to update budget summary, record not found or no change.'));
                }
              },
              (_, error) => reject(error)
            );
          } else {
            // No existing record, insert a new one
            tx.executeSql(
              'INSERT INTO budget (totalBudget, receivedFund, peopleOverFund, remainingFund, updatedAt) VALUES (?, ?, ?, ?, ?);',
              [totalBudget, receivedFund, peopleOverFund, remainingFund, updatedAt],
              (_, { insertId }) => resolve({ id: insertId, ...budgetData, updatedAt }),
              (_, error) => reject(error)
            );
          }
        },
        (_, error) => reject(error) // Error fetching current budget ID
      );
    });
  });
};

// Correctly export all functions for CommonJS
module.exports = {
  initializeDatabase,
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getExpense,
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  getBudgetSummary,
  updateBudgetSummary,
  getHelpers,
  addHelper,
  getFunders,
  addFunder,
  updateFunder,
  deleteFunder,
};
