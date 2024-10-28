import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import org.json.JSONObject;
import java.util.*;
import java.util.stream.Collectors;

public class ApiService {

    // Function to get the authentication token
    public String getAuthToken() {
        String url = "https://ping-dev.transunion.com/as/token.oauthligzant_type=client_credentials";
        
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.set("act_as", "Aditya");
        headers.set("Authorization", "Basic YXBwXzAwNDÄwX2FzbWJseWd3b25saW5L0*ZsRHo 4cGRaaG4yV2NQRFJBcVpRckpCa2NGeEdrazJ2MmRKoktTVU1tSnh2VWhESURyc3ptUOVraw82MUNyMко=");

        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

        if (response.getStatusCode() == HttpStatus.OK) {
            JSONObject jsonResponse = new JSONObject(response.getBody());
            return jsonResponse.getString("access_token");
        } else {
            throw new RuntimeException("Failed to fetch auth token");
        }
    }

    // Function to get segments and templates using the access token
    public Map<String, List<Map<String, String>>> getOrchData(String authToken) {
        String url = "http://localhost:9790/v1/getOrchData";
        
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(authToken);

        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

        if (response.getStatusCode() == HttpStatus.OK) {
            JSONObject jsonResponse = new JSONObject(response.getBody());
            List<Map<String, String>> segmentList = new ArrayList<>();
            List<Map<String, String>> templateList = new ArrayList<>();

            jsonResponse.getJSONArray("segmentList").forEach(segment -> {
                JSONObject seg = (JSONObject) segment;
                Map<String, String> segmentData = new HashMap<>();
                segmentData.put("productCode", seg.getString("productCode"));
                segmentData.put("productName", seg.getString("productName"));
                segmentData.put("segmentCode", seg.getString("segmentCode"));
                segmentData.put("segmentName", seg.getString("segmentName"));
                segmentList.add(segmentData);
            });

            jsonResponse.getJSONArray("templateList").forEach(template -> {
                JSONObject temp = (JSONObject) template;
                Map<String, String> templateData = new HashMap<>();
                templateData.put("productCode", temp.getString("productCode"));
                templateData.put("templateId", temp.getString("templateId"));
                templateData.put("scoreId", temp.getString("scoreId"));
                templateList.add(templateData);
            });

            Map<String, List<Map<String, String>>> resultMap = new HashMap<>();
            resultMap.put("segmentList", segmentList);
            resultMap.put("templateList", templateList);

            return resultMap;
        } else {
            throw new RuntimeException("Failed to fetch orchestration data");
        }
    }

    // Function to generate comma-separated string of segment names
    public String generateSegmentNames(List<Map<String, String>> segmentList) {
        return segmentList.stream()
                .map(segment -> segment.get("segmentName"))
                .collect(Collectors.joining(","));
    }

    public static void main(String[] args) {
        ApiService apiService = new ApiService();

        // Step 1: Get the auth token
        String authToken = apiService.getAuthToken();
        System.out.println("Auth Token: " + authToken);

        // Step 2: Get segments and templates
        Map<String, List<Map<String, String>>> orchData = apiService.getOrchData(authToken);
        List<Map<String, String>> segmentList = orchData.get("segmentList");
        List<Map<String, String>> templateList = orchData.get("templateList");

        // Step 3: Generate comma-separated segment names
        String segmentNames = apiService.generateSegmentNames(segmentList);
        System.out.println("Segment Names: " + segmentNames);
    }
}
