package demo.state;

import demo.state.DeliveredOrderState;
import demo.state.OrderContext;
import demo.state.OrderState;

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
