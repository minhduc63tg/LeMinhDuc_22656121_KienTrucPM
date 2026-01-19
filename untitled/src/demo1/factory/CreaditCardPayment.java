package demo2.singleton.factory;

public class CreaditCardPayment implements Payment{
    @Override
    public void pay(double amount) {
        System.out.println("Thanh toán"+ amount+ "by creadit");
    }
}
