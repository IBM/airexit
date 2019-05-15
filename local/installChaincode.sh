#!/bin/bash
set -ex

LANGUAGE="golang"
docker_prefix='docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode'

echo "Copying Chaincode to cli container"
docker exec cli mkdir -p /opt/gopath/src/github.com/airexit
docker cp ../chaincode/. cli:/opt/gopath/src/github.com/airexit/

if [ -z "$1" ] ; then
  echo "Install and Instantiate Chaincode"
  chaincode_version="1.0"
  $docker_prefix install -n airexit -v $chaincode_version -p github.com/airexit
  $docker_prefix instantiate -o orderer.example.com:7050 -C mychannel -n airexit -v $chaincode_version -c '{"Args":["101"]}'

else
  echo "Install and Upgrade Chaincode"
  chaincode_version=$1
  $docker_prefix install -n airexit -v $chaincode_version -p github.com/airexit
  $docker_prefix upgrade -o orderer.example.com:7050 -C mychannel -n airexit -v $chaincode_version -c '{"Args":["101"]}'
fi

sleep 5

echo "Chaincode Instantiated"
docker_invoke_prefix="$docker_prefix invoke -o orderer.example.com:7050 -C mychannel -n airexit -c"

$docker_invoke_prefix '{"Args":["init_traveller", "kalonji", "bankole", "1234", "US"]}'
sleep 2
$docker_invoke_prefix '{"Args":["init_reservation", "lg7cl24xrhjusya3yx", "1234", "AA", "LAX", "NYC", "1"]}'
sleep 2
$docker_invoke_prefix '{"Args":["add_event", "123456", "041819", "delta", "checkin", "LAX", "1234", "faceinfo", "res1"]}'
sleep 2
# $docker_invoke_prefix '{"Args":["get_everything"]}'

# echo "Install and Instantiate Chaincode"
# docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode install -n airexit -v 1.0 -p github.com/airexit
# docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode instantiate -o orderer.example.com:7050 -C mychannel -n airexit -v 1.0 -c '{"Args":["101"]}'
# echo "Chaincode Instantiated"
# sleep 10
# echo "Test Chaincode"
# docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode invoke -o orderer.example.com:7050 -C mychannel -n airexit -c '{"Args":["get_all_events"]}'
