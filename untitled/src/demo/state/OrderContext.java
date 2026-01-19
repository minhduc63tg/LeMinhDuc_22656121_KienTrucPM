package demo.state;

public class OrderContext {

    private OrderState state;

    public OrderContext() {
        this.state = new CancelledOrderState.NewOrderState();
    }

    public void setState(OrderState state) {
        this.state = state;
        System.out.println("Trạng thái hiện tại: " + state.getName());
    }

    public void next() {
        state.handle(this);
    }

    public void cancel() {
        setState(new CancelledOrderState());
        state.handle(this);
    }
}
