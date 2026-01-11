/**
 * Stream Keeper Service
 * Monitors streams and automatically claims completed ones
 */

import { ethers } from 'ethers';
import pino from 'pino';

const logger = pino({ name: 'stream-keeper' });

// Stream Manager ABI (minimal for keeper)
const STREAM_MANAGER_ABI = [
  'function claim(uint256 streamId) external',
  'function claimStreamsBatch(uint256[] calldata streamIds) external',
  'function getStreamableAmounts(uint256 streamId) external view returns (address[] memory tokens, uint256[] memory amounts)',
  'function streams(uint256) external view returns (address sender, address recipient, uint256 startTime, uint256 duration, uint256 stopTime, uint256 lastClaimed, bool isActive, bool isPaused, uint256 pauseStart, uint256 pausedDuration)',
  'function streamCounter() external view returns (uint256)',
  'event StreamCreated(uint256 indexed streamId, address indexed sender, address indexed recipient, address[] tokens, uint256[] totalAmounts, uint256 startTime, uint256 duration)',
  'event Claimed(uint256 indexed streamId, address indexed recipient, address indexed token, uint256 amount)'
];

interface StreamInfo {
  streamId: number;
  sender: string;
  recipient: string;
  startTime: number;
  duration: number;
  isActive: boolean;
  claimableAmount: bigint;
}

export class StreamKeeperService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private streamManager: ethers.Contract;
  private isRunning: boolean = false;
  private checkInterval: number = 60000; // Check every 60 seconds

  constructor(
    rpcUrl: string,
    privateKey: string,
    streamManagerAddress: string,
    checkIntervalMs: number = 60000
  ) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.streamManager = new ethers.Contract(
      streamManagerAddress,
      STREAM_MANAGER_ABI,
      this.wallet
    );
    this.checkInterval = checkIntervalMs;
  }

  /**
   * Start the keeper service
   */
  async start() {
    if (this.isRunning) {
      logger.warn('Stream keeper already running');
      return;
    }

    this.isRunning = true;
    logger.info('Stream keeper service started');

    // Run immediately on start
    await this.checkAndClaimStreams();

    // Then run on interval
    setInterval(async () => {
      if (this.isRunning) {
        await this.checkAndClaimStreams();
      }
    }, this.checkInterval);
  }

  /**
   * Stop the keeper service
   */
  stop() {
    this.isRunning = false;
    logger.info('Stream keeper service stopped');
  }

  /**
   * Check all streams and claim completed ones
   */
  private async checkAndClaimStreams() {
    try {
      logger.info('Checking for claimable streams...');

      const streamCount = await this.streamManager.streamCounter();
      const claimableStreams: number[] = [];

      // Check each stream
      for (let i = 1; i <= Number(streamCount); i++) {
        try {
          const isClaimable = await this.isStreamClaimable(i);
          if (isClaimable) {
            claimableStreams.push(i);
          }
        } catch (err) {
          logger.debug({ streamId: i, error: err }, 'Error checking stream');
        }
      }

      if (claimableStreams.length === 0) {
        logger.info('No claimable streams found');
        return;
      }

      logger.info({ count: claimableStreams.length, streamIds: claimableStreams }, 'Found claimable streams');

      // Claim streams in batches of 10
      const batchSize = 10;
      for (let i = 0; i < claimableStreams.length; i += batchSize) {
        const batch = claimableStreams.slice(i, i + batchSize);
        await this.claimStreamBatch(batch);
      }
    } catch (error) {
      logger.error({ error }, 'Error in checkAndClaimStreams');
    }
  }

  /**
   * Check if a stream is ready to be claimed
   */
  private async isStreamClaimable(streamId: number): Promise<boolean> {
    try {
      const stream = await this.streamManager.streams(streamId);
      
      // Skip inactive or paused streams
      if (!stream.isActive || stream.isPaused) {
        return false;
      }

      // Check if stream has ended
      const now = Math.floor(Date.now() / 1000);
      const endTime = Number(stream.startTime) + Number(stream.duration);
      
      if (now < endTime) {
        return false; // Stream not finished yet
      }

      // Check if there's anything to claim
      const [tokens, amounts] = await this.streamManager.getStreamableAmounts(streamId);
      
      // If any token has claimable amount > 0, it's claimable
      for (const amount of amounts) {
        if (amount > 0n) {
          return true;
        }
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Claim a batch of streams
   */
  private async claimStreamBatch(streamIds: number[]) {
    try {
      logger.info({ streamIds }, 'Claiming stream batch');

      const tx = await this.streamManager.claimStreamsBatch(streamIds, {
        gasLimit: 2000000 * streamIds.length // Higher gas limit for safety
      });

      logger.info({ txHash: tx.hash, streamIds }, 'Claim transaction submitted');

      const receipt = await tx.wait();
      
      logger.info(
        { txHash: receipt.hash, streamIds, gasUsed: receipt.gasUsed.toString() },
        'Streams claimed successfully'
      );
    } catch (error: any) {
      logger.error({ error: error.message, streamIds }, 'Failed to claim streams');
    }
  }

  /**
   * Get all claimable streams for a specific recipient
   */
  async getClaimableStreamsForRecipient(recipient: string): Promise<number[]> {
    try {
      const streamCount = await this.streamManager.streamCounter();
      const claimableStreams: number[] = [];

      for (let i = 1; i <= Number(streamCount); i++) {
        try {
          const stream = await this.streamManager.streams(i);
          
          if (stream.recipient.toLowerCase() === recipient.toLowerCase() && stream.isActive) {
            const isClaimable = await this.isStreamClaimable(i);
            if (isClaimable) {
              claimableStreams.push(i);
            }
          }
        } catch (err) {
          // Skip errors
        }
      }

      return claimableStreams;
    } catch (error) {
      logger.error({ error, recipient }, 'Error getting claimable streams');
      return [];
    }
  }
}

// Singleton instance
let keeperInstance: StreamKeeperService | null = null;

export function initializeKeeper(
  rpcUrl: string,
  privateKey: string,
  streamManagerAddress: string,
  autoStart: boolean = true
): StreamKeeperService {
  if (!keeperInstance) {
    keeperInstance = new StreamKeeperService(rpcUrl, privateKey, streamManagerAddress);
    
    if (autoStart) {
      keeperInstance.start();
    }
  }
  
  return keeperInstance;
}

export function getKeeperInstance(): StreamKeeperService | null {
  return keeperInstance;
}
