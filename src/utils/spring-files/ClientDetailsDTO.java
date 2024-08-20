public class ClientDetailsDTO {
    private String rut;
    private String dv;
    private String clientName;

    public ClientDetailsDTO(String rut, String dv, String clientName) {
        this.rut = rut;
        this.dv = dv;
        this.clientName = clientName;
    }

    // Getters and Setters
    public String getRut() {
        return rut;
    }

    public void setRut(String rut) {
        this.rut = rut;
    }

    public String getDv() {
        return dv;
    }

    public void setDv(String dv) {
        this.dv = dv;
    }

    public String getClientName() {
        return clientName;
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
    }
}
