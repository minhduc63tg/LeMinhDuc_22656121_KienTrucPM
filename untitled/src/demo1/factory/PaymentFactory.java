package demo2.singleton.factory;

public class PaymentFactory {
    public static Payment createPayment(String type){
        switch (type){
            case "CREADIT":
                return new CreaditCardPayment();
            case  "PAYPAL":
                return new PaypalPayment();

            default:
                throw new IllegalArgumentException("nooooooooooooo");

        }
    }
}
