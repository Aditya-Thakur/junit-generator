import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/nomEmp")
public class SaclieController {

    @Autowired
    private SaclieService saclieService;

    @PostMapping
    public List<ClientDetailsDTO> getClientDetailsByParametros(@RequestBody List<String> paramList) {
        return saclieService.getClientDetailsByParametros(paramList);
    }

    @PostMapping("/filtered")
    public List<ClientDetailsDTO> getFilteredClientDetailsByParametros(@RequestBody FilterRequest filterRequest) {
        return saclieService.getFilteredClientDetailsByParametros(filterRequest.getParamList(), filterRequest.getFilter());
    }
}
