const crypto = require('crypto');
const SensorRecord = require('../models/SensorRecord');

/**
 * Compute SHA-256 hash
 */
function sha256(str) {
  return crypto.createHash('sha256').update(str, 'utf8').digest('hex');
}

/**
 * GET /api/integrity/blocks
 * Return integrity chain blocks for the Data Integrity page
 */
exports.getBlocks = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    const deviceId = req.query.deviceId || 'CONT001';

    const blocks = await SensorRecord.find({ deviceId })
      .sort({ sequence: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    // Return in ascending sequence order for chain display
    blocks.reverse();

    res.json({
      success: true,
      data: blocks.map(b => ({
        blockNumber: b.sequence,
        sequence: b.sequence,
        device: b.deviceType === 'container' ? 'Container ESP32' : 'Driver ESP8266',
        deviceId: b.deviceId,
        timestamp: b.timestamp,
        temperature: b.temperature,
        humidity: b.humidity,
        mq6: b.mq6,
        battery: b.battery,
        solar: b.solarVoltage,
        gps: { lat: b.latitude, lng: b.longitude },
        tamper: b.tamper,
        rawPayload: b.rawPayload || '',
        dataHash: b.dataHash || b.hash || '',
        previousHash: b.previousHash || '0'.repeat(64),
        blockHash: b.blockHash || b.hash || '',
        transmissionStatus: b.transmissionStatus || 'LIVE',
        offlineReplay: b.offlineReplay || false,
        verificationStatus: b.verificationStatus || 'PENDING',
        syncStatus: b.syncStatus,
        receivedAt: b.receivedAt || b.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

/**
 * GET /api/integrity/stats
 * Return integrity statistics computed from real database
 */
exports.getStats = async (req, res) => {
  try {
    const [
      totalRecords,
      verifiedCount,
      failedCount,
      tamperCount,
      offlineReplayedCount,
      pendingOfflineCount,
      latestRecord,
      containerCount,
      driverCount,
    ] = await Promise.all([
      SensorRecord.countDocuments({ deviceType: 'container' }),
      SensorRecord.countDocuments({ deviceType: 'container', verificationStatus: 'VERIFIED' }),
      SensorRecord.countDocuments({ deviceType: 'container', verificationStatus: { $in: ['HASH_MISMATCH', 'INTEGRITY_ERROR', 'CHAIN_BREAK'] } }),
      SensorRecord.countDocuments({ deviceType: 'container', tamper: true }),
      SensorRecord.countDocuments({ deviceType: 'container', offlineReplay: true }),
      SensorRecord.countDocuments({ deviceType: 'container', transmissionStatus: 'OFFLINE_QUEUED' }),
      SensorRecord.findOne({ deviceType: 'container' }).sort({ sequence: -1 }).lean(),
      SensorRecord.distinct('deviceId', { deviceType: 'container' }),
      SensorRecord.distinct('deviceId', { deviceType: 'driver' }),
    ]);

    // Detect sequence gaps
    let sequenceGaps = [];
    if (latestRecord) {
      const allSequences = await SensorRecord.find(
        { deviceId: latestRecord.deviceId },
        { sequence: 1 }
      ).sort({ sequence: 1 }).lean();

      const seqSet = new Set(allSequences.map(r => r.sequence));
      if (allSequences.length > 0) {
        const minSeq = allSequences[0].sequence;
        const maxSeq = allSequences[allSequences.length - 1].sequence;
        for (let s = minSeq; s <= maxSeq; s++) {
          if (!seqSet.has(s)) {
            sequenceGaps.push(s);
          }
        }
      }
    }

    // Get last sync time
    const lastSyncRecord = await SensorRecord.findOne({ deviceType: 'container' })
      .sort({ receivedAt: -1 })
      .lean();

    res.json({
      success: true,
      data: {
        totalRecords,
        verifiedBlocks: verifiedCount,
        integrityFailures: failedCount,
        tamperEvents: tamperCount,
        offlineReplayedRecords: offlineReplayedCount,
        pendingOfflineRecords: pendingOfflineCount,
        currentSequence: latestRecord ? latestRecord.sequence : 0,
        currentSequenceDevice: latestRecord ? (latestRecord.deviceType === 'container' ? 'Container ESP32' : 'Driver ESP8266') : 'N/A',
        containerNodes: containerCount.length,
        driverNodes: driverCount.length,
        totalNodes: containerCount.length + driverCount.length,
        lastSyncTime: lastSyncRecord ? lastSyncRecord.receivedAt : null,
        sequenceGaps,
        networkStatus: 'ONLINE', // Will be updated via MQTT status
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

/**
 * POST /api/integrity/verify
 * Verify the entire hash chain
 */
exports.verifyChain = async (req, res) => {
  try {
    const deviceId = req.body.deviceId || 'CONT001';

    const records = await SensorRecord.find({ deviceId })
      .sort({ sequence: 1 })
      .lean();

    if (records.length === 0) {
      return res.json({
        success: true,
        data: {
          verified: true,
          totalBlocks: 0,
          verifiedBlocks: 0,
          errors: [],
          message: 'No telemetry received',
        },
      });
    }

    const errors = [];
    let verifiedCount = 0;
    let previousBlockHash = '0'.repeat(64);

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const blockErrors = [];

      // 1. Verify data hash (SHA-256 of raw telemetry)
      if (record.rawPayload && record.dataHash) {
        const computedDataHash = sha256(record.rawPayload);
        if (computedDataHash !== record.dataHash) {
          blockErrors.push({
            type: 'DATA_HASH_MISMATCH',
            message: `Data hash mismatch at seq ${record.sequence}`,
            expected: record.dataHash,
            computed: computedDataHash,
          });
        }
      }

      // 2. Verify previous hash linkage
      if (i > 0 && record.previousHash && record.previousHash !== '0'.repeat(64)) {
        if (record.previousHash !== previousBlockHash) {
          blockErrors.push({
            type: 'CHAIN_BREAK',
            message: `Chain break at seq ${record.sequence}: previousHash doesn't match prior block`,
            expected: previousBlockHash,
            found: record.previousHash,
          });
        }
      }

      // 3. Verify block hash
      if (record.blockHash && record.dataHash && record.previousHash) {
        const expectedBlockHash = sha256(
          'seq=' + record.sequence +
          '|dataHash=' + record.dataHash +
          '|previousHash=' + record.previousHash
        );
        if (expectedBlockHash !== record.blockHash) {
          blockErrors.push({
            type: 'BLOCK_HASH_MISMATCH',
            message: `Block hash mismatch at seq ${record.sequence}`,
            expected: expectedBlockHash,
            found: record.blockHash,
          });
        }
      }

      // 4. Detect tamper
      if (record.tamper) {
        blockErrors.push({
          type: 'TAMPER_DETECTED',
          message: `Tamper detected at seq ${record.sequence}`,
        });
      }

      // 5. Check for sequence gaps
      if (i > 0) {
        const expectedSeq = records[i - 1].sequence + 1;
        if (record.sequence !== expectedSeq) {
          // Check if the gap records exist elsewhere (offline replayed)
          for (let s = expectedSeq; s < record.sequence; s++) {
            const gapRecord = records.find(r => r.sequence === s);
            if (!gapRecord) {
              blockErrors.push({
                type: 'SEQUENCE_GAP',
                message: `Missing sequence ${s} between ${records[i - 1].sequence} and ${record.sequence}`,
                missingSequence: s,
              });
            }
          }
        }
      }

      // Update verification status in DB
      const newStatus = blockErrors.length === 0 ? 'VERIFIED' : 'INTEGRITY_ERROR';
      const newTransmission = blockErrors.length === 0
        ? (record.offlineReplay ? 'OFFLINE_REPLAYED' : 'VERIFIED')
        : 'INTEGRITY_ERROR';

      await SensorRecord.updateOne(
        { _id: record._id },
        {
          $set: {
            verificationStatus: newStatus,
            transmissionStatus: newTransmission,
            syncStatus: blockErrors.length === 0 ? 'verified' : 'failed',
          },
        }
      );

      if (blockErrors.length === 0) {
        verifiedCount++;
      } else {
        errors.push({
          sequence: record.sequence,
          blockNumber: record.sequence,
          errors: blockErrors,
        });
      }

      // Update chain reference
      previousBlockHash = record.blockHash || record.hash || record.dataHash || '0'.repeat(64);
    }

    res.json({
      success: true,
      data: {
        verified: errors.length === 0,
        totalBlocks: records.length,
        verifiedBlocks: verifiedCount,
        failedBlocks: errors.length,
        errors,
        message: errors.length === 0
          ? `All ${records.length} blocks verified successfully`
          : `${errors.length} block(s) failed verification`,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

/**
 * GET /api/integrity/recovery
 * Get offline recovery events
 */
exports.getRecoveryEvents = async (req, res) => {
  try {
    const offlineRecords = await SensorRecord.find({
      deviceType: 'container',
      offlineReplay: true,
    })
      .sort({ sequence: 1 })
      .lean();

    // Group consecutive offline records into recovery events
    const events = [];
    let currentEvent = null;

    for (const record of offlineRecords) {
      if (!currentEvent) {
        currentEvent = {
          startSequence: record.sequence,
          endSequence: record.sequence,
          count: 1,
          records: [record.sequence],
          verified: record.verificationStatus === 'VERIFIED',
          receivedAt: record.receivedAt,
        };
      } else if (record.sequence === currentEvent.endSequence + 1) {
        currentEvent.endSequence = record.sequence;
        currentEvent.count++;
        currentEvent.records.push(record.sequence);
        if (record.verificationStatus !== 'VERIFIED') {
          currentEvent.verified = false;
        }
      } else {
        events.push(currentEvent);
        currentEvent = {
          startSequence: record.sequence,
          endSequence: record.sequence,
          count: 1,
          records: [record.sequence],
          verified: record.verificationStatus === 'VERIFIED',
          receivedAt: record.receivedAt,
        };
      }
    }

    if (currentEvent) {
      events.push(currentEvent);
    }

    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

/**
 * DELETE /api/integrity/reset
 * Reset the Data Integrity logs
 */
exports.resetLogs = async (req, res) => {
  try {
    const { type } = req.body; // 'demo' or 'all'
    
    let query = {}; // To be safe, we could limit to container only, but we'll follow the type
    if (type === 'demo') {
      query.isDemo = true;
    }

    // Delete records matching the query
    const result = await SensorRecord.deleteMany(query);

    res.json({
      success: true,
      data: {
        deletedCount: result.deletedCount,
        message: type === 'demo' ? 'Demo records cleared' : 'All Data Integrity logs cleared'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

/**
 * POST /api/integrity/demo
 * Create a demo telemetry record
 */
exports.createDemoRecord = async (req, res) => {
  try {
    const data = req.body;
    
    // Server-side hash computation for demo
    const rawString = JSON.stringify(data);
    const serverDataHash = sha256(rawString);

    let transmissionStatus = data.offlineReplay ? 'OFFLINE_REPLAYED' : (data.transmissionStatus || 'LIVE');

    const record = new SensorRecord({
      deviceType: 'container',
      deviceId: data.deviceId || 'CONT001',
      containerId: data.containerId || 'CONT001',
      shipmentId: data.shipmentId || 'SHIP001',
      sequence: data.sequence,
      timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
      temperature: data.temperature,
      humidity: data.humidity,
      mq6: data.mq6,
      battery: data.battery,
      solarVoltage: data.solar,
      tamper: data.tamper || false,
      hash: serverDataHash,
      dataHash: serverDataHash,
      rawPayload: rawString,
      transmissionStatus: transmissionStatus,
      offlineReplay: data.offlineReplay || false,
      verificationStatus: 'PENDING',
      isDemo: true,
      receivedAt: new Date(),
    });

    await record.save();
    
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};
