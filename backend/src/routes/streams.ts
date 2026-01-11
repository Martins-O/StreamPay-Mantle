import { Router } from 'express';
import { getKeeperInstance } from '../services/streamKeeper.js';

const router = Router();

/**
 * GET /api/streams/claimable/:address
 * Get all claimable streams for a recipient
 */
router.get('/claimable/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    const keeper = getKeeperInstance();
    if (!keeper) {
      return res.status(503).json({ error: 'Stream keeper not initialized' });
    }

    const claimableStreamIds = await keeper.getClaimableStreamsForRecipient(address);
    
    res.json({
      address,
      claimableStreams: claimableStreamIds,
      count: claimableStreamIds.length
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/streams/claim-all/:address
 * Trigger manual claim for all ready streams (for testing/manual trigger)
 */
router.post('/claim-all/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    const keeper = getKeeperInstance();
    if (!keeper) {
      return res.status(503).json({ error: 'Stream keeper not initialized' });
    }

    const claimableStreamIds = await keeper.getClaimableStreamsForRecipient(address);
    
    if (claimableStreamIds.length === 0) {
      return res.json({
        message: 'No claimable streams found',
        claimed: []
      });
    }

    // Note: This endpoint is for testing - in production, the keeper runs automatically
    res.json({
      message: `Found ${claimableStreamIds.length} claimable streams. Keeper will process them automatically.`,
      claimableStreams: claimableStreamIds,
      note: 'The keeper service claims streams automatically every 60 seconds'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
