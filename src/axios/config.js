let retrievalService = 'dataretrieve.idvxlab.com';

// let urlPrefix = process.env.NODE_ENV === 'production' ? `https://${retrievalService}:8008` : 'http://localhost:6060'
let urlPrefix = `https://${retrievalService}:8011` 

const config = {
    url: {
        decompose: `${urlPrefix}/decompose`,
        retrieve: `${urlPrefix}/retrieve`, 
        retrieveByQuery: `${urlPrefix}/retrieveByQuery`,
        datafact: `${urlPrefix}/datafact`, 
        update: `${urlPrefix}/update`, 
        updateQuery: `${urlPrefix}/updateQuery`,
        storeFacts: `${urlPrefix}/storeFacts`,
        loadFacts: `${urlPrefix}/loadFacts`,
        retrieveTest: `${urlPrefix}/retrieveTest`
    }
}

export default config