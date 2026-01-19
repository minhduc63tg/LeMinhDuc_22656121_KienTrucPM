package bai1.state;

import bai1.state.DeliveredOrderState;
import bai1.state.OrderContext;
import bai1.state.OrderState;

public class ProcessingOrderState implements OrderState {
    @Override
    public void handle(OrderContext context) {
        System.out.println("Đóng gói và vận chuyển...");
        context.setState(new DeliveredOrderState());
    }

    @Override
    public String getName() {
        return "ĐANG XỬ LÝ";
    }
}
