import * as cdk from 'aws-cdk-lib';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { HostedZone, ARecord, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import {
  Distribution,
  ViewerProtocolPolicy,
  CachePolicy,
  AllowedMethods,
} from 'aws-cdk-lib/aws-cloudfront';
import { S3StaticWebsiteOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { User, PolicyStatement, CfnAccessKey, Effect } from 'aws-cdk-lib/aws-iam';

// Define custom properties for the stack
interface S3WebsiteStackProps extends StackProps {
  domainName: string;
  username: string;
}

export class S3WebsiteIacStack extends Stack {
  constructor(scope: Construct, id: string, props: S3WebsiteStackProps) {
    super(scope, id, props);

    const { domainName, username } = props;

    // Create a certificate in ACM for the domain
    const certificate = new Certificate(this, 'WebsiteCertificate', {
      domainName: domainName,
      validation: CertificateValidation.fromDns(),
    });

    // Create an S3 bucket for the website
    const websiteBucket = new Bucket(this, 'WebsiteBucket', {
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'error.html',
      publicReadAccess: true, // Static website buckets must allow public read access
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Create a CloudFront distribution for the website
    const cloudFrontDistribution = new Distribution(this, 'WebsiteDistribution', {
      defaultBehavior: {
        origin: new S3StaticWebsiteOrigin(websiteBucket),
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD, // Static websites typically use GET/HEAD
        cachePolicy: CachePolicy.CACHING_OPTIMIZED,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      domainNames: [domainName],
      certificate: certificate,
    });

    // Look up the hosted zone
    const hostedZone = HostedZone.fromLookup(this, 'HostedZone', {
      domainName: domainName,
    });

    // Create a Route 53 A record to point to the CloudFront distribution
    new ARecord(this, 'WebsiteAliasRecord', {
      zone: hostedZone,
      recordName: domainName,
      target: RecordTarget.fromAlias(new CloudFrontTarget(cloudFrontDistribution)),
    });

    // Create a new IAM user
    const user = new User(this, 'UploadUser', {
      userName: username,
    });

    // Add permissions to the user
    user.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['s3:PutObject', 's3:GetObject', 's3:DeleteObject', 's3:ListBucket'],
        resources: [websiteBucket.bucketArn, `${websiteBucket.bucketArn}/*`],
      }),
    );

    user.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['cloudfront:CreateInvalidation'],
        resources: [`arn:aws:cloudfront::${this.account}:distribution/${cloudFrontDistribution.distributionId}`],
      }),
    );

    // Create access keys for the user
    const accessKey = new CfnAccessKey(this, 'AccessKey', {
      userName: user.userName,
    });

    // Output access key and secret
    new cdk.CfnOutput(this, 'BucketName', { value: websiteBucket.bucketName });
    new cdk.CfnOutput(this, 'DistroId', { value: cloudFrontDistribution.distributionId });
    new cdk.CfnOutput(this, 'AccessKeyId', { value: accessKey.ref });
    new cdk.CfnOutput(this, 'SecretAccessKey', { value: accessKey.attrSecretAccessKey });
  }
}
