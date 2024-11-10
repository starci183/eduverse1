using System;
using System.Collections.Generic;
using UnityEngine;

namespace Scr.Scripts.GameScene
{
    public class RandomCloudController : MonoBehaviour
    {
        [SerializeField] private Transform       mainCamera;
        [SerializeField] private Transform       cloudContainer;
        [SerializeField] private List<Transform> cloudTransform;
        [SerializeField] private Transform       startPos;
        [SerializeField] private Transform       endPos;
        [SerializeField] private float           moveSpeed;

        private void LateUpdate()
        {
            var newPos = mainCamera.position;
            newPos.z                          = 0f;
            cloudContainer.transform.position = newPos;

            foreach (var cloud in cloudTransform)
            {
                var temp = cloud.position;
                temp.x         -= moveSpeed * Time.deltaTime;
                cloud.position =  temp;
                if (cloud.position.x <= endPos.position.x)
                {
                    cloud.position = startPos.transform.position;
                }
            }
        }
    }
}