import Web3 from "web3";
import dotenv from "dotenv";
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const ABI = require('./FlocLoyaltyToken.json')

dotenv.config(); 

//create express app
const express = require("express");
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;



//api for minting
//"0x39E35FE30707060717ff08e1A9e8585a8Db5A14a"
app.post("/mint", async (req, res) => {
        const {wallet,amount} = req.body;
        const l_amount = BigInt(amount)*BigInt(10**18)
        const b = await mint(wallet,l_amount)
        res.status(200).send(b.toString())
    }
);

//"0x2982d0f818af8709abf2e6f310582c5b31046e3b23bcd1f03c3171db0a5ed430"
//api for burning
app.post("/burn", async (req, res) => {
        const {private_key,amount} = req.body;
        const l_amount = BigInt(amount)*BigInt(10**18)
        const b = await burn(private_key,l_amount)
        res.status(200).send(b.toString())
    }
);

//"0x39E35FE30707060717ff08e1A9e8585a8Db5A14a"
//api for checking balance
app.get("/balance", async (req, res) => {
        const {wallet} = req.body;
        const bal = await getBalance(wallet)
        console.log(bal, "bal")
        res.status(200).send(bal.toString())
    }
);

app.get("/", (req, res) => {
    res.send("Welcome to FlocLoyaltyToken API")
}
);


//initiate the web3 instance
const web3 = new Web3(process.env.RPC_ENDPOINT);
const contract = new web3.eth.Contract(ABI.abi, process.env.CONTRACT_ADDRESS);

// user earns points
async function mint(wallet,amount){
    try {
        const account = web3.eth.accounts.privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`);
        web3.eth.accounts.wallet.add(account);

        const earnPointsMethod = contract.methods.mint(wallet, amount);

        // Estimate gas for the transaction
        const gasAmount = await earnPointsMethod.estimateGas({ from: account.address });

        // Send the transaction
        const receipt = await earnPointsMethod.send({
            from: account.address,
            gas: gasAmount,
            gasPrice: '1000000000'  // Ensure gasPrice is a string if it's very large
        });

        console.log(receipt);  // Optional: logging the transaction receipt
        return receipt;  // Return the transaction receipt

    } catch (error) {
        console.error(error);  // Log the error
        throw error;  // Rethrow or handle the error as needed
    }
}

// user burn points
async function burn(private_key,amount) {
try {
        const account = web3.eth.accounts.privateKeyToAccount(private_key);
        web3.eth.accounts.wallet.add(account);

        const burnPointsMethod = contract.methods.burn(amount);

        // Estimate the gas needed for the transaction
        const gasAmount = await burnPointsMethod.estimateGas({ from: account.address });

        // Send the transaction
        const receipt = await burnPointsMethod.send({
            from: account.address,
            gas: gasAmount,
            gasPrice: '1000000000'  // It's a good practice to handle gasPrice as a string if it's large
        });

        console.log(receipt);  // Optional: logging the transaction receipt
        return receipt;  // Return the transaction receipt to handle it outside the function

    } catch (error) {
        console.error(error);  // Log the error
        throw error;  // Rethrow or handle the error as needed for further handling outside the function
    }
}

function pause() {
    const admin_account = web3.eth.accounts.privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`);
    web3.eth.accounts.wallet.add(admin_account);

    const pauseMethod = contract.methods.pause();

    pauseMethod.estimateGas({from: admin_account.address}).then((gasAmount) => {
        pauseMethod.send(
            {from: admin_account.address, 
                gas: gasAmount,
                gasPrice: 1000000000
            }).then((receipt) => {
            console.log(receipt)
        })
        }).catch((error) => {
            console.log(error)
        })
}

function unpause() {
    const admin_account = web3.eth.accounts.privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`);
    web3.eth.accounts.wallet.add(admin_account);

    const unpauseMethod = contract.methods.unpause();

    unpauseMethod.estimateGas({from: admin_account.address}).then((gasAmount) => {
        unpauseMethod.send(
            {from: admin_account.address, 
                gas: gasAmount,
                gasPrice: 1000000000
            }).then((receipt) => {
            console.log(receipt)
        })
        }).catch((error) => {
            console.log(error)
        })
}

async function getBalance(wallet) {
    try {
        const balance = await contract.methods.balanceOf(wallet).call();
        const b = balance / BigInt(10**18);
        console.log(b);  // Optional, for logging
        return b;  // Return the processed balance
    } catch (error) {
        console.error(error);
        throw error;  // Rethrow or handle error as needed
    }
}

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

// earn()