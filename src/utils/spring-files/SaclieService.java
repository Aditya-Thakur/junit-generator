import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SaclieService {

    @Autowired
    private SaclieRepository saclieRepository;

    public List<ClientDetailsDTO> getClientDetailsByParametros(List<String> paramList) {
        List<Object[]> results = saclieRepository.findClientDetailsByParametros(paramList);
        return results.stream()
                      .map(result -> new ClientDetailsDTO(
                              (String) result[1], // rut
                              (String) result[2], // dv
                              (String) result[0]  // clientName
                      ))
                      .collect(Collectors.toList());
    }

    public List<ClientDetailsDTO> getFilteredClientDetailsByParametros(List<String> paramList, String filter) {
        List<ClientDetailsDTO> clientDetails = getClientDetailsByParametros(paramList);
        return clientDetails.stream()
                            .filter(client -> client.getClientName().toLowerCase().contains(filter.toLowerCase()))
                            .collect(Collectors.toList());
    }
}
