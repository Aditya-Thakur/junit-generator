import java.util.List;

public class FilterRequest {
    private List<String> paramList;
    private String filter;

    // Getters and Setters
    public List<String> getParamList() {
        return paramList;
    }

    public void setParamList(List<String> paramList) {
        this.paramList = paramList;
    }

    public String getFilter() {
        return filter;
    }

    public void setFilter(String filter) {
        this.filter = filter;
    }
}
