package bai2.factoryMethod;

public class Truckfactory extends VehicleFactory {
    @Override
    public Vehicle createVehicle() {
        return new Truck();
    }
}
