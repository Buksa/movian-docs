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
 * Open or create a SQLite database
 * @param {string} path - Database file path (relative to plugin storage)
 * @returns {Database} Database object
 */
var db = sqlite.open(plugin.path + 'data.db');
```

**Example**:
```javascript
// Open database in plugin directory
var db = sqlite.open(plugin.path + 'cache.db');

// Create tables if they don't exist
db.exec("CREATE TABLE IF NOT EXISTS cache (" +
        "  key TEXT PRIMARY KEY," +
        "  value TEXT," +
        "  timestamp INTEGER" +
        ")");
```

### Closing a Database

```javascript
/**
 * Close database connection
 */
db.close();
```

## SQL Execution

### Execute Statement

```javascript
/**
 * Execute SQL statement without returning results
 * @param {string} sql - SQL statement
 * @returns {number} Number of affected rows
 */
var affected = db.exec(sql);
```

**Example**:
```javascript
// Create table
db.exec("CREATE TABLE users (" +
        "  id INTEGER PRIMARY KEY," +
        "  name TEXT NOT NULL," +
        "  email TEXT UNIQUE" +
        ")");

// Insert data
db.exec("INSERT INTO users (name, email) VALUES ('John', 'john@example.com')");

// Update data
var rows = db.exec("UPDATE users SET name = 'Jane' WHERE id = 1");
console.log("Updated " + rows + " rows");

// Delete data
db.exec("DELETE FROM users WHERE id = 1");
```

### Query with Results

```javascript
/**
 * Execute SELECT query and return results
 * @param {string} sql - SELECT statement
 * @returns {Array} Array of result objects
 */
var results = db.query(sql);
```

**Example**:
```javascript
// Simple query
var users = db.query("SELECT * FROM users");
users.forEach(function(user) {
    console.log(user.name + " <" + user.email + ">");
});

// Query with WHERE clause
var active = db.query("SELECT * FROM users WHERE active = 1");

// Query with ORDER BY
var sorted = db.query("SELECT * FROM users ORDER BY name ASC");

// Query with LIMIT
var recent = db.query("SELECT * FROM history ORDER BY timestamp DESC LIMIT 10");
```

## Prepared Statements

### Creating Prepared Statements

```javascript
/**
 * Prepare SQL statement for repeated execution
 * @param {string} sql - SQL statement with ? placeholders
 * @returns {Statement} Prepared statement object
 */
var stmt = db.prepare(sql);
```

### Binding Parameters

```javascript
/**
 * Bind parameters to prepared statement
 * @param {...*} params - Parameters to bind (in order)
 * @returns {Statement} Statement object for chaining
 */
stmt.bind(param1, param2, ...);
```

**Parameter Types**:
- `null` - NULL value
- `number` - INTEGER or REAL
- `string` - TEXT
- `boolean` - INTEGER (0 or 1)

### Executing Prepared Statements

```javascript
/**
 * Execute prepared statement
 * @returns {Array} Query results (for SELECT) or affected rows (for INSERT/UPDATE/DELETE)
 */
var results = stmt.execute();
```

**Example**:
```javascript
// Prepare INSERT statement
var insertStmt = db.prepare("INSERT INTO users (name, email, age) VALUES (?, ?, ?)");

// Insert multiple rows efficiently
insertStmt.bind("Alice", "alice@example.com", 25).execute();
insertStmt.bind("Bob", "bob@example.com", 30).execute();
insertStmt.bind("Charlie", "charlie@example.com", 35).execute();

// Prepare SELECT statement
var selectStmt = db.prepare("SELECT * FROM users WHERE age > ?");

// Execute with different parameters
var over25 = selectStmt.bind(25).execute();
var over30 = selectStmt.bind(30).execute();

// Clean up
insertStmt.finalize();
selectStmt.finalize();
```

### Finalizing Statements

```javascript
/**
 * Release prepared statement resources
 */
stmt.finalize();
```

## Transactions

### Manual Transactions

```javascript
/**
 * Begin transaction
 */
db.begin();

/**
 * Commit transaction
 */
db.commit();

/**
 * Rollback transaction
 */
db.rollback();
```

**Example**:
```javascript
try {
    db.begin();
    
    db.exec("INSERT INTO accounts (id, balance) VALUES (1, 1000)");
    db.exec("INSERT INTO accounts (id, balance) VALUES (2, 500)");
    
    // Transfer money
    db.exec("UPDATE accounts SET balance = balance - 100 WHERE id = 1");
    db.exec("UPDATE accounts SET balance = balance + 100 WHERE id = 2");
    
    db.commit();
    console.log("Transaction completed");
} catch (e) {
    db.rollback();
    console.error("Transaction failed: " + e);
}
```

### Transaction Helper

```javascript
/**
 * Execute function within transaction
 * @param {Function} func - Function to execute
 * @returns {*} Function return value
 */
var result = db.transaction(function() {
    // Operations here are atomic
    db.exec("INSERT INTO ...");
    db.exec("UPDATE ...");
    return someValue;
});
```

**Example**:
```javascript
var success = db.transaction(function() {
    var balance = db.query("SELECT balance FROM accounts WHERE id = 1")[0].balance;
    
    if (balance < 100) {
        throw new Error("Insufficient funds");
    }
    
    db.exec("UPDATE accounts SET balance = balance - 100 WHERE id = 1");
    db.exec("UPDATE accounts SET balance = balance + 100 WHERE id = 2");
    
    return true;
});
```

## Common Patterns

### Cache Implementation

```javascript
var CacheDB = {
    db: null,
    
    init: function() {
        this.db = sqlite.open(plugin.path + 'cache.db');
        this.db.exec(
            "CREATE TABLE IF NOT EXISTS cache (" +
            "  key TEXT PRIMARY KEY," +
            "  value TEXT," +
            "  timestamp INTEGER" +
            ")"
        );
        this.db.exec("CREATE INDEX IF NOT EXISTS idx_timestamp ON cache(timestamp)");
    },
    
    get: function(key) {
        var stmt = this.db.prepare("SELECT value FROM cache WHERE key = ?");
        var results = stmt.bind(key).execute();
        stmt.finalize();
        
        if (results.length > 0) {
            return JSON.parse(results[0].value);
        }
        return null;
    },
    
    set: function(key, value) {
        var stmt = this.db.prepare(
            "INSERT OR REPLACE INTO cache (key, value, timestamp) VALUES (?, ?, ?)"
        );
        stmt.bind(key, JSON.stringify(value), Date.now()).execute();
        stmt.finalize();
    },
    
    remove: function(key) {
        var stmt = this.db.prepare("DELETE FROM cache WHERE key = ?");
        stmt.bind(key).execute();
        stmt.finalize();
    },
    
    cleanup: function(maxAge) {
        var cutoff = Date.now() - maxAge;
        var stmt = this.db.prepare("DELETE FROM cache WHERE timestamp < ?");
        var deleted = stmt.bind(cutoff).execute();
        stmt.finalize();
        console.log("Cleaned up " + deleted + " old cache entries");
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
        this.db = sqlite.open(plugin.path + 'history.db');
        this.db.exec(
            "CREATE TABLE IF NOT EXISTS history (" +
            "  id INTEGER PRIMARY KEY AUTOINCREMENT," +
            "  url TEXT NOT NULL," +
            "  title TEXT," +
            "  timestamp INTEGER," +
            "  duration INTEGER," +
            "  position INTEGER" +
            ")"
        );
        this.db.exec("CREATE INDEX IF NOT EXISTS idx_url ON history(url)");
        this.db.exec("CREATE INDEX IF NOT EXISTS idx_timestamp ON history(timestamp)");
    },
    
    add: function(url, title) {
        var stmt = this.db.prepare(
            "INSERT INTO history (url, title, timestamp, duration, position) " +
            "VALUES (?, ?, ?, 0, 0)"
        );
        stmt.bind(url, title, Date.now()).execute();
        stmt.finalize();
    },
    
    updatePosition: function(url, position, duration) {
        var stmt = this.db.prepare(
            "UPDATE history SET position = ?, duration = ? WHERE url = ?"
        );
        stmt.bind(position, duration, url).execute();
        stmt.finalize();
    },
    
    getRecent: function(limit) {
        var stmt = this.db.prepare(
            "SELECT * FROM history ORDER BY timestamp DESC LIMIT ?"
        );
        var results = stmt.bind(limit || 20).execute();
        stmt.finalize();
        return results;
    },
    
    getPosition: function(url) {
        var stmt = this.db.prepare(
            "SELECT position, duration FROM history WHERE url = ? ORDER BY timestamp DESC LIMIT 1"
        );
        var results = stmt.bind(url).execute();
        stmt.finalize();
        
        if (results.length > 0) {
            return results[0];
        }
        return null;
    },
    
    clear: function() {
        this.db.exec("DELETE FROM history");
    }
};
```

### Search Index

```javascript
var SearchIndex = {
    db: null,
    
    init: function() {
        this.db = sqlite.open(plugin.path + 'search.db');
        this.db.exec(
            "CREATE VIRTUAL TABLE IF NOT EXISTS search_index " +
            "USING fts4(title, description, tags)"
        );
    },
    
    index: function(id, title, description, tags) {
        var stmt = this.db.prepare(
            "INSERT INTO search_index (docid, title, description, tags) " +
            "VALUES (?, ?, ?, ?)"
        );
        stmt.bind(id, title, description, tags.join(' ')).execute();
        stmt.finalize();
    },
    
    search: function(query) {
        var stmt = this.db.prepare(
            "SELECT docid, title, description FROM search_index " +
            "WHERE search_index MATCH ?"
        );
        var results = stmt.bind(query).execute();
        stmt.finalize();
        return results;
    },
    
    remove: function(id) {
        var stmt = this.db.prepare("DELETE FROM search_index WHERE docid = ?");
        stmt.bind(id).execute();
        stmt.finalize();
    }
};
```

## Best Practices

### Use Prepared Statements

```javascript
// BAD: String concatenation (SQL injection risk)
db.exec("SELECT * FROM users WHERE name = '" + userName + "'");

// GOOD: Prepared statement
var stmt = db.prepare("SELECT * FROM users WHERE name = ?");
var results = stmt.bind(userName).execute();
stmt.finalize();
```

### Use Transactions for Bulk Operations

```javascript
// BAD: Individual inserts
for (var i = 0; i < 1000; i++) {
    db.exec("INSERT INTO data VALUES (" + i + ")");
}

// GOOD: Transaction with prepared statement
db.begin();
var stmt = db.prepare("INSERT INTO data VALUES (?)");
for (var i = 0; i < 1000; i++) {
    stmt.bind(i).execute();
}
stmt.finalize();
db.commit();
```

### Create Indexes for Performance

```javascript
// Create indexes on frequently queried columns
db.exec("CREATE INDEX IF NOT EXISTS idx_user_email ON users(email)");
db.exec("CREATE INDEX IF NOT EXISTS idx_history_timestamp ON history(timestamp)");

// Composite indexes for multi-column queries
db.exec("CREATE INDEX IF NOT EXISTS idx_user_status_date ON users(status, created_date)");
```

### Clean Up Resources

```javascript
// Always finalize prepared statements
var stmt = db.prepare("SELECT * FROM users");
try {
    var results = stmt.execute();
    // Process results...
} finally {
    stmt.finalize();  // Always clean up
}

// Close database when done
db.close();
```

## Error Handling

```javascript
try {
    var db = sqlite.open(plugin.path + 'data.db');
    
    db.exec("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT)");
    
    var stmt = db.prepare("INSERT INTO users (name) VALUES (?)");
    stmt.bind("John").execute();
    stmt.finalize();
    
} catch (e) {
    console.error("Database error: " + e);
    // Handle error appropriately
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
