@echo off
:: Variables for dev and qa database connections
set DEV_DB=tu_chile
set QA_DB=tu_chile
set DEV_HOST=localhost
set QA_HOST=localhost
set DEV_PORT=5436
set QA_PORT=5437
set DEV_USER=dev_user   :: Replace with your dev database username
set DEV_PASSWORD=dev_password   :: Replace with your dev database password
set QA_USER=qa_user     :: Replace with your qa database username
set QA_PASSWORD=qa_password     :: Replace with your qa database password

:: Export dev password for psql command to avoid prompt
set PGPASSWORD=%DEV_PASSWORD%

:: Table to be copied
set TABLE=sausua

:: Schema
set SCHEMA=tucl_online_chilecore_dbs

echo Copying top 50 rows from table: %TABLE%

:: Step 1: Export top 50 rows from the dev database's sausua table to a CSV file
psql -h %DEV_HOST% -p %DEV_PORT% -U %DEV_USER% -d %DEV_DB% -c "\COPY (SELECT * FROM \"%SCHEMA%\".\"%TABLE%\" LIMIT 50) TO '%TABLE%_top50.csv' CSV HEADER;"

:: Update to use QA password for the next steps
set PGPASSWORD=%QA_PASSWORD%

:: Step 2: Truncate the corresponding table in the qa database
psql -h %QA_HOST% -p %QA_PORT% -U %QA_USER% -d %QA_DB% -c "TRUNCATE TABLE \"%SCHEMA%\".\"%TABLE%\";"

:: Step 3: Import the top 50 rows into the qa database
psql -h %QA_HOST% -p %QA_PORT% -U %QA_USER% -d %QA_DB% -c "\COPY \"%SCHEMA%\".\"%TABLE%\" FROM '%TABLE%_top50.csv' CSV HEADER;"

:: Clean up the dumped CSV file
del %TABLE%_top50.csv

echo Table %TABLE% updated with top 50 rows from dev to qa successfully!

:: Unset password after script completes
set PGPASSWORD=

pause
