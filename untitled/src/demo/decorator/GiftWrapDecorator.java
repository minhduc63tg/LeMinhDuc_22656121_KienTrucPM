package demo.decorator;

public class GiftWrapDecorator extends OrderDecorator{

    public GiftWrapDecorator(Order order) {
        super(order);
    }

    @Override
    public double getCost() {
        return order.getCost()+20;
    }

    @Override
    public String getDescription() {
        return order.getDescription()+ " Gói quà";
    }
}
