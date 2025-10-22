## Project Overview  
This project demonstrates a web interface for **token bridging, and yield staking** using the **Cross-Chain Interoperability Protocol (CCIP)** framework by Chainlink.  

In addition to standard CCIP cross-chain transfers, the app introduces a **Rebase Token (RBT)** system that rewards users with **auto-compounding yield**.  
Users can deposit ETH or supported tokens to receive RBT — a dynamic, rebasing token that grows automatically in their wallet over time.  
All RBT balances and staking states are synchronized across supported chains through CCIP’s secure cross-chain communication layer.  

The live version is available at: [https://ccip-crosschain.vercel.app/](https://ccip-crosschain.vercel.app/)

## Features  
- Connect wallet (e.g., MetaMask) and select source/destination chains  
- Initiate cross-chain token transfers or arbitrary message payloads  
- View cross-chain message status (sent / in-flight / succeeded / failed)  
- Display supported chains / message lanes / tokens  
- Responsive UI built for ease of use  

## Tech Stack  
- Frontend: Next.js
- Smart contracts / blockchain interaction: Wagmi, Viem and Rainbowkit
- Cross-chain logic via CCIP (see docs at [Chainlink CCIP](https://docs.chain.link/ccip) )
- State management: Redux Toolkit
- UI framework: Tailwind CSS and Material UI

## Getting Started  
### Prerequisites  
- Node.js (v16 or later)  
- A wallet extension (e.g., MetaMask) with some test tokens on supported networks  
- (Optional) Smart contract addresses of CCIP message routers / token-pools if interacting with custom setup  

## How It Works
- User selects a source chain and destination chain.
- The dApp connects to the user’s wallet and verifies chain/network.
- User enters amount of Testnet token.
- The frontend calls the CCIP router contract on the source chain to send the message/transfer.
- The protocol uses operand lanes, relayers/oracles and destination router to execute or release on destination chain.
- The user can monitor the message status via the [CCIP Explorer](https://ccip.chain.link/).
- On success, user sees the token received on destination chain.

## Rebase Token & Yield Staking
### What is the Rebase Token?
The Rebase Token (RBT) is a dynamic token that automatically adjusts its total supply based on the protocol’s yield logic.
- Each holder’s balance increases proportionally during a rebase event.
- The rebase mechanism distributes staking rewards to all holders without requiring manual claims.
- The balance growth happens directly in users’ wallets — no need to stake/unstake each time.

In this project, RBT acts as a receipt token — users receive RBT when they deposit ETH or supported tokens.
This represents their share of the protocol’s pool and grows automatically through rebasing.

## Yield Staking Mechanism
When users deposit assets through the Deposit section:
- Their tokens are locked into the protocol’s yield system.
- The protocol periodically increases the RBT token supply, reflecting accrued yield.
- Users can redeem or bridge their RBT at any time to claim the equivalent amount (plus yield) on another supported chain.
- The system leverages CCIP for secure cross-chain synchronization of staking and yield data.

Benefits:
- Automatic Yield: Rewards are compounded automatically via rebasing.
- Cross-Chain Staking: Stake on one chain, claim or track balance on another.
- RBT as Proof-of-Stake: RBT represents both ownership and staking share.
- Transparency: All staking and yield changes can be tracked via the CCIP Explorer.

Example Flow
- Deposit ETH on the source chain → Receive RBT tokens.
- Hold RBT → Watch your balance increase automatically as yield compounds.
- Bridge RBT to another chain via CCIP → Tokens and yield sync across chains.
- Redeem or use RBT on the destination chain whenever you wish.

## Future Enhancements
- Add support for more testnets (e.g., Arbitrum Sepolia, Optimism Sepolia).
- Integrate real yield sources or DeFi protocols for yield generation.
- Add detailed analytics dashboard for cross-chain transfers and staking performance.
- Implement gas estimation and optimization for bridging operations.

## Author  

**Jason Tong**  

**Product:** [ccip-crosschain.vercel.app](https://ccip-crosschain.vercel.app/)  
**GitHub:** [JasonTongg]([https://github.com/yourusername/ccip-crosschain](https://github.com/JasonTongg))
**Linkedin:** [Jason Tong](https://www.linkedin.com/in/jason-tong-42600319a/)
