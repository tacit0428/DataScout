import config from "./config";
import axios from 'axios'

// export async function decomposeQuery(body) {
//     const data = await req.request({
//         url: `${config.url.decompose}`,
//         method: 'post',
//         data: body
//     });
//     return data;
// }

// export async function decomposeQuery(data) {
//     return new Promise((resolve, reject)=>{
//         axios({
//             method: "post",
//             url: `${config.url.decompose}`,
//             config: {
//                 "headers": {
//                     'Content-Type': 'multipart/form-data' //application/json; charset=utf-8
//                 },
//             },
//             data: data
//         }).then((response)=>{
//             console.log('res', response)
//             resolve(response)
//         }).catch(error=>{
//             reject(error)
//         })
//     })
// }

export async function decomposeQuery(query, layer, stance) {
    console.log('api decompose', query, layer, stance)
    return axios({
        method: "post",
        url: `${config.url.decompose}`,
        config: {
            "headers": {
                'Content-Type': 'application/json; charset=utf-8'
            },
        },
        data: {
            "query": query,
            "layer": layer,
            "stance": stance
        }
    })
}

export async function retrieveFacts(statement, query, stance) {
    console.log('api retrieve', statement, query, stance)
    return axios({
        method: "post",
        url: `${config.url.datafact}`,
        config: {
            "headers": {
                'Content-Type': 'application/json; charset=utf-8'
            },
        },
        data: {
            "statement": statement,
            "query": query,
            "stance": stance
        }
    })
}

export async function generateQuery(statement, stance, keywords) {
    console.log('api generatequery', statement, stance, keywords)
    return axios({
        method: "post",
        url: `${config.url.update}`,
        config: {
            "headers": {
                'Content-Type': 'application/json; charset=utf-8'
            },
        },
        data: {
            "query": statement,
            "stance": stance,
            "key_word": keywords
        }
    })
}