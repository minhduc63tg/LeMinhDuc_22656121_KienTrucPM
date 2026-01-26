
package bai2.singleton;


public class DBConnection {

    private static DBConnection instance;
    private String connectionString;



    private DBConnection() {
        connectionString = "Connected to Database";
        System.out.println("Khởi tạo Database Connection");
    }

    public static synchronized DBConnection getInstance() {
        if (instance == null) {
            instance = new DBConnection();
        }
        return instance;
    }

    public void query(String sql) {
        System.out.println("Thực thi: " + sql);
    }


}
