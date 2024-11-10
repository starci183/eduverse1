using Imba.UI;
using Scr.Scripts.GameScene;

namespace Scr.Scripts.UI.View
{
    public class MainView : UIView
    {
        protected override void OnShown()
        {
            base.OnShown();
            GameController.Instance.SetDemoAxieGroup(true);
        }

        public void BTN_Setting()
        {
            UIManager.Instance.PopupManager.ShowPopup(UIPopupName.SettingPopup);
        }

        public void BtnStart()
        {
            GameController.Instance.SetDemoAxieGroup(false);
            GameController.Instance.SetSelectingAxieGroup(true);
            Hide();
            UIManager.Instance.ViewManager.ShowView(UIViewName.MenuView);
        }

        public void BtnRule()
        {
            UIManager.Instance.PopupManager.ShowPopup(UIPopupName.RulePopup);
        }
    }
}