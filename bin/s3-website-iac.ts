import * as cdk from 'aws-cdk-lib';
import { S3WebsiteIacStack } from '../lib/s3-website-iac-stack';

const app = new cdk.App();

new S3WebsiteIacStack(app, 'MyWebsiteStack', {
  domainName: 'example.com',
  username: 'ExampleUser',
  env: {
    region: 'us-east-1',
    account: '123456789012',
  },
});
