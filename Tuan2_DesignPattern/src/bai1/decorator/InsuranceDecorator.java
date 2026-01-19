package bai1.decorator;

public class InsuranceDecorator extends OrderDecorator{

    public InsuranceDecorator(Order order) {
        super(order);
    }

    @Override
    public double getCost() {
        return order.getCost()+30;
    }

    @Override
    public String getDescription() {
        return order.getDescription()+ " bảo hiểm";
    }
}
