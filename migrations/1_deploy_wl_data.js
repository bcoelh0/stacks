var WhitelistData = artifacts.require("./WhitelistData.sol");

var DATA = [
  '0x177f44eCDEa293f7124C3071D9C54E59fcfD16f9',
  '0x00666CbD454108b4211380412b75DB17FEF89D46',
  '0xaf7A9f4b0b1b19337993335e87b99720d1340EE1',
  '0x7f1E28b97c5373E0C6886eCa1c128f80412f9c56',
  '0x934AE6cCb5f413D9DFCb4171A54ECeCf1c0dA782',
  '0xb1776C152080228214c2E84e39A93311fF3c03C1',
  '0x35D1D7DdAa613234a93A10001EfD956ca9FF6BD1',
  '0x12f1412fECBf2767D10031f01D772d618594Ea28',
  '0x3c4466B0C351D1898e7bD591b1Cb4515090B7a38',
  '0x1b021D4Af6A3F98F0FfCc84E767Df2eA512c91A1',
  '0x454Ae0489Fa5D6207B5640cad0b9a13147eA7e29',
  '0x6F9ceE855cB1F362F31256C65e1709222E0f2037',
  '0x43e4A24f41fb0726b97B4a35433346Ac2B3Dda0f',
  '0xA7ecaCd4D1438C24Ed13795685037Abc81B4A0Ad',
  '0x817076e023d37e3728cb3800336C36E8E035C23D',
  '0x86c5458937E51407b0AF86ebF5cF9305B0038a7e',
  '0x6917e79388F89BD2a23C5d472f23cA2499B2372D',
  '0x33d94169b123A26F906F85a9A37fDd997f3f1d80',
  '0xdAc2d756eD90854737756f1Be3Ba267aaFc658eE',
  '0x92E2B4EA9513cE44B2ce24dE6243a4Fc5A75cD71',
  '0x654794CCb564b29CCa08ABD1627D388984746964',
  '0x95b05F935655c37ADa2088c5767E5006f230B068',
  '0x6f6cfe32bd425C8Dbd27265ECc1773B4C0bAC148',
  '0xf9cF263e79eaEc3743f89684112e3A3315622eB4',
  '0x5f951483C6Bc7F4146EEe0Ab2cF916CA165889Ef',
  '0x2481Fef92F6358A410f4B42a7672f23CaC514c2A',
  '0x30c7B3ccC6C6B8f09e417C8769efAb8c008f2d7E',
  '0xf5eFC8dff4308DEC537e5FCA6630ADDa51D8eE8b',
  '0xa9080550F1b8fAE7f49cFA9CC063B99bF39C10e9',
  '0xd44Fb1b14F98D29d50316703227e937fB58E792D',
  '0x47EcECF3A1D9E2bDe930d20aE8024d4D0CF907D0',
  '0xf0Fd178026BF74e75fC640a2f3935556A2d5848c',
  '0x8F171F28d86FB450608C92DafcB4Ac9C855071df',
  '0x578241ED8b42d4a539651D5CEb942cCc4e61318A',
  '0x0F7A2Eb5DfE07f58B73F2a61094BBD3541D3c520',
  '0xE6a9F1154C2B6038746eAbaD9640B2C3dAad8768',
  '0xc2087769027d33F881687bA90734E35c5fA93dB3',
  '0x6B9Dc8090b9fCcfDc8Ddb66e0C33B80409d9f5ad',
  '0x9a6de62ffE24786D0809F21D2B38DfccB5598f41',
  '0xA0530B7286301238AD0906EFB054F938C1e7f7Ad',
  '0xc1aE72cbCF2D60Ab04Eb7798BAA8a07286091410',
  '0x5cdb8395583a18b2b147113203668eC3845Ff39f',
  '0x79776e76Ce4eD59FfAE1AF26c9095bA68caFE7da',
  '0xFb7465184A52d6672aCc4b6b27FF3aE260f33C00',
  '0xc82e413556E81d276C27f12a6Ec039d5234D2269',
  '0x2e7B1e736Ea03B1A97b9C905968F355Ca59dD0Be',
  '0x9bE8302D10dFb2F756a3F60E6d25E527D7787259',
  '0xBF44D3AC8C08EE06C6bA75a6fe8f2d86F7B1a9eB',
  '0xFc0227643EBe85D22E2Cf3f1C38A0fdAd05B3570',
  '0x1073d434705Cac6CFc0260aEB2fDc57025e200F1',
  '0xF2bA3607932c3FB329cD249fa01fF030BDbF3EFE',
  '0x68edF87f2C356CCf7B94d8b9bD6b615Ffc485a92',
  '0x9eC0276671BFe813dD35d18f7Fd8ce0c0b871859',
  '0x147d6A47F1b6c1a2C2d24E19C88191d800f77416',
  '0xE4495842d915738D659609727a51E39d15b66778',
  '0x5B37C656909a0Ba303bA4b0126c67CBeC299724b',
  '0x01e6694700Fcea08883a6378d4AD82441BfE4217',
  '0xd7C89ceD6F23460B922F257aE509dc32b19edbba',
  '0xf96ECB27Ab19515f809FE6c825dFDFf157D5bc84',
  '0x6dE8EC82BFd6f1Aa1Fe3d86aD9D6698298676f81',
  '0x740790c25DE645Bba36Dcd190255f75A3d43ab0E',
  '0x0cCFaAC13324f34D59D63a7578Fe3Ac3c5734726',
  '0x58E711C0A4f28Ce553Ceb77a9fC0eEfe55a473e4',
  '0x81A1EA5A462ba21A328d206d4c15A7Af8812ad3c',
  '0x18863e51dfe20f14b7f710230fd9eF78EA6F39A0',
  '0x9D374D3D5f9cE1f388994c98D7279BD1B4f87b33',
  '0x14515cF28e3501Dc70b2FF8d41B598a3f108Ce9b',
  '0x9aCf8D0315094d33Aa6875B673EB126483C3A2c0',
  '0x98E073b579FD483EaC8f10d5bd0B32C8C3BBD7e0',
  '0x9df80329680718D269D7926d3375Fe08C829D4E5',
  '0x8a6ab47B1B794275c9e4D931e1F096DE117D775C',
  '0xAe433fE9a51eF38a10FE19E277A62d4D336f4a42',
  '0xAdBcC370f713Bd0FE7295277A76cb8d9183A2218',
  '0x384A9d93752Ab9DF9794E3EF9Cb1c8710DCb8a25',
  '0xB5aA1fbda10C8f7E95924A92303654e512b3CF68',
  '0x26B09D33270b0c884Ab9366e624F597F4cD6E388',
  '0x74c9435FF3c4292A8bCC1eAb8f097970869d2588',
  '0x4bb55e4fcE1FA8B20EE1824003AFEB77E4F0E699',
  '0xE1B96c5850075bc2cfaA845723971709Dd395eC8',
  '0x9ddc87248bFB7450C1576E782FB69e954b82788B',
  '0xfd86C8436B4A7BC57ADb68409c27d910809A523D',
  '0xD9D836EBC67Abeec65b29E586F89816Dab991F69',
  '0x846E8C13bD0EC23Fe00eEA1D244f604303A73B97',
  '0x199c619177005091B8A5E4C3e96ea692DfAe4FA8',
  '0xDe11583339dC304d11b71bb6F216FbaF4C9EA296',
  '0xB1d25aCf83B458E68Fe39E1A42cDcC76521d17a8',
  '0xcB65B3D282d57CCd41607392CDBA1429835034AC',
  '0x87613d46EA76F3A2e4C783cFF0141Aaba17c10E9',
  '0x269Db3bEaFC0Db5eAFCb3AD648317b2fDeeE61dF',
  '0x930c99a1574b57dABdB39Dc879BEe46dB9e7Ea56',
  '0x22b3Fee44b5eFD180005c9d02dc6E6df7694e0fD',
  '0x59a472362E4b8289B369bc370940e1fc78532226',
  '0x5665785813011A5c37c10972f8d3D463441637C3',
  '0x4d72D4269Ab46962713ca19cAb8161A87684A163',
  '0x589803DFa267DA06dF06CA9c8F64c3ccB0197Fb6',
  '0xdbB1Df190E0A3067A226Ab185084f6a9C3EB1091',
  '0x41eD288dbF8493310D2bd57067C226a96610D2F9',
  '0x98802D8D6Bb3a97ae916EF36D71C1b7460eDc128',
  '0x678906C679b9fc0e5c64CFf7b3Ee65F8cb7BB9ab',
  '0xA42F02956cE6609923F320EcB89DcF052ad6849F',
  '0xAceCFe57C2966b4506Fd32fcAf19572DE31f31b3',
  '0x1616eCDd3DC368f4970A93eC32bf12176c9E9Fe5',
  '0xb44c7cca1d3Ca039a5C54EFD5801FE5121Ca1cEf',
  '0xB79F7532C6eEa783dF96653a0261Be27A5612EC1',

  '0x28284Ac2D065eBe3496E8b892310526E1989009F',
  // '0x199B0717252A86900D857490b6BaFE641683e5c8',

  '0xf6E2Fc6E25bDE4Ac7191aED8D4860C2E52abf702',
  '0x6C5eBd3059f901e74d9F4a879c9e8ba6658f1cD6',
  '0xAD60C5043058571B42AB87C2fbF3578e8D8F612f',
  '0x355E055D2A91f41b64Dd69901D0A06cC978CF9DE',
  '0x45D5aB9FC211Ef87a44E305cF3d3C783F6648898'
]

module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(WhitelistData)
  let wlData = await  WhitelistData.deployed()

  let tx = await wlData.bulkAddWhitelistAccounts(DATA)
  console.log(tx.tx)
};