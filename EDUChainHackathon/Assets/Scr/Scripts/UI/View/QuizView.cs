using System.Collections.Generic;
using System.Linq;
using DG.Tweening;
using Imba.UI;
using Newtonsoft.Json;
using Scr.Scripts.GameScene;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace Scr.Scripts.UI.View
{
    public class QuizView : UIView
    {
        [Header("QUESTION GROUP")]
        [SerializeField] private GameObject questionContainer;

        [SerializeField] private CanvasGroup canvasQuestionGroup;

        [SerializeField] private TextMeshProUGUI       questionText;
        [SerializeField] private List<Image>           answerRender;
        [SerializeField] private List<TextMeshProUGUI> answerText;
        [SerializeField] private List<Button>          answerButton;
        [SerializeField] private Sprite                normalRender;
        [SerializeField] private Sprite                correctRender;
        [SerializeField] private Sprite                wrongRender;

        [Header("HEADER DATA GROUP")]
        [SerializeField] private List<Image> healthBarIc;

        [SerializeField] private Sprite          healthActive;
        [SerializeField] private Sprite          healthInActive;
        [SerializeField] private TextMeshProUGUI currentQuestionProcess;
        [SerializeField] private TextMeshProUGUI clockText;
        private                  QuestionData    _currentQuest;

        public void SetQuestionProcess(int currentQuest, int maxQuest)
        {
            currentQuestionProcess.text = "Questions: " + currentQuest + " of " + maxQuest;
        }

        public void SetClock(int currentTime)
        {
            clockText.text = currentTime.ToString();
        }

        public void SetHealth(int health)
        {
            for (int i = 0; i < healthBarIc.Count; i++)
            {
                if (i < health)
                {
                    healthBarIc[i].sprite = healthActive;
                }
                else
                {
                    healthBarIc[i].sprite = healthInActive;
                }
            }
        }

        public void HideQuestion()
        {
            canvasQuestionGroup.DOFade(0f, 0.2f).OnComplete(() =>
            {
                questionContainer.transform.localScale = Vector3.one;
            });
            questionContainer.transform.DOScale(0.2f, 0.2f).OnComplete(() =>
            {
                questionContainer.SetActive(false);
                questionContainer.transform.localScale = Vector3.one;
            });
        }

        public void ShowQuestion(QuestionData questionData)
        {
            Debug.Log(questionData.correctAnswer);
            questionContainer.SetActive(true);
            canvasQuestionGroup.alpha = 1f;
            foreach (var btn in answerButton)
            {
                btn.interactable = true;
            }

            foreach (var img in answerRender)
            {
                img.sprite = normalRender;
            }

            _currentQuest     = questionData;
            questionText.text = questionData.question;

            int[] indices = { 0, 1, 2, 3 };
            indices = indices.OrderBy(x => Random.value).ToArray();

            answerText[indices[0]].text = questionData.answer1;
            answerText[indices[1]].text = questionData.answer2;
            answerText[indices[2]].text = questionData.answer3;
            answerText[indices[3]].text = questionData.answer4;
        }

        public void ChooseAnswer(int index)
        {
            foreach (var btn in answerButton)
            {
                btn.interactable = false;
            }

            string selectedAnswer = answerText[index].text;

            if (selectedAnswer == _currentQuest.correctAnswer)
            {
                answerRender[index].sprite = correctRender;
                GameController.Instance.ChooseCorrectAnswer();
            }
            else
            {
                answerRender[index].sprite = wrongRender;
                int correctIndex = answerText.FindIndex(a => a.text == _currentQuest.correctAnswer);
                answerRender[correctIndex].sprite = correctRender;

                PlayScalerAnim(answerRender[correctIndex].transform);
                GameController.Instance.ChooseWrongAnswer();
            }
        }

        public void PlayScalerAnim(Transform targetTranform)
        {
            targetTranform.DOScale(1.1f, 0.2f)
                .OnComplete(() => { targetTranform.DOScale(1f, 0.1f).SetEase(Ease.Linear); }).SetEase(Ease.Linear);
        }
    }

    public class QuestionData
    {
        public string question;
        public string answer1;
        public string answer2;
        public string answer3;
        public string answer4;
        public string correctAnswer;
    }
}