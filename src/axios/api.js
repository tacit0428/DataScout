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

// 分解query同时检索fact(添加节点时触发)
export async function decomposeAndRetrieve(statement, query, stance) {
    console.log('api decompose & retrieve', statement, query, stance)
    return axios({
        method: "post",
        url: `${config.url.retrieve}`,
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

// 单个query检索(QueryEditor中搜索触发)
export async function retrieveFacts(statement, query, stance) {
    console.log('api retrievebyQuery', statement, query, stance)
    return axios({
        method: "post",
        url: `${config.url.retrieveByQuery}`,  // 之前是datafact
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

// 根据关键词生成新query并检索
export async function generateQueryAndRetrieve(statement, stance, keywords) {
    console.log('api generatequeryandretrieve', statement, stance, keywords)
    return axios({
        method: "post",
        url: `${config.url.updateQuery}`,
        config: {
            "headers": {
                'Content-Type': 'application/json; charset=utf-8'
            },
        },
        data: {
            "statement": statement,
            "stance": stance,
            "key_word": keywords
        }
    })
}

// 根据关键词生成query
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

export async function storeFacts(statement, nodes, edges, id) {
    console.log('api storeFacts', statement, nodes, edges)
    return axios({
        method: "post",
        url: `${config.url.storeFacts}`,
        config: {
            "headers": {
                'Content-Type': 'application/json; charset=utf-8'
            },
        },
        data: {
            "statement": statement,
            "nodes": nodes,
            "edges": edges,
            "id": id
        }
    })
}

export async function loadFacts(filename) {
    console.log('api loadFacts', filename)
    return axios({
        method: "post",
        url: `${config.url.loadFacts}`,
        config: {
            "headers": {
                'Content-Type': 'application/json; charset=utf-8'
            },
        },
        data: {
            "filename": filename
        }
    })
}

export async function decomposeAndRetrieveTest(statement, query, stance, retrieve=false) {
    console.log('api decompose & retrieve test', statement, query, stance, retrieve)
    return axios({
        method: "post",
        url: `${config.url.retrieveTest}`,
        config: {
            "headers": {
                'Content-Type': 'application/json; charset=utf-8'
            },
        },
        data: {
            "statement": statement,
            "query": query,
            "stance": stance,
            "retrieve": retrieve
        }
    })
}