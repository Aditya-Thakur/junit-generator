-- Given list of parametros
WITH parametros AS (
    SELECT DISTINCT parametro
    FROM tu_chile.tucl_online_chilecore_dbs.sauspf
    WHERE parametro IN ('param1', 'param2', 'param3')  -- replace with actual list of parametros
),

-- Find profiles associated with given parametros
profiles AS (
    SELECT perfil
    FROM tu_chile.tucl_online_chilecore_dbs.sauspf
    WHERE parametro IN (SELECT parametro FROM parametros)
),

-- Find rut and rut_dv associated with these profiles
ruts AS (
    SELECT rut, rut_dv
    FROM tu_chile.tucl_online_chilecore_dbs.sausua
    WHERE perfil IN (SELECT perfil FROM profiles)
),

-- Find nom_emp associated with these ruts and rut_dv
nom_emp_list AS (
    SELECT nom_emp, rut_cli, dv_cli
    FROM tu_chile.tucl_online_chilecore_dbs.saclie
    WHERE rut_cli IN (SELECT rut FROM ruts) AND dv_cli IN (SELECT rut_dv FROM ruts)
),

-- Ensure that nom_emp is associated with all given parametros
nom_emp_counts AS (
    SELECT ne.nom_emp, COUNT(DISTINCT p.parametro) as param_count
    FROM nom_emp_list ne
    JOIN tu_chile.tucl_online_chilecore_dbs.sausua su ON ne.rut_cli = su.rut AND ne.dv_cli = su.rut_dv
    JOIN tu_chile.tucl_online_chilecore_dbs.sauspf sp ON su.perfil = sp.perfil
    WHERE sp.parametro IN (SELECT parametro FROM parametros)
    GROUP BY ne.nom_emp
)

-- Final selection of nom_emp
SELECT nom_emp
FROM nom_emp_counts
WHERE param_count = (SELECT COUNT(DISTINCT parametro) FROM parametros);
