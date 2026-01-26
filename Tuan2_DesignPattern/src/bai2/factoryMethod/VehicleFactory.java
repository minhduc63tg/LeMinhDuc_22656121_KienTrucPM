package bai2.factoryMethod;

public abstract class VehicleFactory {
    public abstract Vehicle createVehicle();

    // Template method sử dụng Factory Method
    public void deliverProduct() {
        Vehicle vehicle = createVehicle();
        System.out.println("Chuẩn bị giao hàng...");
        vehicle.drive();
    }
}
