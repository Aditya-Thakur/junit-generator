import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
public class ProductSegmentController {

    @Autowired
    private ProductSegmentViewService productSegmentViewService;

    @GetMapping("/product-segments")
    public List<ProductSegmentView> getAllProductSegments() {
        return productSegmentViewService.getAllProductSegments();
    }
}
