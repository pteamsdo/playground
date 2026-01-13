/**
 * DBInterface (Client-Side)
 * Centralized collection of SQL command templates for DuckDB-WASM.
 */
export default class DBInterface {
    
    static getPublicTables() {
        return "SELECT table_name FROM information_schema.tables WHERE table_schema = 'main' AND table_name NOT LIKE 'system_%' ORDER BY table_name";
    }

    static getTableRows(tableName, limit = 100) {
        return `SELECT * FROM "${tableName}" LIMIT ${limit}`;
    }

    static dropTable(tableName) {
        return `DROP TABLE IF EXISTS "${tableName}"`;
    }

    static createTableAsSelect(newTableName, sourceFunction) {
        return `CREATE TABLE "${newTableName}" AS SELECT * FROM ${sourceFunction}`;
    }

    // --- Analytics Helpers ---
    
    static getSum(tableName, column) {
        // Cast to DOUBLE to ensure JS receives a standard Number (avoiding Uint32Array/HugeInt issues)
        return `SELECT CAST(SUM("${column}") AS DOUBLE) as value FROM "${tableName}"`;
    }

    static getCount(tableName) {
        // Count is safe as integer/double
        return `SELECT CAST(COUNT(*) AS DOUBLE) as value FROM "${tableName}"`;
    }

    static getGroupBySum(tableName, groupCol, sumCol) {
        // Cast group to VARCHAR for labels
        // Cast sum to DOUBLE for values
        return `SELECT CAST("${groupCol}" AS VARCHAR) as label, CAST(SUM("${sumCol}") AS DOUBLE) as value FROM "${tableName}" GROUP BY "${groupCol}" ORDER BY "${groupCol}"`;
    }

    // --- Demo Helpers ---
    
    static createTableIfNotExists(tableName, schema) {
        return `CREATE TABLE IF NOT EXISTS "${tableName}" (${schema})`;
    }

    static insertValues(tableName, values) {
        return `INSERT INTO "${tableName}" VALUES ${values}`;
    }
}