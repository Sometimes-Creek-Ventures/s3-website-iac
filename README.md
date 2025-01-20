# S3 Static Website with CloudFront

This project demonstrates how to set up a static website hosted on Amazon S3 with CloudFront for content delivery and Route 53 for DNS management. It includes an IAM user with specific permissions for deployment. The code is written using AWS CDK.

## Overview

In this project, you will:
1. Deploy an S3 bucket to host a static website.
2. Configure a CloudFront distribution for enhanced performance and SSL support.
3. Use Route 53 to map your domain to the CloudFront distribution.
4. Learn how to automate AWS infrastructure and deployment workflows.

---

## Prerequisites

Before you begin, ensure you have the following:
- An AWS account.
- Node.js and Yarn installed on your local machine.
- AWS CLI installed and configured.
- A registered domain name in Route 53, with AWS managing the DNS for your domain.
- Basic familiarity with TypeScript and GitHub Actions.

---

## Installing Yarn

Yarn is a package manager that makes it easier to manage dependencies for your project. To install Yarn:

1. Ensure you have Node.js installed. If not, download and install it from [nodejs.org](https://nodejs.org/).
2. Install Yarn using npm (Node's package manager):
   ```bash
   npm install --global yarn
   ```
3. Verify the installation by checking the Yarn version:
   ```bash
   yarn --version
   ```
   You should see a version number if the installation was successful.

---

## Configuring AWS Credentials for CDK

To deploy the AWS CDK stack, you need AWS credentials configured locally. Follow these steps to set up your AWS credentials:

1. **Install the AWS CLI:**
   If you haven’t already installed the AWS CLI, download and install it from [AWS CLI Installation Guide](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html).

2. **Configure AWS CLI:**
   Run the following command to configure your credentials:
   ```bash
   aws configure
   ```
   You will be prompted to provide:
   - AWS Access Key ID
   - AWS Secret Access Key
   - Default region (e.g., `us-east-1`)
   - Default output format (e.g., `json`)

   These credentials should match the account and region where you want to deploy the stack.

3. **Verify Credentials:**
   To ensure your credentials are correctly configured, run:
   ```bash
   aws sts get-caller-identity
   ```
   This will display the account and user details associated with your credentials.

Once configured, the AWS CDK will automatically use these credentials when deploying your stack.

---

## Creating an IAM User for Access Keys

If you need to create an IAM user to generate access keys for the AWS CLI and CDK:

1. **Log in to the AWS Management Console:**
   Navigate to the [IAM Console](https://console.aws.amazon.com/iam/).

2. **Create a New User:**
   - Go to **Users** > **Add Users**.
   - Enter a username (e.g., `CDKDeployUser`).
   - Select **Access Key - Programmatic Access**.

3. **Attach Policies to the User:**
   - Choose **Attach existing policies directly**.
   - Attach the following policies:
     - `AmazonS3FullAccess`
     - `CloudFrontFullAccess`
     - `Route53FullAccess`
     - `IAMUserChangePassword` (optional, for password resets).

4. **Complete User Creation:**
   - Click **Next** until the process is complete.
   - Download the **Access Key ID** and **Secret Access Key**.

5. **Store Credentials Securely:**
   - Use these credentials to configure the AWS CLI or add them as GitHub secrets for automated workflows.

---

## Project Structure

### Key Files
- **`lib/s3-website-iac-stack.ts`**: Defines the AWS infrastructure using AWS CDK.
- **`bin/s3-website-iac.ts`**: Entry point for the AWS CDK app.

---

## Deployment Instructions

### Step 1: Clone the Repository
```bash
git clone https://github.com/Sometimes-Creek-Ventures/s3-website-iac.git
cd s3-website-iac
```

### Step 2: Install Dependencies
Ensure you have `aws-cdk` and other required dependencies:
```bash
yarn install
```

### Step 3: Configure Environment Variables
Update `bin/s3-website-iac.ts` with your domain name, AWS account ID, and desired username:
```typescript
new S3WebsiteIacStack(app, 'MyWebsiteStack', {
  domainName: 'example.com',
  username: 'ExampleUser',
  env: {
    region: 'us-east-1',
    account: '123456789012',
  },
});
```

### Step 4: Deploy the Infrastructure
Run the AWS CDK deployment:
```bash
npx cdk deploy
```
This will:
- Create an S3 bucket for hosting.
- Set up a CloudFront distribution.
- Generate a Route 53 DNS record.
- Create an IAM user with necessary permissions.
- Output necessary credentials for deployment.

**Note:** During deployment, it may appear to hang when creating the certificate. This is because the process is waiting for domain validation. At this point, log in to the AWS Management Console, navigate to the **Certificate Manager**, and locate the certificate. Use the **"Add Records"** option to automatically add DNS validation records to your Route 53 hosted zone. Once the validation is complete and the certificate status changes to **"Issued"**, the deployment will continue as expected.

### Step 5: Configure GitHub Secrets
Go to your GitHub repository settings and add the following secrets:
- `AWS_ACCESS_KEY_ID`: Value from CDK output.
- `AWS_SECRET_ACCESS_KEY`: Value from CDK output.
- `AWS_S3_BUCKET_NAME`: S3 bucket name from CDK output.
- `AWS_CLOUDFRONT_DISTRIBUTION_ID`: CloudFront distribution ID from CDK output.
- `AWS_REGION`: AWS region, e.g., `us-east-1`.

---

## Key Concepts Explained

### Infrastructure as Code (IaC)
Using AWS CDK, you define AWS resources in TypeScript. This allows you to version control and automate the creation of infrastructure.

### Static Website Hosting
S3 serves static files (e.g., HTML, CSS, JS) with public read access. CloudFront caches these files globally, improving load times.

### DNS Management
Route 53 connects your domain name to your CloudFront distribution, ensuring your website is accessible via your custom domain.

---

## Learning Outcomes

By following this project, you will learn:
1. How to use AWS CDK to provision AWS resources.
2. How to host and deploy a static website on S3 with CloudFront and Route 53.
3. Best practices for securing AWS resources using IAM users and policies.

---

## Next Steps

1. Enhance your website by adding dynamic content or serverless functions.
2. Monitor and optimize your infrastructure using AWS CloudWatch and logs.
3. Experiment with additional AWS services like Lambda@Edge for advanced use cases.

---

## Troubleshooting

If you encounter any issues:
- Check the AWS CDK deployment logs for errors.
- Ensure your domain's DNS is correctly configured in Route 53.
- Verify your GitHub secrets are correctly set up.
- Use the AWS Management Console to inspect your resources.

---

## Contributing

Contributions are welcome! Feel free to submit pull requests or report issues.

---

## License

This project is licensed under the MIT License.
