const statesData = require('../model/statesData.json');

const verifyState = (req, res, next) => {
  const stateAbbr = req.params.state.toUpperCase();
  const state = statesData.find(st => st.code === stateAbbr);

  if (!state) {
    return res.status(400).json({ error: 'Invalid state abbreviation parameter' });
  }

  req.stateCode = stateAbbr;
  req.stateData = state;
  next();
};

module.exports = verifyState;
