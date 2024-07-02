为了利用 AWS Cognito SSO 登录 Argo Workflows 并设置适当的 RBAC（基于角色的访问控制），你需要进行以下配置。假设 EKS 已经配置好，Argo Workflows 也已安装并能够通过 Cognito 进行 SSO 登录。

### 1. 配置 RBAC

你需要为 Argo Workflows 创建适当的角色、角色绑定和服务账户，以确保用户可以根据他们的权限访问和操作 Argo Workflows。

#### 创建命名空间

如果还没有专用的命名空间，可以创建一个：

```bash
kubectl create namespace argo
```

#### 配置角色和角色绑定

你需要为不同的用户组配置不同的角色和角色绑定。以下是一个示例，如何为 Argo Workflows 配置角色和角色绑定。

**role.yaml**

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: argo
  name: argo-workflows-role
rules:
  - apiGroups: ["argoproj.io"]
    resources: ["workflows", "workflowtemplates", "cronworkflows"]
    verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
```

**rolebinding.yaml**

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  namespace: argo
  name: argo-workflows-rolebinding
subjects:
  - kind: Group
    name: "cognito-users-group"  # 替换为你的 Cognito 用户组
    apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: argo-workflows-role
  apiGroup: rbac.authorization.k8s.io
```

### 2. 配置 Service Account

为 Argo Workflows 配置服务账户，并将其绑定到适当的角色。

**serviceaccount.yaml**

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: argo-workflows-sa
  namespace: argo
```

**rolebinding-serviceaccount.yaml**

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: argo-workflows-sa-binding
  namespace: argo
subjects:
  - kind: ServiceAccount
    name: argo-workflows-sa
    namespace: argo
roleRef:
  kind: Role
  name: argo-workflows-role
  apiGroup: rbac.authorization.k8s.io
```

### 3. 配置 Argo Workflows 的 OAuth2 代理

配置 Argo Workflows 使用 OAuth2 代理进行 SSO 认证。确保你已经设置好了 Cognito 和 OAuth2 代理，并将其集成到 Argo Workflows 中。

**argoworkflows-oauth2-config.yaml**

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ConfigMap
metadata:
  name: workflow-controller-configmap
  namespace: argo
data:
  config: |
    executor:
      serviceAccountName: argo-workflows-sa
    containerRuntimeExecutor: emissary
    sso:
      issuer: https://<your-cognito-domain>/oauth2/default
      clientId: <your-client-id>
      clientSecret:
        name: <your-client-secret-name>
        key: <your-client-secret-key>
      redirectUrl: https://<your-argo-domain>/oauth2/callback
      scopes:
        - openid
        - profile
        - email
      rbac:
        enabled: true
        adminPolicy: |
          p, admin, *, *, *, allow
        userPolicy: |
          p, user, workflows, get, *, allow
          p, user, workflows, list, *, allow
          p, user, workflows, create, *, allow
          p, user, workflows, delete, *, allow
        groupsClaim: "cognito:groups"
        userIdClaim: "email"
```

### 4. 配置 Argo Workflows 部署

确保你的 Argo Workflows 部署引用了上述配置。

**argo-workflows-deployment.yaml**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: argo-workflows
  namespace: argo
spec:
  replicas: 1
  selector:
    matchLabels:
      app: argo-workflows
  template:
    metadata:
      labels:
        app: argo-workflows
    spec:
      serviceAccountName: argo-workflows-sa
      containers:
        - name: argo-workflows
          image: argoproj/workflow-controller:v3.1.8
          ports:
            - containerPort: 2746
          env:
            - name: ARGO_NAMESPACE
              valueFrom:
                fieldRef:
                  fieldPath: metadata.namespace
            - name: ARGO_CONFIGMAP
              value: workflow-controller-configmap
```

### 5. 应用所有配置

将上述 YAML 文件应用到你的 Kubernetes 集群中：

```bash
kubectl apply -f role.yaml
kubectl apply -f rolebinding.yaml
kubectl apply -f serviceaccount.yaml
kubectl apply -f rolebinding-serviceaccount.yaml
kubectl apply -f argoworkflows-oauth2-config.yaml
kubectl apply -f argo-workflows-deployment.yaml
```

通过这些步骤，你应该可以配置 Argo Workflows 使用 AWS Cognito SSO 进行登录，并设置适当的 RBAC、Service Account 和其他相关配置。