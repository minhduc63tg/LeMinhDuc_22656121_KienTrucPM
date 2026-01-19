package demo.state;

public class CancelledOrderState implements OrderState {
    @Override
    public void handle(OrderContext context) {
        System.out.println("Hủy và hoàn tền");
    }

    @Override
    public String getName() {
        return "Hủy";
    }

    public static class NewOrderState implements OrderState{
        @Override
        public void handle(OrderContext context) {
            System.out.println("Kiểm tra thông tin đơn hàng...");
            context.setState(new ProcessingOrderState());
        }

        @Override
        public String getName() {
            return "MỚI TẠO";
        }
    }
}
