#!/bin/bash

# SanCoin API Test Script
# This script demonstrates the full lifecycle:
# 1. Create two wallets (for a miner/sender and a recipient).
# 2. Mine the genesis block to give the miner some initial coins.
# 3. Check the miner's balance.
# 4. The miner sends some coins to the recipient.
# 5. Mine a new block to confirm the transaction.
# 6. Check the final balances of both wallets.

BASE_URL="http://localhost:8080/api/v1"

echo "--- 1. Creating Wallets ---"
echo "Creating Miner Wallet..."
MINER_WALLET=$(curl -s -X POST $BASE_URL/wallet)
MINER_ADDRESS=$(echo $MINER_WALLET | jq -r .address)
MINER_PRIVATE_KEY=$(echo $MINER_WALLET | jq -r .private_key)

echo "Creating Recipient Wallet..."
RECIPIENT_WALLET=$(curl -s -X POST $BASE_URL/wallet)
RECIPIENT_ADDRESS=$(echo $RECIPIENT_WALLET | jq -r .address)

echo "Miner Address: $MINER_ADDRESS"
echo "Recipient Address: $RECIPIENT_ADDRESS"
echo ""

# Wait for user to press key
read -p "Press Enter to mine the Genesis Block..."

echo "--- 2. Mining Genesis Block ---"
echo "Mining... this may take a moment."
curl -s -X POST -H "Content-Type: application/json" \
-d "{\"miner_address\": \"$MINER_ADDRESS\"}" \
$BASE_URL/blockchain/mine | jq .
echo ""

read -p "Press Enter to check Miner's balance..."

echo "--- 3. Checking Miner's Balance ---"
echo "Balance for $MINER_ADDRESS:"
curl -s -X GET $BASE_URL/wallet/$MINER_ADDRESS/balance | jq .
echo ""

read -p "Press Enter to send 10 SanCoin from Miner to Recipient..."

echo "--- 4. Sending Transaction ---"
echo "Sending 10 coins from Miner to Recipient..."
curl -s -X POST -H "Content-Type: application/json" \
-d "{
  \"sender_private_key\": \"$MINER_PRIVATE_KEY\",
  \"sender_address\": \"$MINER_ADDRESS\",
  \"recipient_address\": \"$RECIPIENT_ADDRESS\",
  \"amount\": 10
}" \
$BASE_URL/transactions | jq .
echo ""

read -p "Transaction is in mempool. Press Enter to mine the next block to confirm it..."

echo "--- 5. Mining Confirmation Block ---"
echo "Mining..."
curl -s -X POST -H "Content-Type: application/json" \
-d "{\"miner_address\": \"$MINER_ADDRESS\"}" \
$BASE_URL/blockchain/mine | jq .
echo ""

read -p "Press Enter to check final balances..."

echo "--- 6. Checking Final Balances ---"
echo "Final Balance for Miner ($MINER_ADDRESS):"
curl -s -X GET $BASE_URL/wallet/$MINER_ADDRESS/balance | jq .
echo ""
echo "Final Balance for Recipient ($RECIPIENT_ADDRESS):"
curl -s -X GET $BASE_URL/wallet/$RECIPIENT_ADDRESS/balance | jq .
echo ""

read -p "Press Enter to check blockchain statistics..."

echo "--- 7. Checking Blockchain Statistics ---"
echo "Blockchain Summary:"
curl -s -X GET $BASE_URL/stats/summary | jq .
echo ""

echo "Latest 3 Blocks:"
curl -s -X GET "$BASE_URL/blocks/latest?limit=3" | jq .
echo ""

echo "Latest 3 Transactions:"
curl -s -X GET "$BASE_URL/transactions/latest?limit=3" | jq .
echo ""

echo "--- Test Complete ---"
