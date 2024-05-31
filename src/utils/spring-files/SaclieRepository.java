import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface SaclieRepository extends JpaRepository<Saclie, Long> {
    
    @Query(value = "WITH parametros AS ( "
                 + "SELECT DISTINCT parametro "
                 + "FROM tu_chile.tucl_online_chilecore_dbs.sauspf "
                 + "WHERE parametro IN :paramList), "
                 + "profiles AS ( "
                 + "SELECT perfil "
                 + "FROM tu_chile.tucl_online_chilecore_dbs.sauspf "
                 + "WHERE parametro IN (SELECT parametro FROM parametros)), "
                 + "ruts AS ( "
                 + "SELECT rut, rut_dv "
                 + "FROM tu_chile.tucl_online_chilecore_dbs.sausua "
                 + "WHERE perfil IN (SELECT perfil FROM profiles)), "
                 + "nom_emp_list AS ( "
                 + "SELECT nom_emp, rut_cli, dv_cli "
                 + "FROM tu_chile.tucl_online_chilecore_dbs.saclie "
                 + "WHERE rut_cli IN (SELECT rut FROM ruts) "
                 + "AND dv_cli IN (SELECT rut_dv FROM ruts)), "
                 + "nom_emp_counts AS ( "
                 + "SELECT ne.nom_emp, COUNT(DISTINCT sp.parametro) AS param_count "
                 + "FROM nom_emp_list ne "
                 + "JOIN tu_chile.tucl_online_chilecore_dbs.sausua su ON ne.rut_cli = su.rut "
                 + "AND ne.dv_cli = su.rut_dv "
                 + "JOIN tu_chile.tucl_online_chilecore_dbs.sauspf sp ON su.perfil = sp.perfil "
                 + "WHERE sp.parametro IN (SELECT parametro FROM parametros) "
                 + "GROUP BY ne.nom_emp) "
                 + "SELECT nom_emp "
                 + "FROM nom_emp_counts "
                 + "WHERE param_count = (SELECT COUNT(DISTINCT parametro) FROM parametros)", 
           nativeQuery = true)
    List<String> findNomEmpByParametros(@Param("paramList") List<String> paramList);
}
