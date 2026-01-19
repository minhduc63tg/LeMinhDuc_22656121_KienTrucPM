
package bai2.state;

public class ShippedOrderState implements OrderState {
    @Override
    public void handle(OrderContext context) {
        System.out.println("Order shipped → Completed");
        context.setState(new CompletedOrderState());
    }

    public String getStatus() {
        return "SHIPPED";
    }
}
