package bai1.state;

import bai1.state.OrderContext;

public interface OrderState {
    void handle(OrderContext context);
    String getName();
}
