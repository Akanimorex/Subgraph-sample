import { processor } from './processor';
import { TypeormDatabase } from '@subsquid/typeorm-store';
import * as erc20 from './abi/ERC20';
import { Transfer } from './model';

const CORE_TOKEN_ADDRESS = '0x191E94fa59739e188dcE837F7f6978d84727AD01';

try {
  processor.run(new TypeormDatabase(), async (ctx) => {
    const transfers: Transfer[] = [];

    for (let block of ctx.blocks) {
      for (let log of block.logs) {
        if (
          log.address.toLowerCase() === CORE_TOKEN_ADDRESS.toLowerCase() &&
          log.topics[0] === erc20.events.Transfer.topic
        ) {
          try {
            const { src, dst, wad } = erc20.events.Transfer.decode(log);
            transfers.push(
              new Transfer({
                id: `${log.transaction?.hash}-${log.logIndex}`,
                from: src,
                to: dst,
                amount: wad,
                transactionHash: log.transaction?.hash,
                blockNumber: block.header.height,
                timestamp: new Date(block.header.timestamp),
              })
            );
          } catch (decodeError) {
            console.error(`Error decoding log at block ${block.header.height}, log index ${log.logIndex}:`, decodeError);
          }
        }
      }
    }

    try {
      await ctx.store.save(transfers);
      console.log(`Saved ${transfers.length} transfers at block ${ctx.blocks[ctx.blocks.length - 1]?.header.height}`);
    } catch (saveError) {
      console.error('Error saving transfers:', saveError);
    }
  });
} catch (error) {
  console.error('Error starting processor:', error);
  throw error;
}