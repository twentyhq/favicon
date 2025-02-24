<br>

<h1 align="center" >Open-source favicon provider</h3>
<p align="center">brought to you by the <a href="https://www.twenty.com">Twenty</a> team.</p>
<br />

<p align="center">
  <a href="https://www.twenty.com">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/twentyhq/favicon/main/docs/cover-dark.png">
      <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/twentyhq/favicon/main/docs/cover-light.png">
      <img src="./docs/static/img/preview-light.png" alt="Companies view" />
    </picture>
  </a>
</p>

## Usage

Looking for a company logo? Just fetch it from [https://twenty-icons.com/airbnb.com](https://twenty-icons.com/airbnb.com)
For example, if you're looking to display the Apple logo on your website, you can use: `<img src="https://twenty-icons.com/apple.com" alt="Logo" />`

You can also specify a size with an optional parameter [https://twenty-icons.com/github.com/128](https://twenty-icons.com/github.com/128).
We support and store `[16x16, 32x32, 64x64, 128x128, 180x180, 192x192]` sizes.
If no size is specified, the highest available supported size will be used.

If a domain does not have a favicon, you can **force a placeholder favicon** by adding `?withFallbackPlaceholder=true` to the URL.
For example, if you're looking to display a placeholder favicon for `example.com`, you can use
<img src="https://twenty-icons.com/example.com/64?withFallbackPlaceholder=true" alt="Favicon" />

## Example

There are many other use-cases, mostly for B2B companies.
For example if you are a SaaS you could look at the domain when someone signups and automatically set their workspace logo based on that.

In our case, we built it because we needed it for our CRM [Twenty](https://github.com/twentyhq/twenty):
[![Twenty](https://raw.githubusercontent.com/twentyhq/twenty/main/docs/static/img/preview-light.png)](https://github.com/twentyhq/twenty)

## Features

- Fast delivery on the edge thanks to Cloudflare
- Delivered securely via SSL
- Support fetching larger icons, not just 16x16 favicons

## Getting Started

To set up and run the Favicon package locally, follow these steps.

### Pre-requisites

Before diving in, ensure your system is equipped with the following tools:

- **Node.js**: Required for running JavaScript server-side.
- **Git**: Essential for version control and cloning the repository.
- **Yarn**: A package manager for your dependencies (recommended over npm for this project).

---

### Setting Up Locally

1. **Clone the Repository**:
   Pull the project onto your local machine with the following command.

   ```sh
   git clone https://github.com/twentyhq/favicon.git
   ```

2. **Navigate to the Project Directory**:

   ```sh
   cd favicon
   ```

3. **Install Dependencies**:
   Use the command below to fetch the required packages using Yarn.

   ```sh
   yarn install
   ```

4. **Start the Application**:
   Kickstart the NestJS application using:

   ```sh
   yarn start
   ```

   Once active, you can access the application at [http://localhost:3000](http://localhost:3000).

> 📌 **Tip**: To check the app's health, head over to [http://localhost:3000/health](http://localhost:3000/health). A `200` status indicates smooth operation.

### Starting the App: Different Modes

- **Development Mode**:
  For starting the NestJS application in development mode with auto-refresh upon file modifications, use:

  ```sh
  yarn start:dev
  ```

- **Debug Mode**:
  To boot the application in debug mode that also auto-restarts on changes:

  ```sh
  yarn start:debug
  ```

  This mode lets you latch a debugger, providing facilities like setting breakpoints, inspecting variables, and walking through the code.

- **Production Mode**:
  For production readiness, it's advised to build the application first and then initiate it. Execute the commands one after the other:

  ```sh
  yarn build
  yarn start:prod
  ```

## Testing

Our application relies on **Jest** for unit and integration testing. Jest is renowned for its versatility and robustness, enabling a thorough evaluation of the codebase. Below are a set of scripts tailored for different testing scenarios:

- **Default Jest Testing**:
  To execute the default suite of Jest tests:

  ```sh
  yarn test
  ```

- **Watch Mode**:
  If you're actively developing and need tests to run automatically upon file changes, use:

  ```sh
  yarn test:watch
  ```

- **Coverage Report**:
  For a detailed analysis of test coverage across your codebase, execute:

  ```sh
  yarn test:cov
  ```

- **Debugging**:
  To run Jest tests in debug mode, allowing for detailed code inspections via the Node Inspector:

  ```sh
  yarn test:debug
  ```

- **End-to-End Testing**:
  To perform comprehensive end-to-end tests based on the configuration in `test/jest-e2e.json`:

  ```sh
  yarn test:e2e
  ```

## File Storage Options

Our application provides two distinct methods for favicon storage:

### 1. Local Storage

By default, during local development, favicons are stored in the `.local-storage` folder located at the root of the application. If you wish to alter this default path:

- Update the `STORAGE_LOCAL_PATH` value in your `.env` file.

### 2. Amazon S3 Storage

For scalable and robust storage, the application also integrates with Amazon S3.

To configure Amazon S3 as your storage preference:

1. Modify the `STORAGE_TYPE` variable in the `.env` file to reflect `s3`.

2. Populate the Amazon S3-specific environment variables in the `.env` file:

   ```env
   STORAGE_TYPE=s3
   STORAGE_S3_REGION=<Your-S3-Region>
   STORAGE_S3_NAME=<Your-S3-Bucket-Name>
   AWS_ACCESS_KEY_ID=<Your-Access-Key-ID>
   AWS_SECRET_ACCESS_KEY=<Your-Secret-Access-Key>
   ```

Replace the placeholders (`<...>`) with the appropriate values related to your Amazon S3 account.
