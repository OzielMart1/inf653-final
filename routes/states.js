const express = require('express');
const router = express.Router();
const statesController = require('../controllers/statesController');

//GET routes 
router.get('/', statesController.getAllStates);
router.get('/:state', statesController.getState);
router.get('/:state/capital', statesController.getCapital);
router.get('/:state/nickname', statesController.getNickname);
router.get('/:state/population', statesController.getPopulation);
router.get('/:state/admission', statesController.getAdmission);
router.get('/:state/funfact', statesController.getRandomFunFact);

//Post/ Patch/ Delete
router.post('/:state/funfact', statesController.addFunFact);
router.patch('/:state/funfact', statesController.updateFunFact);
router.delete('/:state/funfact', statesController.deleteFunFact);

module.exports = router;

