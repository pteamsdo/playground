/**
 * DemoData (Client-Side)
 * Handles seeding the browser-based DuckDB and LocalStorage Widgets.
 */
import DBInterface from './db_interface.js';

export default class DemoData {

    static async seedDB(conn) {
        console.log("[Demo] Seeding SQL Tables...");
        
        const commands = [
            // 1. Revenue
            DBInterface.createTableIfNotExists('Q3_Revenue', 'region VARCHAR, product VARCHAR, sales INTEGER, date DATE'),
            DBInterface.insertValues('Q3_Revenue', `
                ('North', 'Widget A', 1200, '2023-09-01'), 
                ('South', 'Widget B', 800, '2023-09-01'), 
                ('East', 'Widget A', 1500, '2023-09-02'), 
                ('West', 'Widget C', 2000, '2023-09-02')
            `),

            // 2. User Access
            DBInterface.createTableIfNotExists('User_Access', 'user_id VARCHAR, last_login DATE, role VARCHAR'),
            DBInterface.insertValues('User_Access', `
                ('u_101', '2023-10-10', 'admin'), 
                ('u_102', '2023-10-09', 'editor')
            `),

            // 3. Transactions
            DBInterface.createTableIfNotExists('Recent_Transactions', 'tx_id VARCHAR, user_name VARCHAR, amount VARCHAR, status VARCHAR'),
            DBInterface.insertValues('Recent_Transactions', `
                ('#TX-998', 'Alice Smith', '$450.00', 'Completed'), 
                ('#TX-999', 'Bob Jones', '$120.50', 'Processing'), 
                ('#TX-1000', 'Charlie Day', '$900.00', 'Completed')
            `)
        ];

        // Execute sequentially
        for (const sql of commands) {
            try {
                await conn.query(sql);
            } catch (e) {
                // Ignore unique constraint/exists errors in demo
                console.warn("[Demo] SQL Skip:", e.message);
            }
        }
    }

    static seedWidgets(store) {
        console.log("[Demo] Seeding Widgets...");
        const widgets = [
            { 
                id: crypto.randomUUID(), type: 'metric', w: 1, h: 1, title: 'Total Revenue', 
                content: { value: '$0.00', subtext: 'Aggregated from DB', color: 'text-green-600', query: DBInterface.getSum('Q3_Revenue', 'sales') } 
            },
            { 
                id: crypto.randomUUID(), type: 'metric', w: 1, h: 1, title: 'Active Users', 
                content: { value: '0', subtext: 'Total Count', color: 'text-blue-600', query: DBInterface.getCount('User_Access') } 
            },
            { 
                id: crypto.randomUUID(), type: 'chart', w: 2, h: 2, title: 'Sales Trend', 
                content: { chartType: 'line', labels: [], data: [], query: DBInterface.getGroupBySum('Q3_Revenue', 'date', 'sales') } 
            },
            { 
                id: crypto.randomUUID(), type: 'text', w: 2, h: 1, title: 'System Info', 
                content: { value: 'This dashboard is running entirely in your browser using DuckDB-WASM. No server-side database is connected.' } 
            }
        ];
        
        widgets.forEach(w => store.add(w));
    }
}