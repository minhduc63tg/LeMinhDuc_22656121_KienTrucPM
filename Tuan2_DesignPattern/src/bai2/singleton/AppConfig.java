
package bai2.singleton;


public class AppConfig {

    private static AppConfig instance;

    private String appName;

    private AppConfig() {
        appName = "Order Demo System";
    }

    public static synchronized AppConfig getInstance() {
        if (instance == null) {
            instance = new AppConfig();
        }
        return instance;
    }

    public String getAppName() {
        return appName;
    }
}
