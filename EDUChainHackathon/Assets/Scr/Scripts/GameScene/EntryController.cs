using UnityEngine;
using UnityEngine.SceneManagement;

namespace Scr.Scripts.GameScene
{
    public class EntryController : MonoBehaviour
    {
        [SerializeField] private GameObject serviceContainer;

        private void Awake()
        {
            DontDestroyOnLoad(serviceContainer);
        }

        private void Start()
        {
            SceneManager.LoadScene("Scr/Scenes/GameScene");
        }
    }
}