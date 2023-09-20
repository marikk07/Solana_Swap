import solanaweb3, { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';
import fetch from 'cross-fetch';
import bs58 from 'bs58';

const stepAddress = "StepAscQoEioFxxWGnh2sLBDFp9d8rvKz2Yp39iDpyT";
const usdcAddress = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const solAddress = "So11111111111111111111111111111111111111112";

const owner = solanaweb3.Keypair.fromSecretKey(
    bs58.decode("3bbjm6R5QyQm74BKZgCtD3F3tMefa64j5tjkb8EehDU7MPyM11m7nXcuccuGesVzRJ9Pt6gMe65UfeyGyLoaJY3w"));
// bs58.decode("5PSAw83j32BC4MP95Vkrc7SgbezQw6h6Z68ekrUphBzexXaedzgB5XBHx7Ghvp6WZMxZ6BUAqPi1zkXxCjVoDF3k"));

const connection = new Connection("https://api.mainnet-beta.solana.com", "singleGossip");

// retrieve indexed routed map
// const indexedRouteMap = await (await fetch('https://quote-api.jup.ag/v4/indexed-route-map')).json();
// const getMint = (index) => indexedRouteMap["mintKeys"][index];
// const getIndex = (mint) => indexedRouteMap["mintKeys"].indexOf(mint);
//
// // generate route map by replacing indexes with mint addresses
// var generatedRouteMap = {};
// Object.keys(indexedRouteMap['indexedRouteMap']).forEach((key, index) => {
//     generatedRouteMap[getMint(key)] = indexedRouteMap["indexedRouteMap"][key].map((index) => getMint(index))
// });
//
// // list all possible input tokens by mint Address
// const allInputMints = Object.keys(generatedRouteMap);

// swapping SOL to USDC with input 0.1 SOL and 0.5% slippage
const { data } = await (
    await fetch(`https://quote-api.jup.ag/v4/quote?inputMint=${usdcAddress}
&outputMint=${stepAddress}
&amount=100000&slippageBps=50`
    )
).json();
const routes = data;
console.log(routes)

// get serialized transactions for the swap
const transactions = await (
    await fetch('https://quote-api.jup.ag/v4/swap', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            // route from /quote api
            route: routes[0],
            // user public key to be used for the swap
            userPublicKey: owner.publicKey.toString(),
            // auto wrap and unwrap SOL. default is true
            wrapUnwrapSOL: true,
            // feeAccount is optional. Use if you want to charge a fee.  feeBps must have been passed in /quote API.
            // This is the ATA account for the output token where the fee will be sent to. If you are swapping from SOL->USDC then this would be the USDC ATA you want to collect the fee.
            // feeAccount: "fee_account_public_key"
        })
    })
).json();

const { swapTransaction } = transactions;

// deserialize the transaction
const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
var transaction = VersionedTransaction.deserialize(swapTransactionBuf);
console.log(transaction);

// sign the transaction
transaction.sign([owner]);

// Execute the transaction
const rawTransaction = transaction.serialize()
const txid = await connection.sendRawTransaction(rawTransaction, {
    skipPreflight: true,
    maxRetries: 2
});
await connection.confirmTransaction(txid);
console.log(`https://solscan.io/tx/${txid}`);