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
# 20240703
当使用 Amazon Cognito 通过单点登录 (SSO) 成功登录 Argo Web UI 时，你需要配置 Kubernetes 的 RBAC (Role-Based Access Control) 来为通过 Cognito 登录的用户授权。这通常涉及到创建适当的 Kubernetes `ClusterRole` 和 `ClusterRoleBinding`，将这些角色绑定到通过 Cognito 验证的用户。

### 步骤 1: 创建 ClusterRole

首先，创建一个 `ClusterRole`，其中包括管理 Argo Workflows 所需的所有权限。这个角色应该包括对 Argo Workflows 资源、Pods、Logs 等的管理权限。

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: argo-full-access
rules:
- apiGroups: [""]
  resources: ["pods", "pods/log"]
  verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
- apiGroups: ["argoproj.io"]
  resources: ["workflows", "workflowtemplates", "cronworkflows", "workflows/finalizers"]
  verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
```

### 步骤 2: 创建 ClusterRoleBinding

接着，创建一个 `ClusterRoleBinding`，将上面创建的 `ClusterRole` 绑定到通过 Cognito 登录的用户。在 Kubernetes 中，你可能需要基于用户的身份信息（如用户名或用户的邮箱）来创建这个绑定。假设你已经有了用户的身份信息，比如他们的邮箱地址。

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: argo-full-access-binding
subjects:
- kind: User
  name: "user@example.com"  # 使用实际的 Cognito 用户识别信息
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: ClusterRole
  name: argo-full-access
  apiGroup: rbac.authorization.k8s.io
```

### 步骤 3: 配置 Argo Workflows 使用 OAuth2 + OIDC

确保 Argo Workflows 配置为使用 OAuth2 和 OIDC。你需要在 Argo 的配置中设置正确的认证参数，如下所示：

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: workflow-controller-configmap
  namespace: argo
data:
  config: |
    sso:
      issuer: https://cognito-idp.{region}.amazonaws.com/{userPoolId}
      clientId: {yourClientId}
      clientSecret: {yourClientSecret}
      redirectUrl: https://<your-argo-domain>/oauth2/callback
      scopes:
      - openid
      - profile
      - email
```

确保将 `{region}`, `{userPoolId}`, `{yourClientId}`, `{yourClientSecret}`, 和 `<your-argo-domain>` 替换成你的实际配置信息。

### 注意事项

- **同步用户信息**：确保 Kubernetes 中的用户名称与 Cognito 中的用户识别信息一致（例如，使用电子邮件地址作为用户名）。
- **安全性**：使用 HTTPS 和安全的客户端密钥管理策略，确保敏感信息的安全。
- **测试**：在生产环境中应用这些设置之前，在测试环境中验证配置。

通过这些步骤，你可以为通过 Cognito SSO 登录的用户配置和管理 Argo Workflows 的权限。