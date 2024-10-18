import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Column;

@Entity
public class ProductSegmentView {

    @Id
    @Column(name = "ProductCode")
    private String productCode;

    @Column(name = "ProductName")
    private String productName;

    @Column(name = "SegmentCode")
    private Long segmentCode; // Assuming SegmentCode is of type Long (SegmentId)

    @Column(name = "SegmentName")
    private String segmentName;

    @Column(name = "ActiveFlag")
    private String activeFlag;

    // Getters and Setters
    // ...
}
