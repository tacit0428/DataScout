let retrievalService = 'mvcrafter.idvxlab.com';

// let urlPrefix = process.env.NODE_ENV === 'production' ? `https://${retrievalService}:8008` : 'http://localhost:6060'
let urlPrefix = `https://${retrievalService}:8008` 

const config = {
    url: {
        decompose: `${urlPrefix}/decompose`,
        datafact: `${urlPrefix}/datafact`, 
        update: `${urlPrefix}/update`, 
    }
}

export default config