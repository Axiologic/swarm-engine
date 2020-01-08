require('../../psknode/bundles/pskruntime');
require('../../psknode/bundles/psknode');

const blockchain = require("blockchain");
const blockchainStorageFolder = '../../conf';

const worldStateCache = blockchain.createWorldStateCache("fs", blockchainStorageFolder);
const historyStorage = blockchain.createHistoryStorage("fs", blockchainStorageFolder);
const consensusAlgorithm = blockchain.createConsensusAlgorithm("direct");
const signatureProvider = blockchain.createSignatureProvider("permissive");

blockchain.createBlockchain(worldStateCache, historyStorage, consensusAlgorithm, signatureProvider, true, false);


$$.blockchain.start(() => {
    let domainReference = $$.asset.start("DomainReference", "init", 'system', 'local');
    domainReference.setConstitution('../bundles/domain.js');
    domainReference.setWorkspace('../../');

    let domainConfig = $$.asset.start('DomainConfig', 'init', 'local');
    domainConfig.setBlockChainStorageFolderName('conf');
    domainConfig.addCommunicationInterface('system', 'http://127.0.0.1:8080', 'tcp://127.0.0.1:5000');

    const transaction = $$.blockchain.beginTransaction(domainReference);
    transaction.add(domainReference);
    transaction.add(domainConfig);

    $$.blockchain.commit(transaction);

});