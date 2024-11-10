using Imba.UI;

namespace Scr.Scripts.UI.View
{
    public class ScannerView : UIView
    {
        public void BtnBack()
        {
            Hide();
            UIManager.Instance.ViewManager.ShowView(UIViewName.MenuView);
        }
        public void FakeScanResult()
        {
            Hide();
            UIManager.Instance.ViewManager.ShowView(UIViewName.DetailView);
        }
        // DO QR CODE HERE
    }
}