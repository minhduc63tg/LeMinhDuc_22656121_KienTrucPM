package bai2.Abstractfactory;

public class Application {
    private Button button;
    private CheckBox checkBox;
    public Application(GUIFactory factory) {
        button = factory.createButton();
        checkBox = factory.createCheckBox();
    }
    public void render() {
        button.render();
        checkBox.render();
    }

}
