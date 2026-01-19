package bai2.state;

public class PaidOrderState implements OrderState {
    @Override
    public void handle(OrderContext context) {
        System.out.println("Order is paid → Shipped");
        context.setState(new ShippedOrderState());
    }

    public String getStatus() {
        return "PAID";
    }
}

