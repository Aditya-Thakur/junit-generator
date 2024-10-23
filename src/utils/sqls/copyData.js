const { Client } = require('pg');

// Database configuration
const devConfig = {
    user: 'dev_user',     // Replace with your dev database username
    host: 'localhost',
    database: 'tu_chile',
    password: 'dev_password', // Replace with your dev database password
    port: 5436,
};

const qaConfig = {
    user: 'qa_user',      // Replace with your qa database username
    host: 'localhost',
    database: 'tu_chile',
    password: 'qa_password',  // Replace with your qa database password
    port: 5437,
};

// Table and schema details
const tableName = 'sausua';
const schemaName = 'tucl_online_chilecore_dbs';

// Function to get top 50 rows from dev
async function getTop50FromDev() {
    const devClient = new Client(devConfig);

    try {
        await devClient.connect();
        console.log('Connected to dev database.');

        const query = `SELECT * FROM "${schemaName}"."${tableName}" LIMIT 50;`;
        const res = await devClient.query(query);

        console.log(`Fetched ${res.rowCount} rows from dev database.`);
        return res.rows;
    } catch (err) {
        console.error('Error fetching data from dev:', err.stack);
    } finally {
        await devClient.end();
        console.log('Disconnected from dev database.');
    }
}

// Function to insert data into qa
async function insertIntoQa(rows) {
    const qaClient = new Client(qaConfig);

    try {
        await qaClient.connect();
        console.log('Connected to qa database.');

        // Truncate the table in QA
        await qaClient.query(`TRUNCATE TABLE "${schemaName}"."${tableName}";`);
        console.log(`Truncated table ${tableName} in qa database.`);

        // Insert the data into QA
        const insertQuery = `INSERT INTO "${schemaName}"."${tableName}" (${Object.keys(rows[0]).join(', ')}) VALUES `;
        const values = rows.map((row, index) => {
            const placeholders = Object.values(row).map((_, i) => `$${i + 1 + index * Object.values(row).length}`);
            return `(${placeholders.join(', ')})`;
        }).join(', ');

        const flatValues = rows.flatMap(Object.values); // Flatten the array of row values
        await qaClient.query(insertQuery + values, flatValues);

        console.log(`Inserted ${rows.length} rows into qa database.`);
    } catch (err) {
        console.error('Error inserting data into qa:', err.stack);
    } finally {
        await qaClient.end();
        console.log('Disconnected from qa database.');
    }
}

// Main function to handle the copying process
async function copyData() {
    try {
        const rows = await getTop50FromDev();
        if (rows && rows.length > 0) {
            await insertIntoQa(rows);
        } else {
            console.log('No data found to copy.');
        }
    } catch (err) {
        console.error('Error during data copy:', err);
    }
}

// Run the copy process
copyData();
