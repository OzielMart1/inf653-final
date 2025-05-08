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
    const state = statesData.find(st => st.code === stateCode);
    if (!state) return res.status(404).json({ message: 'Invalid state abbreviation parameter' });

    if (!req.body.funfacts || !Array.isArray(req.body.funfacts)) {
        return res.status(400).json({ message: 'State fun facts value must be an array' });
    }

    try {
        let stateDoc = await State.findOne({ stateCode });

        if (!stateDoc) {
            stateDoc = new State({ stateCode, funfacts: req.body.funfacts });
        } else {
            stateDoc.funfacts = [...stateDoc.funfacts, ...req.body.funfacts];
        }

        await stateDoc.save();
        res.status(201).json(stateDoc);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

const updateFunFact = async (req, res) => {
    const stateCode = req.params.state.toUpperCase();
    const state = statesData.find(st => st.code === stateCode);
    if (!state) return res.status(404).json({ message: 'Invalid state abbreviation parameter' });

    const { index, funfact } = req.body;
    if (index === undefined || funfact === undefined) {
        return res.status(400).json({ message: 'State fun fact index value and fun fact value are required' });
    }

    const dbState = await State.findOne({ stateCode });
    if (!dbState || !dbState.funfacts || dbState.funfacts.length === 0) {
        return res.status(404).json({ message: `No Fun Facts found for ${state.state}` });
    }

    const realIndex = index - 1;
    if (realIndex < 0 || realIndex >= dbState.funfacts.length) {
        return res.status(400).json({ message: `No Fun Fact found at that index for ${state.state}` });
    }

    dbState.funfacts[realIndex] = funfact;
    await dbState.save();

    res.json(dbState);
};

const deleteFunFact = async (req, res) => {
    const stateCode = req.params.state.toUpperCase();
    const state = statesData.find(st => st.code === stateCode);
    if (!state) return res.status(404).json({ message: 'Invalid state abbreviation parameter' });

    const { index } = req.body;
    if (index === undefined) {
        return res.status(400).json({ message: 'State fun fact index value is required' });
    }

    const dbState = await State.findOne({ stateCode });
    if (!dbState || !dbState.funfacts || dbState.funfacts.length === 0) {
        return res.status(404).json({ message: `No Fun Facts found for ${state.state}` });
    }

    const realIndex = index - 1;
    if (realIndex < 0 || realIndex >= dbState.funfacts.length) {
        return res.status(400).json({ message: `No Fun Fact found at that index for ${state.state}` });
    }

    dbState.funfacts.splice(realIndex, 1);
    await dbState.save();

    res.json(dbState);
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
