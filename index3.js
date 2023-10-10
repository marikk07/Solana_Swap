import solanaweb3, { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';
import bs58 from 'bs58';
import * as web3 from "@solana/web3.js";

// import * as token from "@solana/spl-token";
import { TOKEN_PROGRAM_ID, Token, MintLayout, AccountLayout } from '@solana/spl-token';

const secretKey = "5PSAw83j32BC4MP95Vkrc7SgbezQw6h6Z68ekrUphBzexXaedzgB5XBHx7Ghvp6WZMxZ6BUAqPi1zkXxCjVoDF3k";
const secreKey2 = "3bbjm6R5QyQm74BKZgCtD3F3tMefa64j5tjkb8EehDU7MPyM11m7nXcuccuGesVzRJ9Pt6gMe65UfeyGyLoaJY3w";
const payer = solanaweb3.Keypair.fromSecretKey(bs58.decode(secretKey));
const mintAuthority = solanaweb3.Keypair.fromSecretKey(bs58.decode(secreKey2));
const freezeAuthority = Keypair.generate();

// const connection = new Connection("https://api.mainnet-beta.solana.com", "singleGossip");
const connection = new web3.Connection(web3.clusterApiUrl("devnet"));

const tokenDecimals = 9;
let mint;
let tokenAddress;

async function createMint() {

     mint = await  Token.createMint(
        connection,
        payer,
        mintAuthority.publicKey,
        freezeAuthority.publicKey,
        tokenDecimals,
        TOKEN_PROGRAM_ID,
        { name: "My Custom Token" }
    );
    console.log(`Token Mint: ${mint.publicKey.toString()}`);

    const tokenAccount = await mint.getOrCreateAssociatedAccountInfo(
        mintAuthority.publicKey
    );

    tokenAddress = tokenAccount.address
    console.log(`Token Account: ${tokenAccount.address}`);
    console.log(`Token Balance: ${tokenAccount.amount}`);

    const tokenAccountInfo = await mint.getAccountInfo(
        tokenAccount.address
    );
    console.log(tokenAccountInfo.amount);


    const  info = await mint.getMintInfo();
   console.log(`Token Info: ${info}`);

    const tokenAccountInfo2 = await mint.getAccountInfo(
        tokenAccount.address
    )

    console.log(`Token Amount: ${tokenAccountInfo2.amount}`);
}

async function startMint(amount) {
    const signature = await mint.mintTo(
        tokenAccount.address,
        mintAuthority,
        [],
        amount * 10**tokenDecimals
    );

    console.log("SIGNATURE", signature);
}

async function burn(amount) {
    const  burned = await  mint.burn(
        mintAuthority.publicKey,
        mintAuthority.publicKey,
        [],
        amount * 10**tokenDecimals
        )

    console.log("Burned", burned);
}



createMint()
    .then(() => {
        console.log("Done");
    })
    .catch((e) => {
        console.error(e);
    });
