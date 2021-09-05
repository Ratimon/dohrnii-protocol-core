# 2. 💼 Deploy Scripts

## 🏄‍♂️ Quick Start

All **deployment scripts** are written in `/deploy` folder


We speify **The network** to deploy the smart contract with  **--network** as parameter. The config is shown in `hardhat.config.ts`

```
--network hardhat
--network bscTestnet
--network bscMainnet
```

All artifacts will be stored in `/Deployments` folder but it stores only recently deployed one. 

There is sometimes downtime for rpc. So, rpc need to be changed in `hardhat.config.ts`, and alternatives can be found at
[docs.binance.org](https://docs.binance.org/smart-chain/developer/rpc.html)


```typescript
    bscTestnet: {
      // url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      url: "https://data-seed-prebsc-1-s2.binance.org:8545/",
      chainId: 97,
      gasPrice: 20000000000,
      // accounts: [`0x${PRIVATE_KEY}`]
      accounts: {
        count: 10,
        initialIndex: 0,
        mnemonic: `${MNEMONIC}`,
        path: "m/44'/60'/0'/0",
      }

    },
```

In each script, relevant **tags** are specified so we can use **--tags** as parameter

```typescript
func.tags = ['testtokens'];
```

In this way, we can run specified set of scripts or skip unwanted ones

Each of single script must be **atomic**, so **dependencies** can be specified to make the script being running in order:

```typescript
  func.dependencies = ['testtokens']
```
> :warning: **Warning**
>

> After each step, **hardhat.config.ts** needs to be updated regarding to newly  deployed accounts.
>
>We can searh through terminal command with keyword  `key`  or `We may update these following addresses at hardhatconfig.ts`


## 🏗 Steps
