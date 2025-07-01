import {assertNotNull} from '@subsquid/util-internal'
import {
    BlockHeader,
    DataHandlerContext,
    EvmBatchProcessor,
    EvmBatchProcessorFields,
    Log as _Log,
    Transaction as _Transaction,
} from '@subsquid/evm-processor'
import * as erc20 from './abi/ERC20'



const CORE_TOKEN_ADDRESS = "0x191E94fa59739e188dcE837F7f6978d84727AD01";
const CORE_RPC_URL =  "https://rpc.coredao.org";



export const processor = new EvmBatchProcessor()
  .setGateway('https://v2.archive.subsquid.io/network/core-mainnet')
  .setRpcEndpoint({
    url:CORE_RPC_URL,
    rateLimit:10
  })
  .setFinalityConfirmation(75)
  .setFields({
    log: {
      topics: true,
      data: true,
      transactionHash: true,
    },
  })
  .setBlockRange({
    from: 0 // Replace with block number near CORE token contract deployment
  })
  .addLog({
    address: [CORE_TOKEN_ADDRESS.toLowerCase()],
    topic0: [erc20.events.Transfer.topic],
  });


export type Fields = EvmBatchProcessorFields<typeof processor>
export type Block = BlockHeader<Fields>
export type Log = _Log<Fields>
export type Transaction = _Transaction<Fields>
export type ProcessorContext<Store> = DataHandlerContext<Store, Fields>
