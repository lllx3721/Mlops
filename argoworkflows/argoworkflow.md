# argo-workflow
Argo Workflows is an open-source, containerized, cloud-native workflow project, primarily implemented through Kubernetes Custom Resource Definitions (CRDs).

- Each step of the workflow is a container.
- DAG/Step
- Run CI/CD pipelines on Kubernetes without complex software configurations.
- Easily run compute-intensive jobs for machine learning or data processing in a short amount of time.

# Install
With Helm and AWS CDK

- values.yaml
  - server
  - controller
  - etc
- configMap
  - Mainfest
- serect

目前在现场有两个小组，分别是de组和mlops环境组。目前大家都是每周出社两天，包括我在内。

虽然我是以de身份面试的，但是我不明白为什么把我分到了mlops组，目前mlops组一共有4个人，其中两人在博多，我和另一位正社员在台场。在4月底的时候，台场的同事告诉我其实只需要每周出社一天和大家见面就可以了。因此，最近我只出社一天，而不是两天。

然而，mlops组的环境搭建工作遇到了一些困难，他们希望我增加出社时间，加强交流，并支持台场的同事。

事实上，我和台场的同事几乎没有沟通。第一个原因是业务上信息问他几乎不知道，技术上代码也读不懂，工作里要用的知识几乎没有。我对他的support约等于他拿到任务后，我帮他做。我目前的工作涉及k8s、aws、argoworkflows等infra容器方面，和我之前的经验以及面试他们对我的告知信息有些脱节。因此，我对台场同事的支持有限。他们甚至说不清需求，几乎都是大概这样子吧，比如他们让我在k8s环境里安装argoworkflows的时候，没有告诉我任何信息，这是一款定制软件，权限设计，存储，使用对象，什么要求都没告诉我，我甚至告诉过他们k8s和docker我只有使用经验，argoworkflows我甚至不知道是什么，代码都写了好几个月了，都还没定要用什么语言，但是也没有要改的意思。

大部分现场同事的目前涉及到的技术水平都属于新手，大家似乎都是ds出生，似乎不太有程序员的经验，他们连将数据转换成json都还在学习调查尝试的阶段，属于边学边做。自从我加入项目以来，我一直在学习ts、cdk、k8s、docker、argoworkflow、oauth等技术知识。

沟通方式和磨合这几个月我都有努力，但可能是我沟通能力和技术能力都有限吧，虽然能完成自己的工作，停供分享一些自己的经验，但是带一个完全没有自学意愿的纯新人，我可能还是有点勉强了。

他们现在也意识到自己无法独立完成环境搭建工作，准备将mlops外包。具体情况我了解有限，但目前在工作上与我有沟通的社员都在博多，所以我暂时觉得增加出社时间对这个项目没有太大意义。如果这个项目还要继续，可以的话我希望可以保持每周只出社一天。