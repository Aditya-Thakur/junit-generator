import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class SaclieService {

    @Autowired
    private SaclieRepository saclieRepository;

    public List<String> getNomEmpByParametros(List<String> paramList) {
        return saclieRepository.findNomEmpByParametros(paramList);
    }
}
