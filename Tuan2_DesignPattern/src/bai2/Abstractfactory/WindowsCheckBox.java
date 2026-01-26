package bai2.Abstractfactory;

public class WindowsCheckBox implements CheckBox{
    @Override
    public void render() {
        System.out.println("Render window checkbox");
    }
}
