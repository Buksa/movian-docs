# SQLite API

Complete reference for SQLite database operations in Movian plugins.

## Overview

The SQLite API provides full database functionality for plugins that need structured data storage beyond simple key-value pairs. It supports:

- Database creation and management
- SQL query execution
- Prepared statements for performance
- Transaction support
- Type-safe parameter binding

**Use Cases**:
- Caching complex data structures
- Storing user history and preferences
- Managing large datasets
- Implementing search indexes
- Tracking watched content

## Module Import

```javascript
var sqlite = require('movian/sqlite');
```

## Database Operations

### Opening a Database

```javascript
/**
 * Create or open a SQLite database
 * @param {string} dbname - Database filename (stored in plugin's databases directory)
 * @returns {Database} Database object
 */
var db = new sqlite.DB('data.db');
```

**Example**:
```javascript
// Create/open database in plugin's databases directory
// Database will be stored at: {plugin_storage}/databases/cache.db
var db = new sqlite.DB('cache.db');

// Create tables if they don't exist
db.query("CREATE TABLE IF NOT EXISTS cache (" +
         "  key TEXT PRIMARY KEY," +
         "  value TEXT," +
         "  timestamp INTEGER" +
         ")");
```

**Note**: The database file is automatically stored in the plugin's `databases/` subdirectory. You only need to provide the filename, not the full path.

### Closing a Database

```javascript
/**
 * Close database connection
 */
db.close();
```

## SQL Execution

### Execute SQL Statements

```javascript
/**
 * Execute SQL statement (INSERT, UPDATE, DELETE, CREATE, etc.)
 * @param {string} sql - SQL statement
 * @param {...*} params - Optional parameters for ? placeholders
 */
db.query(sql, param1, param2, ...);
```

**Example**:
```javascript
// Create table
db.query("CREATE TABLE users (" +
         "  id INTEGER PRIMARY KEY," +
         "  name TEXT NOT NULL," +
         "  email TEXT UNIQUE" +
         ")");

// Insert data with parameters
db.query("INSERT INTO users (name, email) VALUES (?, ?)", "John", "john@example.com");

// Update data
db.query("UPDATE users SET name = ? WHERE id = ?", "Jane", 1);

// Delete data
db.query("DELETE FROM users WHERE id = ?", 1);
```

### Query with Results

```javascript
/**
 * Execute SELECT query and iterate through results
 * Use db.step() to get each row
 */
db.query("SELECT * FROM users");
var row;
while ((row = db.step()) !== undefined) {
    console.log(row.name + " <" + row.email + ">");
}
```

**Example**:
```javascript
// Query with parameters
db.query("SELECT * FROM users WHERE active = ?", 1);
var row;
while ((row = db.step()) !== undefined) {
    console.log(row.name);
}

// Query with ORDER BY
db.query("SELECT * FROM users ORDER BY name ASC");
while ((row = db.step()) !== undefined) {
    // Process row...
}

// Query with LIMIT
db.query("SELECT * FROM history ORDER BY timestamp DESC LIMIT ?", 10);
while ((row = db.step()) !== undefined) {
    // Process row...
}
```

## Parameterized Queries

### Using Parameters

```javascript
/**
 * Use ? placeholders for parameters to prevent SQL injection
 * Parameters are passed as additional arguments to db.query()
 */
db.query(sql, param1, param2, ...);
```

**Parameter Types**:
- `null` - NULL value
- `number` - INTEGER or REAL
- `string` - TEXT
- `boolean` - INTEGER (0 or 1)

**Example**:
```javascript
// INSERT with parameters
db.query("INSERT INTO users (name, email, age) VALUES (?, ?, ?)", 
         "Alice", "alice@example.com", 25);
db.query("INSERT INTO users (name, email, age) VALUES (?, ?, ?)", 
         "Bob", "bob@example.com", 30);
db.query("INSERT INTO users (name, email, age) VALUES (?, ?, ?)", 
         "Charlie", "charlie@example.com", 35);

// SELECT with parameters
db.query("SELECT * FROM users WHERE age > ?", 25);
var row;
while ((row = db.step()) !== undefined) {
    console.log(row.name + " is " + row.age + " years old");
}

// UPDATE with parameters
db.query("UPDATE users SET email = ? WHERE name = ?", 
         "newemail@example.com", "Alice");

// DELETE with parameters
db.query("DELETE FROM users WHERE age < ?", 18);
```

## Transactions

### Using Transactions

```javascript
/**
 * Use SQL transaction commands for atomic operations
 */
db.query("BEGIN TRANSACTION");
try {
    // Your operations here
    db.query("INSERT INTO ...");
    db.query("UPDATE ...");
    db.query("COMMIT");
} catch (e) {
    db.query("ROLLBACK");
    throw e;
}
```

**Example**:
```javascript
try {
    db.query("BEGIN TRANSACTION");
    
    db.query("INSERT INTO accounts (id, balance) VALUES (?, ?)", 1, 1000);
    db.query("INSERT INTO accounts (id, balance) VALUES (?, ?)", 2, 500);
    
    // Transfer money
    db.query("UPDATE accounts SET balance = balance - ? WHERE id = ?", 100, 1);
    db.query("UPDATE accounts SET balance = balance + ? WHERE id = ?", 100, 2);
    
    db.query("COMMIT");
    console.log("Transaction completed");
} catch (e) {
    db.query("ROLLBACK");
    console.error("Transaction failed: " + e);
}
```

### Transaction Helper Function

```javascript
/**
 * Helper function to execute operations within a transaction
 */
function withTransaction(db, func) {
    db.query("BEGIN TRANSACTION");
    try {
        var result = func();
        db.query("COMMIT");
        return result;
    } catch (e) {
        db.query("ROLLBACK");
        throw e;
    }
}
```

**Example**:
```javascript
var success = withTransaction(db, function() {
    // Query balance
    db.query("SELECT balance FROM accounts WHERE id = ?", 1);
    var row = db.step();
    var balance = row ? row.balance : 0;
    
    if (balance < 100) {
        throw new Error("Insufficient funds");
    }
    
    db.query("UPDATE accounts SET balance = balance - ? WHERE id = ?", 100, 1);
    db.query("UPDATE accounts SET balance = balance + ? WHERE id = ?", 100, 2);
    
    return true;
});
```

## Common Patterns

### Cache Implementation

```javascript
var CacheDB = {
    db: null,
    
    init: function() {
        this.db = new sqlite.DB('cache.db');
        this.db.query(
            "CREATE TABLE IF NOT EXISTS cache (" +
            "  key TEXT PRIMARY KEY," +
            "  value TEXT," +
            "  timestamp INTEGER" +
            ")"
        );
        this.db.query("CREATE INDEX IF NOT EXISTS idx_timestamp ON cache(timestamp)");
    },
    
    get: function(key) {
        this.db.query("SELECT value FROM cache WHERE key = ?", key);
        var row = this.db.step();
        
        if (row !== undefined) {
            return JSON.parse(row.value);
        }
        return null;
    },
    
    set: function(key, value) {
        this.db.query(
            "INSERT OR REPLACE INTO cache (key, value, timestamp) VALUES (?, ?, ?)",
            key, JSON.stringify(value), Date.now()
        );
    },
    
    remove: function(key) {
        this.db.query("DELETE FROM cache WHERE key = ?", key);
    },
    
    cleanup: function(maxAge) {
        var cutoff = Date.now() - maxAge;
        this.db.query("DELETE FROM cache WHERE timestamp < ?", cutoff);
        console.log("Cleaned up old cache entries");
    }
};

// Initialize cache
CacheDB.init();

// Use cache
CacheDB.set("user:123", {name: "John", email: "john@example.com"});
var user = CacheDB.get("user:123");

// Cleanup old entries (older than 7 days)
CacheDB.cleanup(7 * 24 * 60 * 60 * 1000);
```

### History Tracking

```javascript
var HistoryDB = {
    db: null,
    
    init: function() {
        this.db = new sqlite.DB('history.db');
        this.db.query(
            "CREATE TABLE IF NOT EXISTS history (" +
            "  id INTEGER PRIMARY KEY AUTOINCREMENT," +
            "  url TEXT NOT NULL," +
            "  title TEXT," +
            "  timestamp INTEGER," +
            "  duration INTEGER," +
            "  position INTEGER" +
            ")"
        );
        this.db.query("CREATE INDEX IF NOT EXISTS idx_url ON history(url)");
        this.db.query("CREATE INDEX IF NOT EXISTS idx_timestamp ON history(timestamp)");
    },
    
    add: function(url, title) {
        this.db.query(
            "INSERT INTO history (url, title, timestamp, duration, position) " +
            "VALUES (?, ?, ?, 0, 0)",
            url, title, Date.now()
        );
    },
    
    updatePosition: function(url, position, duration) {
        this.db.query(
            "UPDATE history SET position = ?, duration = ? WHERE url = ?",
            position, duration, url
        );
    },
    
    getRecent: function(limit) {
        this.db.query("SELECT * FROM history ORDER BY timestamp DESC LIMIT ?", limit || 20);
        var results = [];
        var row;
        while ((row = this.db.step()) !== undefined) {
            results.push(row);
        }
        return results;
    },
    
    getPosition: function(url) {
        this.db.query(
            "SELECT position, duration FROM history WHERE url = ? ORDER BY timestamp DESC LIMIT 1",
            url
        );
        var row = this.db.step();
        return row !== undefined ? row : null;
    },
    
    clear: function() {
        this.db.query("DELETE FROM history");
    }
};
```

### Search Index

```javascript
var SearchIndex = {
    db: null,
    
    init: function() {
        this.db = new sqlite.DB('search.db');
        this.db.query(
            "CREATE VIRTUAL TABLE IF NOT EXISTS search_index " +
            "USING fts4(title, description, tags)"
        );
    },
    
    index: function(id, title, description, tags) {
        this.db.query(
            "INSERT INTO search_index (docid, title, description, tags) " +
            "VALUES (?, ?, ?, ?)",
            id, title, description, tags.join(' ')
        );
    },
    
    search: function(query) {
        this.db.query(
            "SELECT docid, title, description FROM search_index " +
            "WHERE search_index MATCH ?",
            query
        );
        var results = [];
        var row;
        while ((row = this.db.step()) !== undefined) {
            results.push(row);
        }
        return results;
    },
    
    remove: function(id) {
        this.db.query("DELETE FROM search_index WHERE docid = ?", id);
    }
};
```

## Best Practices

### Use Parameterized Queries

```javascript
// BAD: String concatenation (SQL injection risk)
db.query("SELECT * FROM users WHERE name = '" + userName + "'");

// GOOD: Parameterized query
db.query("SELECT * FROM users WHERE name = ?", userName);
var row;
while ((row = db.step()) !== undefined) {
    // Process row...
}
```

### Use Transactions for Bulk Operations

```javascript
// BAD: Individual inserts
for (var i = 0; i < 1000; i++) {
    db.query("INSERT INTO data VALUES (?)", i);
}

// GOOD: Transaction for bulk operations
db.query("BEGIN TRANSACTION");
for (var i = 0; i < 1000; i++) {
    db.query("INSERT INTO data VALUES (?)", i);
}
db.query("COMMIT");
```

### Create Indexes for Performance

```javascript
// Create indexes on frequently queried columns
db.query("CREATE INDEX IF NOT EXISTS idx_user_email ON users(email)");
db.query("CREATE INDEX IF NOT EXISTS idx_history_timestamp ON history(timestamp)");

// Composite indexes for multi-column queries
db.query("CREATE INDEX IF NOT EXISTS idx_user_status_date ON users(status, created_date)");
```

### Clean Up Resources

```javascript
// Close database when plugin unloads
db.close();
```

## Error Handling

```javascript
try {
    var db = new sqlite.DB('data.db');
    
    db.query("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT)");
    db.query("INSERT INTO users (name) VALUES (?)", "John");
    
} catch (e) {
    console.error("Database error: " + e);
    console.error("Error code: " + db.lastErrorCode);
    console.error("Error message: " + db.lastErrorString);
    // Handle error appropriately
}
```

## Database Properties

### Last Insert Row ID

```javascript
/**
 * Get the row ID of the last INSERT operation
 * @type {number}
 */
var id = db.lastRowId;
```

**Example**:
```javascript
db.query("INSERT INTO users (name) VALUES (?)", "John");
var userId = db.lastRowId;
console.log("Inserted user with ID: " + userId);
```

### Error Information

```javascript
/**
 * Get the last error code
 * @type {number}
 */
var errorCode = db.lastErrorCode;

/**
 * Get the last error message
 * @type {string}
 */
var errorMsg = db.lastErrorString;
```

**Example**:
```javascript
try {
    db.query("INSERT INTO users (id, name) VALUES (?, ?)", 1, "John");
} catch (e) {
    console.error("Error " + db.lastErrorCode + ": " + db.lastErrorString);
}
```

## Performance Tips

1. **Use transactions** for multiple operations
2. **Create indexes** on frequently queried columns
3. **Use prepared statements** for repeated queries
4. **Limit result sets** with LIMIT clause
5. **Vacuum database** periodically to reclaim space
6. **Use appropriate data types** for efficiency
7. **Avoid SELECT *** - specify needed columns

## See Also

- [Storage API](storage-api.md) - Simple key-value storage
- [Performance Guide](performance.md) - Optimization techniques
- [Best Practices](../best-practices.md) - Plugin development patterns
- [Error Handling](error-handling.md) - Error management
