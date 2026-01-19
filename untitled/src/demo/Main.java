package demo;

import demo.decorator.BasicOrder;
import demo.decorator.GiftWrapDecorator;
import demo.decorator.InsuranceDecorator;
import demo.decorator.Order;
import demo.state.OrderContext;
import demo.strategy.FastShipping;
import demo.strategy.ShippingContext;

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
