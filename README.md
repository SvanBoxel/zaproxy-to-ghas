# Present ZAProxy results in GitHub Advanced Security

Use this GitHub Action together with [GitHub Advanced Security](https://github.com/features/security) to run a [ZAProxy](https://github.com/zaproxy) (DAST) scan on your application, and present the results in the GitHub Advanced Security UI.

This Action leverages the official [zaproxy/action-baseline](https://github.com/zaproxy/action-baseline) Action which supports various options like [custom rule sets](https://github.com/zaproxy/action-baseline#rules_file_name) and [target url](https://github.com/zaproxy/action-baseline#target). 

## Background
GitHub Advanced Security utilizes the [SARIF (Static Analysis Results Interchange) format](https://docs.github.com/en/code-security/code-scanning/integrating-with-code-scanning/sarif-support-for-code-scanning) to present code scanning results of a wide range of [static code analysis tools](https://github.blog/2021-07-28-new-code-scanning-integrations-open-source-security-tools/). As DAST scans are not static they can't be directly mapped to individual lines in the original source file but only to a specific URL or endpoint of the application. 

This Actions maps the DAST results of ZAProxy to SARIF on a best effort basis to ensure developers get the DAST-related information they need to make informed decisions about the security risks in an application. 

## What is looks like

After the scan completes, all results are presented in the `Security` -> `Code Scanning Alerts` tab, which allows users to filter for specific security tools, rules, and branches:

<img width="1406" alt="Screenshot 2021-09-27 at 10 23 26" src="https://user-images.githubusercontent.com/24505883/134871786-7acf32b1-420b-463c-aecf-630713d6a38c.png">

All results that fall under the same rule are captured within a single overview:

<img width="1421" alt="Screenshot 2021-09-27 at 10 23 52" src="https://user-images.githubusercontent.com/24505883/134886620-94a7292f-3fe9-44f2-9d19-979817879570.png">

> 💡 Previews are not available as DAST scans can't map a scan result to a specific file in the repository.

## Getting started
### Use with (public-facing) URLs
The easiest way to get started is by running this scan against a URL that is publicly available. Or, in case you use self-hosted Action runners, that is available within the network of your runner.

Example workflow:
```yml
name: ZAProxy scan

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  dast-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2.3.4
      - name: ZAP Scan
        uses: zaproxy/action-baseline@v0.4.0
        with:
          target: 'https://www.zaproxy.org' # Target url for the scan
      - name: Create sarif file from zaproxy results
        uses: SvanBoxel/zaproxy-to-ghas@main
      - name: Upload SARIF file
        uses: github/codeql-action/upload-sarif@v1
        with:
          sarif_file: results.sarif
```

When running this workflow the following happens:
- First, the code is checked out.
- Then, it runs the ZAProxy scan on a defined target url.
- After the scan completes, it runs this Action to map the ZAProxy results to SARIF.
- Finally, it uploads the results to GitHub.

Results can be manually inspected by downloading the `zap_scan` artifact that contains the original scan results, and `ZAProxy-sarif-report` which contains the SARIF output of the scan. 

<img width="1304" alt="Screenshot 2021-09-27 at 11 47 17" src="https://user-images.githubusercontent.com/24505883/134885784-fb2700c4-a424-447e-9758-255524aceffd.png">


### Use with containers
If your application leverages containers you have another option for deploying and scanning with DAST. After you deploy your docker to a container registry, you can use the image as a service in the context of your workflow. 

Example workflow:
```yml
name: ZAProxy scan

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build-image:
    ## Build your image here
  publish-image:
    ## Publish your image to a container registry here
  dast-scan:
    services:
      website:
        image: yeasy/simple-web # Point to the container image of your application
        ports:
          - 80:80
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2.3.4
      - name: ZAP Scan
        uses: zaproxy/action-baseline@v0.4.0
        with:
          target: 'http://localhost' # Runs within the context of your workflow
      - name: Create sarif file from zaproxy results
        uses: SvanBoxel/zaproxy-to-ghas@main
      - name: Upload SARIF file
        uses: github/codeql-action/upload-sarif@v1
        with:
          sarif_file: results.sarif
```

### Use with Pull Requests
This Action offers you the ability to run the scan as part of a PR in the developer workflow. There are a couple of ways to do this. The easiest way is add the [`pull_request`](https://docs.github.com/en/actions/learn-github-actions/events-that-trigger-workflows#pull_request) event to your workflow:

```yml
name: ZAProxy scan

on:
  push:
    branches: [ main ]
  pull_request: # Run on every pull request that targets the main branch
    branches: [ main ]
  workflow_dispatch:

jobs:
  # See examples in `Use with public-facing URLs` and `Use with containers`
```

After the scan completes, all results will be visible in the `Checks` tab of the scanned pull request:

<img width="1427" alt="Screenshot 2021-09-27 at 11 29 29" src="https://user-images.githubusercontent.com/24505883/134882759-a1ad1e58-b80d-43f5-ae4a-cffee323abf6.png">

> 💡 Alternatively you can hook into some of the other GitHub events to trigger a scan. Only want to run the DAST scan when a specific label is added? Use the [`label`](https://docs.github.com/en/actions/learn-github-actions/events-that-trigger-workflows#label) event.


## Development
Contributions are always welcome. Please follow the steps below to get started.


Install the dependencies  
```bash
$ npm install
```

Build the typescript and package it for distribution
```bash
$ npm run build && npm run package
```

Run the tests :heavy_check_mark:  
```bash
$ npm test

 PASS  ./index.test.js
  ✓ test runs (95ms)

...
```

## Publish to a distribution branch

Actions are run from GitHub repos so we will checkin the packed dist folder. 

Then run [ncc](https://github.com/zeit/ncc) and push the results:
```bash
$ npm run package
$ git add dist
$ git commit -a -m "prod dependencies"
```

The action is now updated! :rocket: 
