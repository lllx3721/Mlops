apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: gpu-example-
spec:
  entrypoint: gpu-container
  templates:
  - name: gpu-container
    container:
      image: tensorflow/tensorflow:latest-gpu
      command: [sh, -c]
      args: ["nvidia-smi && python -c 'import tensorflow as tf; print(tf.reduce_sum(tf.random.normal([1000, 1000])))'"]
      resources:
        requests:
          memory: "4Gi"
          cpu: "2"
          nvidia.com/gpu: "1"  # 请求 1 个 GPU
        limits:
          memory: "4Gi"
          cpu: "2"
          nvidia.com/gpu: "1"  # 限制使用 1 个 GPU

kubectl apply -f https://raw.githubusercontent.com/NVIDIA/k8s-device-plugin/v0.9.0/nvidia-device-plugin.yml

