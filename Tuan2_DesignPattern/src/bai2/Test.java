package bai2;

import bai2.Abstractfactory.Application;
import bai2.Abstractfactory.GUIFactory;
import bai2.Abstractfactory.MACfactory;
import bai2.Abstractfactory.Windowfactory;
import bai2.factoryMethod.CarFactory;
import bai2.factoryMethod.MotorcycleFactory;
import bai2.factoryMethod.Truckfactory;
import bai2.factoryMethod.VehicleFactory;
import bai2.singleton.DBConnection;

public class Test {
    public static void main(String[] args) {
        System.out.println("=== SINGLETON PATTERN ===");
        DBConnection db1 = DBConnection.getInstance();
        DBConnection db2 = DBConnection.getInstance();
        System.out.println("db1 == db2: " + (db1 == db2)); // true
        db1.query("SELECT * FROM users");

        System.out.println("\n=== FACTORY METHOD PATTERN ===");
        VehicleFactory carFactory = new CarFactory();
        carFactory.deliverProduct();

        VehicleFactory motorcycleFactory = new MotorcycleFactory();
        motorcycleFactory.deliverProduct();

        VehicleFactory truckFactory = new Truckfactory();
        truckFactory.deliverProduct();

        System.out.println("\n=== ABSTRACT FACTORY PATTERN ===");
        System.out.println("Windows Application:");
        GUIFactory windowsFactory = new Windowfactory();
        Application windowsApp = new Application(windowsFactory);
        windowsApp.render();

        System.out.println("\nMac Application:");
        GUIFactory macFactory = new MACfactory();
        Application macApp = new Application(macFactory);
        macApp.render();
    }
}
