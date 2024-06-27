要允许用户修改 Argo Workflows 的参数而不改变工作流模板，你可以利用 Argo Workflows 的特性来设计和实施相应的权限控制。这通常涉及到以下几个步骤：

### 1. 分离模板和参数

**使用 WorkflowTemplates 或 ClusterWorkflowTemplates**：首先确保工作流模板和实际启动的工作流实例（即参数）是分开的。这意味着模板包含所有的步骤和逻辑，而实际运行时的参数可以在启动工作流实例时外部提供。

例如，工作流模板可能如下所示：

```yaml
apiVersion: argoproj.io/v1alpha1
kind: WorkflowTemplate
metadata:
  name: my-template
  namespace: argo
spec:
  entrypoint: process
  arguments:
    parameters:
    - name: image
      value: "ubuntu:latest"  # 默认值
  templates:
  - name: process
    inputs:
      parameters:
      - name: image
    container:
      image: "{{inputs.parameters.image}}"
      command: [sh, -c]
      args: ["echo Hello World"]
```

### 2. 允许用户在运行时提供参数

**启动工作流实例时传递参数**：用户可以在使用 `Workflow` 或通过 API 提交时修改参数。例如，使用 `argo submit` 命令时，可以覆盖参数：

```bash
argo submit --from workflowtemplate/my-template -p image=alpine:latest
```

这样，用户不需要修改工作流模板就可以控制工作流的行为。

### 3. 设置适当的 RBAC 权限

**配置 Role 和 RoleBinding**：如前所述，你可以创建相应的 `Role` 和 `RoleBinding` 来限制用户只能提交工作流实例，而不是修改 `WorkflowTemplate`。

创建一个 Role 允许用户创建工作流实例：

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: argo
  name: workflow-submitter
rules:
- apiGroups: ["argoproj.io"]
  resources: ["workflows"]
  verbs: ["create", "delete", "get", "list", "watch", "update"]  # 允许提交和管理自己的工作流
```

绑定这个角色到特定用户或组：

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: workflow-submitter-binding
  namespace: argo
subjects:
- kind: User
  name: "jane.doe@example.com"
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: workflow-submitter
  apiGroup: rbac.authorization.k8s.io
```

### 4. 教育和文档

确保用户明白他们可以在提交工作流时自定义参数，而不需要更改底层的 `WorkflowTemplate`。提供文档和例子可以帮助用户理解如何操作。

这种方法确保了工作流模板的完整性和一致性，同时提供了足够的灵活性让用户根据自己的需求调整参数。
