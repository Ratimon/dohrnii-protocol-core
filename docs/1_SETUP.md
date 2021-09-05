# 1. 🏗  Setting up the environment

## Installing Node.js

### 📱 MacOS

Make sure you have `git` installed. Otherwise, follow [these instructions](https://www.atlassian.com/git/tutorials/install-git).

There are multiple ways of installing Node.js on MacOS. We will be using [Node Version Manager (nvm)](http://github.com/creationix/nvm). Copy and paste these commands in a terminal:

```
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.35.2/install.sh | bash
nvm install 12.19.1
nvm use 12.19.1
nvm alias default 12.19.1
npm install npm --global # Upgrade npm to the latest version
```

## Installing yarn

We are going to use [yarn](yarnpkg.com)

To install it do the following:

```
npm install -g yarn
```

# 2. Creating a new Hardhat project

We'll install **Hardhat** using the npm CLI. The **N**ode.js **p**ackage **m**anager is a package manager and an online repository for JavaScript code.

Open a new terminal, go to the directory and run these commands:

```
yarn init --yes
yarn add -D hardhat
```

In the same directory where you installed **Hardhat** add a `hardhat.config.ts` (we are going to use typescript and use solidity 0.5.17 compiler)

```typescript
import {HardhatUserConfig} from 'hardhat/types';
const config: HardhatUserConfig = {
  solidity: {
    version: '0.6.6',
  }
};
export default config;

```

## Install Dependenciies

Run following yo install required dependencies
```
yarn install
```

if we want to add more dependecied we ,for example, just use:

```
yarn add -D hardhat-deploy @ethersproject/abstract-signer chai chai-ethers mocha @types/chai @types/mocha @types/node typescript ts-node dotenv
```

These are libraries regarding typescript:
```
yarn add -D hardhat-typechain typechain ts-generator
```

These are libraries regarding smart contract testing:

```
yarn add -D @typechain/ethers-v5
```
```
yarn add -D @nomiclabs/hardhat-waffle 'ethereum-waffle@^3.0.0' @nomiclabs/hardhat-ethers 'ethers@^5.0.0'

```
## Dependency Issues

However, current verison of [waffle.io](https://vanity-eth.tk/) doesnot support checking against subset of args emitted in events.

To support this, we may need to use **openzeppelin-test-helpers**. Install with:

```
yarn add -D @nomiclabs/hardhat-truffle5
yarn add -D openzeppelin-test-helpers
```

```
yarn add hardhat-tracer
```

Also, there is sometimes problem with  **hardhat-deploy-ethers** dependency. Here is a way to fix:
```
yarn add -D  @nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers ethers
```
But it sometimes does not work, try this:
```
yarn add -D  hardhat-deploy-ethers
```



Edit `hardhat.config.ts` so that it looks as in our repository:


We also create the following `tsconfig.json` :

```json
{
    "compilerOptions": {
      "target": "es5",
      "module": "commonjs",
      "strict": true,
      "resolveJsonModule": true,
      "esModuleInterop": true,
      "moduleResolution": "node",
      "forceConsistentCasingInFileNames": true,
      "outDir": "dist"
    },
    "include": [
      "./artifacts",
      "./deploy",
      "./test",
      "./utils"
    ],
    "files": ["./hardhat.config.ts"],
  }
```

## Add .gitignore

We need to create the following `.gitignore` :

```env
# See http://help.github.com/ignore-files/ for more about ignoring files.

# compiled output
/artifacts
# /.openzeppelin
/cache
# /deployments
/dist
/typechain
/tmp
/out-tsc
# Only exists if Bazel was run
/bazel-out

# dependencies
/node_modules

# profiling files
chrome-profiler-events.json
speed-measure-plugin.json

# IDEs and editors
/.idea
.project
.classpath
.c9/
*.launch
.settings/
*.sublime-workspace

# IDE - VSCode
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json
.history/*

# misc
/.sass-cache
/connect.lock
/coverage
/libpeerconnection.log
npm-debug.log
yarn-error.log
testem.log
/typings

# System Files
.DS_Store
Thumbs.db
.env
```

## Add .env

We also create the following `.env` :

```env
PKEY=
PKEY2=
MKEY=
ETHERSCANKEY=

CHAINSTACK_NODEUSERNAME=
CHAINSTACK_PASSWORD=
CHAINSTACK_RPC_ENDPOINT=
CHAINSTACK_WSS_ENDPOINT=
```

We can go to [vanity-eth](https://vanity-eth.tk/) in order to generate such Private key

We can go to [iancoleman.io](https://iancoleman.io/bip39/) in order to generate such Mneomic key


We could ask mock BNB for testing purpose by go to
[testnet.binance.org](https://testnet.binance.org/faucet-smart) 