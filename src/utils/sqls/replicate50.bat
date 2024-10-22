@echo off
:: Variables for dev and qa database connections
set DEV_DB=tu_chile
set QA_DB=tu_chile
set DEV_HOST=localhost
set QA_HOST=localhost
set DEV_PORT=5436
set QA_PORT=5437
set DB_USER=your_db_user   :: Replace with your PostgreSQL username
set DB_PASSWORD=your_db_password   :: Replace with your PostgreSQL password

:: Export password to avoid entering it each time (For Windows, it depends on the PostgreSQL configuration)
set PGPASSWORD=%DB_PASSWORD%

:: Table to be copied
set TABLE=sausua

:: Schema
set SCHEMA=tucl_online_chilecore_dbs

echo Copying top 50 rows from table: %TABLE%

:: Step 1: Dump top 50 rows from the dev database for the sausua table
pg_dump -h %DEV_HOST% -p %DEV_PORT% -U %DB_USER% -d %DEV_DB% -t "%SCHEMA%.%TABLE%" --data-only --column-inserts --rows-per-insert=50 -f %TABLE%_data.sql

:: Add a LIMIT clause to only select the top 50 rows
psql -h %DEV_HOST% -p %DEV_PORT% -U %DB_USER% -d %DEV_DB% -c "COPY (SELECT * FROM \"%SCHEMA%\".\"%TABLE%\" LIMIT 50) TO STDOUT WITH CSV HEADER" > %TABLE%_top50.csv

:: Step 2: Truncate the corresponding table in the qa database
psql -h %QA_HOST% -p %QA_PORT% -U %DB_USER% -d %QA_DB% -c "TRUNCATE TABLE \"%SCHEMA%\".\"%TABLE%\";"

:: Step 3: Restore the top 50 rows into the qa database
psql -h %QA_HOST% -p %QA_PORT% -U %DB_USER% -d %QA_DB% -c "\copy \"%SCHEMA%\".\"%TABLE%\" FROM '%TABLE%_top50.csv' CSV HEADER;"

:: Clean up the dumped CSV file
del %TABLE%_top50.csv

echo Table %TABLE% updated with top 50 rows from dev to qa successfully!

:: Unset password after script completes
set PGPASSWORD=

pause
