
package bai2.state;


public class NewOrderState implements OrderState {
    @Override
    public void handle(OrderContext context) {
        System.out.println("Order is new → Paid");
        context.setState(new PaidOrderState());
    }

    public String getStatus() {
        return "NEW";
    }
}
