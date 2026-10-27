/**
 * FITFUSION VTON API Routes
 */

import { Router } from 'express';
import { getVTONStatus, getAnyWearStatus, executeTryOn } from '../controllers/vtonController.js';

const router = Router();

router.get('/status', getVTONStatus);
router.get('/anywear/status', getAnyWearStatus);
router.post('/try-on', executeTryOn);
router.post('/tryon', executeTryOn);

export default router;
