using Imba.UI;
using Scr.Scripts.GameScene;

namespace Scr.Scripts.UI.View
{
    public class MenuView : UIView
    {
        protected override void OnShown()
        {
            base.OnShown();
            OnClickChar("Allue");
            
        }

        public void BTN_Setting()
        {
            UIManager.Instance.PopupManager.ShowPopup(UIPopupName.SettingPopup);
        }

        public void BtnPlay()
        {
            Hide();
            GameController.Instance.SetSelectingAxieGroup(false);
            GameController.Instance.InitGame();
            UIManager.Instance.ViewManager.ShowView(UIViewName.QuizView);
        }

        public void BtnEndGame()
        {
            Hide();
            GameController.Instance.SetDemoAxieGroup(true);
            GameController.Instance.SetSelectingAxieGroup(false);
            UIManager.Instance.ViewManager.ShowView(UIViewName.MainView);
        }
        public void OnClickChar(string nameAxie)
        {
            GameController.Instance.SetSelectingAxie(nameAxie);
        }
    }
}