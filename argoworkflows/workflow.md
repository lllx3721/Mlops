在使用 Argo Workflows 时，模版是定义和执行任务的基础。以下是一些常见的 Argo Workflow 模版及其用途：

### 1. **容器模版 (Container Template)**
容器模版是最基础的模版，用于定义在容器中运行的任务。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: container-example-
spec:
  entrypoint: simple-container
  templates:
  - name: simple-container
    container:
      image: alpine:3.7
      command: ["echo", "hello world"]
```

### 2. **脚本模版 (Script Template)**
脚本模版允许用户直接在工作流定义中编写和运行脚本。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: script-example-
spec:
  entrypoint: simple-script
  templates:
  - name: simple-script
    script:
      image: python:3.8
      command: [python]
      source: |
        print("hello world")
```

### 3. **步骤模版 (Steps Template)**
步骤模版用于定义多个依赖的步骤，按顺序执行。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: steps-example-
spec:
  entrypoint: step-by-step
  templates:
  - name: step-by-step
    steps:
    - - name: step1
        template: echo
        arguments:
          parameters:
          - name: message
            value: "This is step 1"
    - - name: step2
        template: echo
        arguments:
          parameters:
          - name: message
            value: "This is step 2"
  - name: echo
    inputs:
      parameters:
      - name: message
    container:
      image: alpine:3.7
      command: [echo, "{{inputs.parameters.message}}"]
```

### 4. **DAG 模版 (DAG Template)**
DAG 模版用于定义有向无环图结构的任务依赖。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: dag-example-
spec:
  entrypoint: dag
  templates:
  - name: dag
    dag:
      tasks:
      - name: A
        template: echo
        arguments:
          parameters:
          - name: message
            value: "A"
      - name: B
        template: echo
        dependencies: [A]
        arguments:
          parameters:
          - name: message
            value: "B"
  - name: echo
    inputs:
      parameters:
      - name: message
    container:
      image: alpine:3.7
      command: [echo, "{{inputs.parameters.message}}"]
```

### 5. **参数化模版 (Parameterization Template)**
参数化模版允许在运行时传递参数，从而提高模版的复用性。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: parameter-example-
spec:
  entrypoint: parameterized-container
  arguments:
    parameters:
    - name: message
      value: "hello world"
  templates:
  - name: parameterized-container
    inputs:
      parameters:
      - name: message
    container:
      image: alpine:3.7
      command: [echo, "{{inputs.parameters.message}}"]
```

### 6. **循环模版 (Loops Template)**
循环模版允许重复执行任务，可以用于批量处理。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: loops-example-
spec:
  entrypoint: loop-example
  templates:
  - name: loop-example
    steps:
    - - name: generate
        template: generate
    - - name: print-message
        template: print-message
        arguments:
          parameters:
          - name: message
            value: "{{item}}"
        withParam: "{{steps.generate.outputs.result}}"
  - name: generate
    container:
      image: alpine:3.7
      command: [sh, -c]
      args: ["echo '[\"hello\", \"world\"]'"]
  - name: print-message
    inputs:
      parameters:
      - name: message
    container:
      image: alpine:3.7
      command: [echo, "{{inputs.parameters.message}}"]
```

### 7. **条件模版 (Conditions Template)**
条件模版允许根据条件执行不同的任务。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: conditional-example-
spec:
  entrypoint: conditional-steps
  templates:
  - name: conditional-steps
    steps:
    - - name: step1
        template: echo
        arguments:
          parameters:
          - name: message
            value: "This is step 1"
    - - name: condition
        template: conditional
        arguments:
          parameters:
          - name: condition
            value: "{{steps.step1.outputs.result}}"
  - name: echo
    inputs:
      parameters:
      - name: message
    container:
      image: alpine:3.7
      command: [sh, -c]
      args: ["echo '{{inputs.parameters.message}}'"]
  - name: conditional
    inputs:
      parameters:
      - name: condition
    steps:
    - - name: true-step
        template: echo
        when: "{{inputs.parameters.condition}} == 'true'"
        arguments:
          parameters:
          - name: message
            value: "Condition is true"
    - - name: false-step
        template: echo
        when: "{{inputs.parameters.condition}} == 'false'"
        arguments:
          parameters:
          - name: message
            value: "Condition is false"
```

### 参考

- [Argo Workflows 官方文档](https://argoproj.github.io/argo-workflows/)
- [Argo Workflows 示例](https://github.com/argoproj/argo-workflows/tree/master/examples)

通过这些模版示例，您可以了解如何在 Argo Workflows 中定义和执行不同类型的任务。根据具体需求选择适合的模版类型，可以有效地实现工作流的自动化和管理。