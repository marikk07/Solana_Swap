//Source https://github.com/orca-so/typescript-sdk

import { readFileSync } from "fs";
import { Connection, Keypair } from "@solana/web3.js";
// import { getOrca, OrcaFarmConfig, OrcaPoolConfig } from "@orca-so/sdk";
import { getOrca, OrcaFarmConfig, OrcaPoolConfig, Network } from "@orca-so/sdk";
import Decimal from "decimal.js";
import solanaweb3 from "@solana/web3.js";
import bs58 from "bs58";

const main = async () => {
  /*** Setup ***/
  // 1. Read secret key file to get owner keypair
  // const secretKeyString = await readFileSync("/Users/scuba/my-wallet/my-keypair.json", {
  //   encoding: "utf8",
  // });

  // const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
  // const owner = Keypair.fromSecretKey(secretKey);

  const owner = solanaweb3.Keypair.fromSecretKey(
      bs58.decode("3bbjm6R5QyQm74BKZgCtD3F3tMefa64j5tjkb8EehDU7MPyM11m7nXcuccuGesVzRJ9Pt6gMe65UfeyGyLoaJY3w"));
          // bs58.decode("5PSAw83j32BC4MP95Vkrc7SgbezQw6h6Z68ekrUphBzexXaedzgB5XBHx7Ghvp6WZMxZ6BUAqPi1zkXxCjVoDF3k"));

  // 2. Initialzie Orca object with mainnet connection
  const connection = new Connection("https://api.mainnet-beta.solana.com", "singleGossip");
  const orca = getOrca(connection);
  // const connection = new Connection("https://api.devnet.solana.com", "singleGossip");
  // const orca = getOrca(connection, Network.DEVNET);

  try {
    /*** Swap ***/
    // 3. We will be swapping 0.1 SOL for some ORCA
    const orcaSolPool = orca.getPool(OrcaPoolConfig.STEP_SOL);
    const solToken = orcaSolPool.getTokenB();
    const solAmount = new Decimal(0.1);
    const quote = await orcaSolPool.getQuote(solToken, solAmount);
    const orcaAmount = quote.getMinOutputAmount();

    console.log(`Swap ${solAmount.toString()} SOL for at least ${orcaAmount.toNumber()} STEP`);
    const swapPayload = await orcaSolPool.swap(owner, solToken, solAmount, orcaAmount);
    const swapTxId = await swapPayload.execute();
    console.log("Swapped:", swapTxId, "\n");
    // console.log("Transaction:", swapPayload.transaction)

  } catch (err) {
    console.warn(err);
  }
};

function swap() {

}

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });