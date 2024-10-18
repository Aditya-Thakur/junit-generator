import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProductSegmentViewService {

    @Autowired
    private ProductSegmentViewRepository productSegmentViewRepository;

    public List<ProductSegmentView> getAllProductSegments() {
        return productSegmentViewRepository.findAll();
    }
}
