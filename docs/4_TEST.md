# 🎲 Debugging using TDD

To run the test suites with hardhat network, use:

```
yarn hardhat test
```

> :warning: **Warning**
>

> Before running unit test suites, it is required to run:

```
yarn hardhat node

^C
```

-  This will build Deployment artifacts in [`/deployments/localhost/`](../deployments/localhost) 

- The hardhat network will then use the corresponding mocking address to run the unit testing.


It is recommended to run unit and isolation tests in isolation by simply using `.skip()`

```typescript
describe.skip()
```

To utilize the maximum benefit of debugging features, use:

```
yarn hardhat test --logs
```

> :warning: **Warning**
>

> we can add the --logs after your test command. So, this could emit Event during TDD environment
