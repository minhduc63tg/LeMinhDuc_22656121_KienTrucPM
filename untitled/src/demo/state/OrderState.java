package demo.state;

import demo.state.OrderContext;

public interface OrderState {
    void handle(OrderContext context);
    String getName();
}
