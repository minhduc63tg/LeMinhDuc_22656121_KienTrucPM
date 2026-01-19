package bai1.state;

public class DeliveredOrderState implements OrderState {
    @Override
    public void handle(OrderContext context) {
        System.out.println("Đơn hàng đã giao thành công.");
    }

    @Override
    public String getName() {
        return "ĐÃ GIAO";
    }
}

