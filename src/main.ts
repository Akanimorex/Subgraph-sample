import { processor } from './processor';
import { TypeormDatabase } from '@subsquid/typeorm-store';
import * as erc20 from './abi/ERC20';
import { Transfer } from './model';

const CORE_TOKEN_ADDRESS = '0x191E94fa59739e188dcE837F7f6978d84727AD01';

processor.run(new TypeormDatabase(), async (ctx) => {
  const transfers: Transfer[] = [];

  for (let block of ctx.blocks) {
    for (let log of block.logs) {
      if (
        log.address.toLowerCase() === CORE_TOKEN_ADDRESS.toLowerCase() &&
        log.topics[0] === erc20.events.Transfer.topic
      ) {
        const { src, dst, wad } = erc20.events.Transfer.decode(log);
        transfers.push(
          new Transfer({
            id: `${log.transaction?.hash}-${log.logIndex}`,
            from: src,
            to: dst,
            amount: wad, // Convert BigNumber to string for TypeORM
            transactionHash: log.transaction?.hash,
            blockNumber: block.header.height,
            timestamp: new Date(block.header.timestamp),
          })
        );
      }
    }
  }

  await ctx.store.save(transfers);
});