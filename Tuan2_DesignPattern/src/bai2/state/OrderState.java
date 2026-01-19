package bai2.state;


public interface OrderState {
    void handle(OrderContext context);
    String getStatus();
}
