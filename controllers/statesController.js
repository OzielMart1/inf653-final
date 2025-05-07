const State = require('../model/States');
const statesData = require('../model/statesData.json');
const statesController = require('../controllers/statesController');


const getAllStates = async(req,res) =>{
    const contig = req.query.contig;
    let filteredStates = statesData;

    if(contig==='true'){
        filteredStates = statesData.filter(st => st.code !== 'AK' && st.code !== 'HI');
    }else if(contig === 'false'){
        filteredStates = statesData.filter(st => st.code === 'AK' || st.code === 'HI');
    }

    //Merge fun facts from MongoDb
    const dbStates = await State.find();
    const enrichedStates = filteredStates.map(state =>{
        const match = dbStates.find(db => db.stateCode === state.code);
        if(match && match.funfacts?.length>0){
            return {...state, funfacts: match.funfacts};
        }
        return state;
    });

    res.json(enrichedStates);
};

const getState = (req, res) =>{
    const stateCode = req.params.state.toUpperCase();
    const state = statesData.find(state => state.code === stateCode.toUpperCase());

    if(state){
        res.json(state);
    }else{
        res.status(404).json({error: "State not found"});
    }
};

// Example: Get state capital
const getCapital = (req, res) => {
    const stateCode = req.params.state;
    const state = statesData.find(state => state.code === stateCode);

    if (state) {
        res.json({ state: state.name, capital: state.capital_city });
    } else {
        res.status(404).json({ error: "State not found" });
    }
};

// Example: Get state nickname
const getNickname = (req, res) => {
    const stateCode = req.params.state;
    const state = statesData.find(state => state.code === stateCode);

    if (state) {
        res.json({ state: state.name, nickname: state.nickname });
    } else {
        res.status(404).json({ error: "State not found" });
    }
};

// Example: Get population of state
const getPopulation = (req, res) => {
    const stateCode = req.params.state;
    const state = statesData.find(state => state.code === stateCode);

    if (state) {
        res.json({ state: state.name, population: state.population });
    } else {
        res.status(404).json({ error: "State not found" });
    }
};

// Example: Get admission date
const getAdmission = (req, res) => {
    const stateCode = req.params.state;
    const state = statesData.find(state => state.code === stateCode);

    if (state) {
        res.json({ state: state.name, admissionDate: state.admission_date });
    } else {
        res.status(404).json({ error: "State not found" });
    }
};

const getRandomFunFact = async (req, res) => {
    const stateCode = req.params.state.toUpperCase();
    const state = statesData.find(st => st.code === stateCode);
    if (!state) return res.status(404).json({ error: "State not found" });

    const dbState = await State.findOne({ stateCode });
    if (!dbState || !dbState.funfacts || dbState.funfacts.length === 0) {
        return res.status(404).json({ error: `No Fun Facts found for ${state.name}` });
    }

    const randomFact = dbState.funfacts[Math.floor(Math.random() * dbState.funfacts.length)];
    res.json({ funfact: randomFact });
};

// Placeholder functions for add, update, and delete (you will need to implement these)
const addFunFact = async (req, res) => {
    const stateCode = req.params.state.toUpperCase();

    // Validate input
    if (!req.body.funfacts || !Array.isArray(req.body.funfacts)) {
        return res.status(400).json({ error: 'funfacts must be an array' });
    }

    try {
        let state = await State.findOne({ stateCode });

        // If state not in MongoDB, create a new one
        if (!state) {
            state = new State({ stateCode, funfacts: req.body.funfacts });
        } else {
            // Append new funfacts
            state.funfacts = [...state.funfacts, ...req.body.funfacts];
        }

        await state.save();
        res.status(201).json(state);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

const updateFunFact = async (req, res) => {
    // Implementation for updating fun facts
    const stateAbbr = req.params.state.toUpperCase();
    const { index,funfact } = req.body;

    if(index === undefined || funfact === undefined){
        return res.status(400).json({message: 'State fun fact index and new fact are required.'});
    }
    try{
        const stateDoc = await State.findOne({ stateCode: stateAbbr });

        if (!stateDoc || !stateDoc.funfacts || !stateDoc.funfacts.length ){
            return res.status(404).json({message: `No Fun Facts found for ${stateAbbr}`});
        }
        if(index< 0 || index>= stateDoc.funfacts.length){
            return res.status(400).json({ message: `Invalid index ${index} for fun facts of ${stateAbbr}`});
        }
        
        stateDoc.funfacts[index] = funfact;
        await stateDoc.save();
        
        res.json(stateDoc);
    }catch(err){
        console.error(err);
        res.status(500).json({message: 'Server error'});
    }

};

const deleteFunFact = async (req, res) => {
    // Implementation for deleting fun facts
    const stateAbbr = req.params.state.toUpperCase();
    const {index } = req.body;

    if(index === undefined){
        return res.status(400).json({ message: 'State fun fact index is required. '});
    }

    try{
        const stateDoc = await State.findOne({ stateCode: stateAbbr});
        if(!stateDoc || !stateDoc.funfacts || !stateDoc.funfacts.length){
            return res.status(404).json({message: `No Fun Facts found for ${stateAbbr}`});
        }
        if(index < 0 || index >= stateDoc.funfacts.length){
            return res.status(400).json({ message: `Invalid index ${index} for fun facts of ${stateAbbr}`});

        }
        stateDoc.funfacts.splice(index,1);
        await stateDoc.save();

        res.json(stateDoc);
    }catch(err){
        console.error(err);
        res.status(500).json({message : 'Server Error'});
    }
};

// Exporting the functions to be used in the routes
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
