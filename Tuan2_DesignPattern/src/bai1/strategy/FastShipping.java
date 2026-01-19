package bai1.strategy;

public class FastShipping implements ShippingStrategy{
    public void ship() {
        System.out.println("Vận chuyển nhanh (Express)");
    }
}
