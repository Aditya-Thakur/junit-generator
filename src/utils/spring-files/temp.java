import java.util.HashMap;
import java.util.Map;

public class TemplateFinder {

    public static Map<String, String> getTemplateAndScoreId(String templateNames, String productCode) {
        Map<String, String> result = new HashMap<>();

        // Split the string by commas to get each product entry
        String[] entries = templateNames.split(",");

        for (String entry : entries) {
            // Split each entry by "~" to separate productCode, templateId, and scoreId
            String[] parts = entry.split("~");

            // Check if the first part matches the desired productCode
            if (parts[0].equals(productCode)) {
                result.put("TemplateId", parts[1]);
                result.put("ScoreId", parts[2]);
                return result;
            }
        }

        // Return an empty map if the productCode is not found
        return result;
    }

    public static void main(String[] args) {
        String templateNames = "TD~1024563~CLCV,MD~24764672~CLCV,RT~5765877~CLCV";
        String productCode = "TD";

        Map<String, String> templateData = getTemplateAndScoreId(templateNames, productCode);

        if (!templateData.isEmpty()) {
            System.out.println("TemplateId: " + templateData.get("TemplateId"));
            System.out.println("ScoreId: " + templateData.get("ScoreId"));
        } else {
            System.out.println("Product code not found.");
        }
    }
}
