import solanaweb3, { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';
import fetch from 'cross-fetch';
import bs58 from 'bs58';


const stepAddress = "StepAscQoEioFxxWGnh2sLBDFp9d8rvKz2Yp39iDpyT";
const usdcAddress = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const solAddress = "So11111111111111111111111111111111111111112";

const secretKey = "5PSAw83j32BC4MP95Vkrc7SgbezQw6h6Z68ekrUphBzexXaedzgB5XBHx7Ghvp6WZMxZ6BUAqPi1zkXxCjVoDF3k";

const owner = solanaweb3.Keypair.fromSecretKey(
    bs58.decode(secretKey));

const connection = new Connection("https://api.mainnet-beta.solana.com", "singleGossip");

async function swap(coinFrom, coinTo, amount) {

    // The API takes in amount in integer and you have to factor in the decimals
    // for each token by looking up the decimals for that token. For example,
    // USDC has 6 decimals and 1 USDC is 1000000 in integer when passing it in into the API.

        var amountToSwap = 0
        switch (coinFrom) {
            case "SOL":
                amountToSwap = amount * 1000000000
                break;
            case "USDC":
                amountToSwap = amount * 1000000
                break;
            case "STEP":
                amountToSwap = amount * 1000000000
                break;
            default: break;
        }


        var coinFromAddress = ""
        switch ( coinFrom) {
            case "SOL":
                coinFromAddress = solAddress
                break;
            case "STEP":
                coinFromAddress = stepAddress
                break;
            case "USDC":
                coinFromAddress = usdcAddress
                break;
            default: break;
        }

    var coinToAddress = ""
    switch ( coinTo) {
        case "SOL":
            coinToAddress = solAddress
            break;
        case "STEP":
            coinToAddress = stepAddress
            break;
        case "USDC":
            coinToAddress = usdcAddress
            break;
        default: break;
    }

    const { data } = await (
        await fetch(`https://quote-api.jup.ag/v4/quote?inputMint=${coinFromAddress}
&outputMint=${coinToAddress}
&amount=${amountToSwap}&slippageBps=50`
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
    return txid;
}


const coinFrom = "USDC";
const coinTo = "SOL";
const amount = 0.1;
// Call the swap function with the defined arguments
swap(coinFrom, coinTo, amount)
    .then(() => {
        console.log("Swap completed successfully.");
    })
    .catch((error) => {
        console.error("Swap failed:", error);
    });