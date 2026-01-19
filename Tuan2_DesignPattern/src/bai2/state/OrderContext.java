package bai2.state;

public class OrderContext {
    private OrderState state;

    public OrderContext() {
        state = new NewOrderState();
    }

    public void setState(OrderState state) {
        this.state = state;
    }

    public void next() {
        state.handle(this);
    }

    public String getStatus() {
        return state.getStatus();
    }
}
