import * as cdk from '@aws-cdk/core';
import * as cognito from '@aws-cdk/aws-cognito';
import * as iam from '@aws-cdk/aws-iam';
import * as eks from '@aws-cdk/aws-eks';

export class MyCognitoEksStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 创建 Cognito 用户池
    const userPool = new cognito.UserPool(this, 'MyUserPool', {
      selfSignUpEnabled: true,
      userVerification: {
        emailSubject: 'Verify your email!',
        emailBody: 'Thanks for signing up! Your verification code is {####}',
        emailStyle: cognito.VerificationEmailStyle.CODE
      },
      signInAliases: {
        email: true
      }
    });

    // 创建 Cognito 用户池客户端
    const userPoolClient = new cognito.UserPoolClient(this, 'AppClient', {
      userPool,
      authFlows: {
        userPassword: true,
        userSrp: true
      }
    });

    // 创建 Cognito 身份池
    const identityPool = new cognito.CfnIdentityPool(this, 'MyIdentityPool', {
      allowUnauthenticatedIdentities: false,
      cognitoIdentityProviders: [{
        clientId: userPoolClient.userPoolClientId,
        providerName: userPool.userPoolProviderName,
      }]
    });

    // 创建 IAM 角色并与身份池关联
    const authenticatedRole = new iam.Role(this, 'AuthenticatedRole', {
      assumedBy: new iam.FederatedPrincipal('cognito-identity.amazonaws.com', {
        "StringEquals": { "cognito-identity.amazonaws.com:aud": identityPool.ref },
        "ForAnyValue:StringLike": { "cognito-identity.amazonaws.com:amr": "authenticated" }
      }, "sts:AssumeRoleWithWebIdentity")
    });

    // 给角色添加策略
    authenticatedRole.addToPolicy(new iam.PolicyStatement({
      actions: ['s3:ListBucket'],
      resources: ['arn:aws:s3:::example-bucket']
    }));

    // 创建 EKS 集群（简化示例，实际部署可能需要更复杂的配置）
    const cluster = new eks.Cluster(this, 'MyCluster', {
      version: eks.KubernetesVersion.V1_21
    });

    // 示例：配置 Kubernetes RBAC 相关资源（此代码片段需实际部署到 EKS 集群中）
    // 这部分通常需要通过外部脚本或在 EKS 集群启动后配置
  }
}

const app = new cdk.App();
new MyCognitoEksStack(app, 'MyCognitoEksStack');
