package bai1.decorator;

public class BasicOrder implements Order {

    @Override
    public double getCost() {
        return 100;
    }

    @Override
    public String getDescription() {
        return "Đơn hàng cơ bản";
    }
}

