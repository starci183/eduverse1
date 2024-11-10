using Imba.UI;

namespace Scr.Scripts.UI.View
{
    public class DetailView : UIView
    {
        public void BtnBack()
        {
            Hide();
            UIManager.Instance.ViewManager.ShowView(UIViewName.MenuView);
        }
    }
}