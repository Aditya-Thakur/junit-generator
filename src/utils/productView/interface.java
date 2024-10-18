import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductSegmentViewRepository extends JpaRepository<ProductSegmentView, String> {
    // JpaRepository provides the basic CRUD operations
}
