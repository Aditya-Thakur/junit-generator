@echo off
:: Variables for dev and qa database connections
set DEV_DB=tu_chile
set QA_DB=tu_chile
set DEV_HOST=localhost
set QA_HOST=localhost
set DEV_PORT=5436
set QA_PORT=5440
set DB_USER=your_db_user   :: Replace with your PostgreSQL username
set DB_PASSWORD=your_db_password   :: Replace with your PostgreSQL password

:: Export password to avoid entering it each time (For Windows, it depends on the PostgreSQL configuration)
set PGPASSWORD=%DB_PASSWORD%

:: Tables to be copied
set TABLES=sauspf sausua saclie

:: Schema
set SCHEMA=tucl_online_chilecore_dbs

:: Loop through tables and process each one
for %%T in (%TABLES%) do (
    echo Copying table: %%T

    :: Step 1: Dump data from dev database for each table
    pg_dump -h %DEV_HOST% -p %DEV_PORT% -U %DB_USER% -d %DEV_DB% -t "%SCHEMA%.%%T" --data-only --column-inserts > %%T_data.sql

    :: Step 2: Truncate the corresponding table in qa database
    psql -h %QA_HOST% -p %QA_PORT% -U %DB_USER% -d %QA_DB% -c "TRUNCATE TABLE \"%SCHEMA%\".\"%%T\";"

    :: Step 3: Restore the dumped data to qa database
    psql -h %QA_HOST% -p %QA_PORT% -U %DB_USER% -d %QA_DB% -f %%T_data.sql

    :: Clean up the dumped SQL file
    del %%T_data.sql

    echo Table %%T copied successfully!
)

:: Unset password after script completes
set PGPASSWORD=

echo Data copy from dev to qa completed successfully.
pause
