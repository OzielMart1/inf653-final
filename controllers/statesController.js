const State = require('../model/States');
const statesData = require('../model/statesData.json');

const getAllStates = async (req, res) => {
    const contig = req.query.contig;
    let filteredStates = statesData;

    if (contig === 'true') {
        filteredStates = statesData.filter(st => st.code !== 'AK' && st.code !== 'HI');
    } else if (contig === 'false') {
        filteredStates = statesData.filter(st => st.code === 'AK' || st.code === 'HI');
    }

    const dbStates = await State.find();
    const enrichedStates = filteredStates.map(state => {
        const match = dbStates.find(db => db.stateCode === state.code);
        if (match && match.funfacts?.length > 0) {
            return { ...state, funfacts: match.funfacts };
        }
        return state;
    });

    res.json(enrichedStates);
};

const getState = async (req, res) => {
    const stateCode = req.params.state.toUpperCase();
    const state = statesData.find(state => state.code === stateCode);

    if (!state) {
        return res.status(404).json({ message: 'Invalid state abbreviation parameter' });
    }

    const dbState = await State.findOne({ stateCode });
    if (dbState?.funfacts?.length > 0) {
        state.funfacts = dbState.funfacts;
    }

    res.json(state);
};

const getCapital = (req, res) => {
    const stateCode = req.params.state.toUpperCase();
    const state = statesData.find(state => state.code === stateCode);

    if (state) {
        res.json({ state: state.state, capital: state.capital_city });
    } else {
        res.status(404).json({ message: 'Invalid state abbreviation parameter' });
    }
};

const getNickname = (req, res) => {
    const stateCode = req.params.state.toUpperCase();
    const state = statesData.find(state => state.code === stateCode);

    if (state) {
        res.json({ state: state.state, nickname: state.nickname });
    } else {
        res.status(404).json({ message: 'Invalid state abbreviation parameter' });
    }
};

const getPopulation = (req, res) => {
    const stateCode = req.params.state.toUpperCase();
    const state = statesData.find(state => state.code === stateCode);

    if (state) {
        res.json({ state: state.state, population: state.population.toLocaleString() });
    } else {
        res.status(404).json({ message: 'Invalid state abbreviation parameter' });
    }
};

const getAdmission = (req, res) => {
    const stateCode = req.params.state.toUpperCase();
    const state = statesData.find(state => state.code === stateCode);

    if (state) {
        res.json({ state: state.state, admitted: state.admission_date });
    } else {
        res.status(404).json({ message: 'Invalid state abbreviation parameter' });
    }
};

const getRandomFunFact = async (req, res) => {
    const stateCode = req.params.state.toUpperCase();
    const state = statesData.find(st => st.code === stateCode);
    if (!state) return res.status(404).json({ message: 'Invalid state abbreviation parameter' });

    const dbState = await State.findOne({ stateCode });
    if (!dbState || !dbState.funfacts || dbState.funfacts.length === 0) {
        return res.status(404).json({ message: `No Fun Facts found for ${state.state}` });
    }

    const randomFact = dbState.funfacts[Math.floor(Math.random() * dbState.funfacts.length)];
    res.json({ funfact: randomFact });
};

const addFunFact = async (req, res) => {
    const stateCode = req.params.state.toUpperCase();
    const { funfacts } = req.body;

    // Case: funfacts is missing or empty
    if (!funfacts || (Array.isArray(funfacts) && funfacts.length === 0)) {
        return res.status(400).json({ message: 'State fun facts value required' });
    }

    // Case: funfacts exists but is not an array
    if (!Array.isArray(funfacts)) {
        return res.status(400).json({ message: 'State fun facts value must be an array' });
    }

    try {
        let state = await State.findOne({ stateCode });

        if (!state) {
            state = new State({ stateCode, funfacts });
        } else {
            state.funfacts = [...state.funfacts, ...funfacts];
        }

        await state.save();
        res.status(201).json(state);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateFunFact = async (req, res) => {
  const stateAbbr = req.params.state.toUpperCase();
  const { index, funfact } = req.body;

  // Validate request body
  if (index === undefined) {
    return res.status(400).json({ message: 'State fun fact index value required' });
  }
  if (!funfact || typeof funfact !== 'string') {
    return res.status(400).json({ message: 'State fun fact value required' });
  }

  // Lookup full state name for error messages
  const stateData = statesData.find((st) => st.code === stateAbbr);
  if (!stateData) {
    return res.status(404).json({ message: 'Invalid state abbreviation parameter' });
  }

  try {
    const state = await State.findOne({ stateCode: stateAbbr });
    if (!state || !state.funfacts || state.funfacts.length === 0) {
      return res.status(404).json({ message: `No Fun Facts found for ${stateData.state}` });
    }

    const zeroIndex = index - 1;
    if (zeroIndex < 0 || zeroIndex >= state.funfacts.length) {
      return res.status(404).json({ message: `No Fun Fact found at that index for ${stateData.state}` });
    }

    // Update and save
    state.funfacts[zeroIndex] = funfact;
    const result = await state.save();

    res.json({
      _id: result._id,
      code: result.stateCode,
      funfacts: result.funfacts,
      __v: result.__v
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteFunFact = async (req, res) => {
    const stateAbbr = req.params.state.toUpperCase();
  const { index } = req.body;

  if (index === undefined) {
    return res.status(400).json({ message: 'State fun fact index value required' });
  }

  const stateData = statesData.find((st) => st.code === stateAbbr);
  if (!stateData) {
    return res.status(404).json({ message: 'Invalid state abbreviation parameter' });
  }

  try {
    const state = await State.findOne({ stateCode: stateAbbr });
    if (!state || !state.funfacts || state.funfacts.length === 0) {
      return res.status(404).json({ message: `No Fun Facts found for ${stateData.state}` });
    }

    const zeroIndex = index - 1;

    if (zeroIndex < 0 || zeroIndex >= state.funfacts.length) {
      return res.status(404).json({ message: `No Fun Fact found at that index for ${stateData.state}` });
    }

    // Remove the fun fact at the specified index
    state.funfacts.splice(zeroIndex, 1);
    const result = await state.save();

    res.json({
      _id: result._id,
      code: state.stateCode,
      funfacts: result.funfacts,
      __v: result.__v
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};



module.exports = {
    getAllStates,
    getState,
    getCapital,
    getNickname,
    getPopulation,
    getAdmission,
    getRandomFunFact,
    addFunFact,
    updateFunFact,
    deleteFunFact
};
