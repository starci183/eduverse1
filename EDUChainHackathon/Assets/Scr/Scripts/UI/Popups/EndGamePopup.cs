using Imba.UI;
using TMPro;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace Scr.Scripts.UI.Popups
{
    public class EndGameParam
    {
        public float tokenWin;
        public int correctAns;
        public int maxQuest;
    }
    public class EndGamePopup : UIPopup
    {
        [SerializeField] private TextMeshProUGUI correctAnsText;
        [SerializeField] private TextMeshProUGUI tokenWinText;
        protected override void OnShowing()
        {
            base.OnShowing();
            if (Parameter != null)
            {
                var pr = (EndGameParam)Parameter;
                tokenWinText.text   = pr.tokenWin.ToString("F2"); // Rounded to two decimal places
                correctAnsText.text = "Corrected: " + pr.correctAns + " of " + pr.maxQuest;
            }
        }

        protected override void OnShown()
        {
            base.OnShown();
           
        }

        public void ButtonClaim()
        {
            Hide();
            SceneManager.LoadScene("Scr/Scenes/GameScene");
        }
    }
}