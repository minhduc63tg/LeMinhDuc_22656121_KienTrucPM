package bai1.strategy;

public class StandardShipping implements ShippingStrategy{
    @Override
    public void ship() {
        System.out.println("vận chuyển tiêu chuẩn");
    }
}
