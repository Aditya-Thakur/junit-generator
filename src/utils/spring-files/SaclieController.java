import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
public class SaclieController {

    @Autowired
    private SaclieService saclieService;

    @GetMapping("/nomEmp")
    public List<String> getNomEmpByParametros(@RequestParam List<String> paramList) {
        return saclieService.getNomEmpByParametros(paramList);
    }
}
