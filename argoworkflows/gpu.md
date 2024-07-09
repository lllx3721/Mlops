在 Argo Workflows 中，`input.artifacts` 用于直接从外部存储（例如 S3）读取数据并传递到工作流步骤中。这允许您在工作流的不同步骤之间传递数据，而不需要手动下载和上传文件。下面是一个详细的示例，展示了如何使用 `input.artifacts` 直接从 S3 读取数据。

### Argo Workflow 模板示例

以下是一个完整的工作流模板示例，展示了如何使用 `input.artifacts` 从 S3 读取数据：

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: s3-artifacts-example-
spec:
  entrypoint: main
  serviceAccountName: argo-workflow-sa
  templates:
  - name: main
    steps:
    - - name: process-data
          template: process-data
          arguments:
            artifacts:
            - name: input-data
              from: s3://my-input-bucket/input-data.csv

  - name: process-data
    inputs:
      artifacts:
      - name: input-data
        path: /mnt/data/input-data.csv
        s3:
          endpoint: s3.amazonaws.com
          bucket: my-input-bucket
          key: input-data.csv
    container:
      image: python:3.8-slim
      command: [python, -c]
      args: [
        "
import pandas as pd
# 从输入文件加载数据
data = pd.read_csv('/mnt/data/input-data.csv')
# 简单处理：对所有列求平均值
result = data.mean()
# 保存结果到输出文件
result.to_csv('/mnt/data/output-data.csv', index=False)
"
      ]
    outputs:
      artifacts:
      - name: output-data
        path: /mnt/data/output-data.csv
        s3:
          endpoint: s3.amazonaws.com
          bucket: my-output-bucket
          key: output-data.csv
```

### 详细解释

1. **工作流配置**：
   - `generateName: s3-artifacts-example-`：定义工作流名称前缀。
   - `serviceAccountName: argo-workflow-sa`：使用已配置的 IRSA 服务账户。

2. **模板定义**：
   - `main`：工作流的入口模板，定义了步骤 `process-data`，其参数包括从 S3 获取的输入数据工件。
   - `process-data`：处理数据的模板。
     - `inputs.artifacts`：
       - 定义了一个名为 `input-data` 的工件，该工件从 S3 存储中读取数据，并将其挂载到容器内的 `/mnt/data/input-data.csv` 路径。
     - `container`：
       - 使用 `python:3.8-slim` 镜像。
       - `command` 和 `args`：运行一个 Python 脚本，该脚本读取 CSV 文件，计算每列的平均值，并将结果保存到 `/mnt/data/output-data.csv`。
     - `outputs.artifacts`：
       - 定义了一个名为 `output-data` 的工件，将处理后的数据保存到 S3 存储。

### 使用步骤

1. **配置 S3 访问权限**：
   - 确保已配置 IRSA，使 Argo Workflows 服务账户具有访问 S3 存储的权限。
   - 在 AWS IAM 控制台中，创建一个 IAM 角色，并附加具有 S3 访问权限的策略。
   - 将该 IAM 角色与 Argo Workflows 服务账户关联。

2. **定义工作流模板**：
   - 使用上述工作流模板，定义从 S3 读取数据、处理数据并将结果存储回 S3 的步骤。

3. **提交工作流**：
   - 使用 `kubectl` 或 Argo CLI 提交工作流：

     ```bash
     kubectl create -f s3-artifacts-example.yaml
     ```

通过这种配置，您可以轻松地从 S3 存储读取数据、处理数据并将结果存储回 S3。这种方法结合了 Argo Workflows 和 S3 的强大功能，实现了数据处理的自动化和高效管理。