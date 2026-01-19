package bai1;

import bai1.decorator.BasicOrder;
import bai1.decorator.GiftWrapDecorator;
import bai1.decorator.InsuranceDecorator;
import bai1.decorator.Order;
import bai1.state.OrderContext;
import bai1.strategy.FastShipping;
import bai1.strategy.ShippingContext;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== STATE ===");
        OrderContext order = new OrderContext();
        order.next();
        order.next();

        System.out.println("\n=== STRATEGY ===");
        ShippingContext shipping = new ShippingContext();
        shipping.setStrategy(new FastShipping());
        shipping.execute();

        System.out.println("\n=== DECORATOR ===");
        Order decoratedOrder = new InsuranceDecorator(
                new GiftWrapDecorator(
                        new BasicOrder()));
        System.out.println(decoratedOrder.getDescription());
        System.out.println("Tổng tiền: " + decoratedOrder.getCost());

        System.out.println("\n=== HỦY ĐƠN ===");
        order.cancel();
    }
}
