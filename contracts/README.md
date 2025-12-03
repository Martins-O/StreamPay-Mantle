## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

- **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
- **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
- **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
- **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ cp .env.example .env
$ forge test
$ ./deploy.sh   # deploy StreamEngine + YieldPool + oracle + factory
```

The deploy script prints every on-chain address. Copy them into `contracts/deployment.env`, `backend/.env`, and `frontend/.env.local` so the rest of the stack can connect to the same network deployment.

### Mint a demo RevenueToken

After deployment you can mint a sample `RevenueToken` to showcase the YieldPool UI:

```shell
$ forge script script/MintRevenueToken.s.sol:MintRevenueTokenScript \
    --rpc-url $MANTLE_TESTNET_RPC \
    --broadcast
```

Optional overrides (set inside `contracts/.env`) let you customize the tranche name, symbol, expected revenue, tenor, and payment token:

```
REVENUE_TOKEN_NAME="Acme Invoice Q2"
REVENUE_TOKEN_SYMBOL="ACMEQ2"
REVENUE_TOKEN_EXPECTED=750000000000   # raw units (align with your payment token decimals)
REVENUE_TOKEN_TENOR=120 days
PAYMENT_TOKEN_ADDRESS=0xExistingStablecoin
```

Copy the minted `RevenueToken` address into `backend/config/pools.local.json` so `/api/pools` references a real tranche.

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```
