using System.Collections;
using System.Collections.Generic;
using AYellowpaper.SerializedCollections;
using DG.Tweening;
using Imba.Audio;
using Imba.UI;
using Imba.Utils;
using Newtonsoft.Json;
using Scr.Scripts.Component;
using Scr.Scripts.UI.Popups;
using Scr.Scripts.UI.View;
using UnityEngine;
using Random = UnityEngine.Random;

namespace Scr.Scripts.GameScene
{
    public class GameController : ManualSingletonMono<GameController>
    {
        [Header("Config")]
        [SerializeField] private float playerMoveSpeed;

        [SerializeField] private float enemyMoveSpeed;

        [Header("AxieControl")]
        [SerializeField] private GameObject demoAxieGroup;

        [SerializeField] private GameObject selectingAxieGroup;
        [SerializeField] private GameObject currentSelectAxieModel;

        [SerializeField] private SerializedDictionary<string, GameObject> axieModelConfig;

        [SerializeField] private Transform playerTf;

        private CharacterAnimationController _characterAnimationController;
        private string                       _userAxieSelected;

        [Header("AxieEnemyControl")]
        [SerializeField] private Transform enemyPostion;

        [SerializeField] private Transform                    enemySpawnPostion;
        [SerializeField] private Transform                    enemyEndPostion;
        [SerializeField] private GameObject                   enemy;
        private                  CharacterAnimationController _characterEnemyAnimationController;

        [Header("GameCore")]
        [SerializeField] private TextAsset jsonQuestionData;

        private List<QuestionData> _questionData;

        private QuizView _quizView;
        private int      _correctAns      = 0;
        private int      _currentQuestion = 0;
        private int      _userHeart       = 3;

        private void Start()
        {
            UIManager.Instance.ViewManager.ShowView(UIViewName.MainView);
            _quizView = UIManager.Instance.ViewManager.GetViewByName<QuizView>(UIViewName.QuizView);
        }

        public void InitGame()
        {
            _userHeart = 3;
            _quizView.SetHealth(_userHeart);
            ConvertJsonToQuestionData(jsonQuestionData.text);
            ShuffleQuestionBank();
            DisplayQuestion(_currentQuestion);

            // TO MOVE
            if (axieModelConfig.TryGetValue(_userAxieSelected, out var modelAxie))
            {
                if (currentSelectAxieModel)
                {
                    SimplePool.Despawn(currentSelectAxieModel);
                }

                currentSelectAxieModel =
                    SimplePool.Spawn(modelAxie, playerTf.transform.position, Quaternion.identity);
                currentSelectAxieModel.transform.SetParent(playerTf.transform);
                currentSelectAxieModel.transform.localScale = Vector3.one * 0.5f;
                currentSelectAxieModel.transform.localRotation = Quaternion.identity;
                _characterAnimationController = currentSelectAxieModel.GetComponent<CharacterAnimationController>();
            }

            SpawnEnemyAxie();
            StartClock();
        }

        public void NextQuestion()
        {
            StartClock();
            SpawnEnemyAxie();
            _currentQuestion++;
            if (_userHeart == 0)
            {
                Debug.Log("END GAME: DEAD");
                EndGame();
                return;
            }

            if (_currentQuestion == _questionData.Count)
            {
                Debug.Log("END GAME");
                EndGame();
                return;
            }

            DisplayQuestion(_currentQuestion);
        }

        public void ConvertJsonToQuestionData(string rawJson)
        {
            _questionData = JsonConvert.DeserializeObject<List<QuestionData>>(rawJson);
        }

        public void ShuffleQuestionBank()
        {
            for (int i = _questionData.Count - 1; i > 0; i--)
            {
                int randomIndex = Random.Range(0, i + 1);
                (_questionData[i], _questionData[randomIndex]) = (_questionData[randomIndex], _questionData[i]);
            }
        }

        public void DisplayQuestion(int questionIndex)
        {
            _quizView.SetQuestionProcess(questionIndex + 1, _questionData.Count);
            var data = _questionData[questionIndex];
            _quizView.ShowQuestion(new()
            {
                question      = data.Question,
                answer1       = data.Options[0],
                answer2       = data.Options[1],
                answer3       = data.Options[2],
                answer4       = data.Options[3],
                correctAnswer = data.Options[data.Answer]
            });
        }

        public void ChooseWrongAnswer()
        {
            AudioManager.Instance.PlaySFX(AudioName.Click2);
            StartCoroutine(WrongAnsHandler());
        }

        public void ChooseCorrectAnswer()
        {
            AudioManager.Instance.PlaySFX(AudioName.PowerUpBright);
            StartCoroutine(CorrectAnsHandler());
        }

        public IEnumerator CorrectAnsHandler()
        {
            StopClock();
            _correctAns++;
            yield return new WaitForSeconds(1.5f);
            _quizView.HideQuestion();
            SetMovePlayer(true);

            // Move enemy 
            _characterEnemyAnimationController.SetAnimation(CharacterState.Walk, true);
            enemy.transform.DOMoveX(playerTf.position.x + 1.5f * playerMoveSpeed + 1f, 1.5f).SetEase(Ease.Linear);
            yield return new WaitForSeconds(1.5f);
            // PLAYER ATTACK
            _characterEnemyAnimationController.SetAnimation(CharacterState.Dead, false);
            SetMovePlayer(false);
            _characterAnimationController.SetAnimation(CharacterState.Attack, false);

            yield return new WaitForSeconds(0.5f);
            _characterEnemyAnimationController.SetAnimation(CharacterState.Walk, true);
            var tempEnemy = enemy;
            Destroy(tempEnemy);


            NextQuestion();
            yield return null;
        }

        public IEnumerator WrongAnsHandler()
        {
            StopClock();
            yield return new WaitForSeconds(1.5f);
            _quizView.HideQuestion();
            _userHeart--;
            _quizView.SetHealth(_userHeart);
            SetMovePlayer(true);

            // Move enemy 
            _characterEnemyAnimationController.SetAnimation(CharacterState.Walk, true);
            enemy.transform.DOMoveX(playerTf.position.x + 1.5f * playerMoveSpeed + 1f, 1.5f).SetEase(Ease.Linear);
            yield return new WaitForSeconds(1.5f);

            // ENEMY ATTACK
            _characterEnemyAnimationController.SetAnimation(CharacterState.Attack, false);
            SetMovePlayer(false);
            _characterAnimationController.SetAnimation(CharacterState.GotAttack, false);

            yield return new WaitForSeconds(0.5f);
            _characterEnemyAnimationController.SetAnimation(CharacterState.Walk, true);
            var tempEnemy = enemy;
            tempEnemy.transform.DOMoveX(enemyEndPostion.transform.position.x, 0.5f).SetEase(Ease.Linear)
                .OnComplete(() => { Destroy(tempEnemy); });


            NextQuestion();
            yield return null;
        }

        public void EndGame()
        {
            var earn = 0.1f * _correctAns;
            UIManager.Instance.PopupManager.ShowPopup(UIPopupName.EndGamePopup, new EndGameParam
            {
                tokenWin   = earn,
                correctAns = _correctAns,
                maxQuest   = _questionData.Count
            });
        }

        // VIEW FLOW //
        public void SetDemoAxieGroup(bool isActive)
        {
            demoAxieGroup.SetActive(isActive);
        }

        public void SetSelectingAxieGroup(bool isActive)
        {
            selectingAxieGroup.SetActive(isActive);
            if (!isActive)
            {
                if (currentSelectAxieModel)
                {
                    SimplePool.Despawn(currentSelectAxieModel);
                }
            }
        }

        public void SetSelectingAxie(string nameAxie)
        {
            _userAxieSelected = nameAxie;
            if (axieModelConfig.TryGetValue(nameAxie, out var modelAxie))
            {
                if (currentSelectAxieModel)
                {
                    SimplePool.Despawn(currentSelectAxieModel);
                }

                currentSelectAxieModel =
                    SimplePool.Spawn(modelAxie, selectingAxieGroup.transform.position, Quaternion.identity);
                currentSelectAxieModel.transform.SetParent(selectingAxieGroup.transform);
                currentSelectAxieModel.transform.localScale    = Vector3.one;
                currentSelectAxieModel.transform.localRotation = Quaternion.identity;
            }
            else
            {
                Debug.Log("NOT FOUND FOR: " + nameAxie);
            }
        }

        // Moving //
        public void SetMovePlayer(bool isMove)
        {
            isMoving = isMove;
            _characterAnimationController.SetAnimation(isMoving ? CharacterState.Walk : CharacterState.Idle, true);
        }

        public bool isMoving;

        private void Update()
        {
            if (isMoving)
            {
                var newPos = playerTf.transform.position;
                newPos.x                    += playerMoveSpeed * Time.deltaTime;
                playerTf.transform.position =  newPos;
            }
        }

        private IEnumerator _clockIe;

        private int quesTime = 60;
        private int _currentTime;

        public void StartClock()
        {
            if (_clockIe != null)
            {
                StopCoroutine(_clockIe);
            }

            _currentTime = quesTime;
            _clockIe     = Clocking();
            StartCoroutine(_clockIe);
        }

        public void StopClock()
        {
            if (_clockIe != null)
            {
                StopCoroutine(_clockIe);
            }
        }

        public IEnumerator Clocking()
        {
            while (_currentTime >= 0)
            {
                _quizView.SetClock(_currentTime);
                _currentTime--;
                yield return new WaitForSeconds(1);
                if (_currentTime == -1)
                {
                    _quizView.HideQuestion();
                    EndGame();
                }
            }
        }

        public void SpawnEnemyAxie()
        {
            // Get a random key from axieModelConfig dictionary
            var keys        = new List<string>(axieModelConfig.Keys);
            int randomIndex = Random.Range(0, keys.Count);
            var keyRd       = keys[randomIndex];

            // Proceed as usual to spawn the enemy Axie with the random selection
            if (axieModelConfig.TryGetValue(keyRd, out var modelAxie))
            {
                enemy = Instantiate(modelAxie, enemySpawnPostion.transform.position, Quaternion.identity);
                enemy.transform.localScale = Vector3.one * 0.5f;
                enemy.transform.localRotation = Quaternion.identity;

                _characterEnemyAnimationController = enemy.GetComponent<CharacterAnimationController>();
                _characterEnemyAnimationController.SetAnimation(CharacterState.Walk, true);

                enemy.transform.DOMove(enemyPostion.transform.position, 0.5f).OnComplete(() =>
                {
                    _characterEnemyAnimationController.SetAnimation(CharacterState.Idle, true);
                });
            }
        }

        public class QuestionData
        {
            public int          QuestionId { get; set; }
            public string       Question   { get; set; }
            public List<string> Options    { get; set; }
            public int          Answer     { get; set; }
        }
    }
}