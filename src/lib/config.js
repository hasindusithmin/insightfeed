
exports.NodeAPI = process.env.REACT_APP_NODE_ENV === "development" ? "http://localhost:8080" : "https://ifnodeapi-1-w5504405.deta.app"
exports.NewsAPI = "https://claudeapi-1-t7350571.deta.app"


exports.dataPreProcess = (rawData) => {
    const processedData = []
    for (const { _id, count, data } of rawData) {
        const dataOfCategory = []
        for (const dt of data) {
            let { named_entities, topic_modeling } = dt;
            dt['named_entities'] = typeof named_entities === "string" ? named_entities.includes(",") ? named_entities.split(",") : [named_entities] : Array.isArray(named_entities) ? named_entities : Object.keys(named_entities);
            dt['topic_modeling'] = typeof topic_modeling === "string" ? topic_modeling.includes(",") ? topic_modeling.split(",") : [topic_modeling] : Array.isArray(topic_modeling) ? topic_modeling : Object.keys(topic_modeling);
            dataOfCategory.push(dt);
        }
        processedData.push({ _id, count, data: dataOfCategory })
    }
    return processedData
}

exports.getAxiosOptions = (dateFrom, dateTo) => {
    return [
        {
            type: "COUNTS",
            url: exports.NodeAPI + "/getSortedDocumentsWithGroupBy",
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                id: "COUNTS",
                database: "InsightFeed",
                collection: "news",
                filter: {
                    "timestamp": { "$gte": dateFrom, "$lte": dateTo },
                    "analyzed": true,
                    "sentiment": { "$ne": null }
                },
                sort: { "timestamp": -1 },
                group: "sentiment",
                countOnly: true
            }
        },
        {
            type: "LINE",
            url: exports.NodeAPI + "/getSentimentCountsByCategory",
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                id: "LINE",
                filter: {
                    "timestamp": { "$gte": dateFrom, "$lte": dateTo },
                    "analyzed": true,
                    "sentiment": { "$ne": null }
                }
            }
        },
        {
            type: "BAR&TREE",
            url: exports.NodeAPI + "/getSortedDocumentsWithGroupBy",
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                id: "BAR&TREE",
                task: "getCategorizeNews",
                database: "InsightFeed",
                collection: "news",
                filter: {
                    "timestamp": { "$gte": dateFrom, "$lte": dateTo },
                    "analyzed": true,
                    "sentiment": { "$ne": null }
                },
                sort: { "timestamp": -1 },
                group: "category"
            }
        }
    ]
}


// function getCategorizeNews(retry = 0, dateFrom, dateTo) {
//     if (retry >= 3) {
//         setCategorizeNewsLoading(false);
//         return
//     }
//     const options = {
//         url: NodeAPI + "/getSortedDocumentsWithGroupBy",
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         data: {
//             id: "BAR&TREE",
//             task: "getCategorizeNews",
//             database: "InsightFeed",
//             collection: "news",
//             filter: {
//                 "timestamp": { "$gte": dateFrom, "$lte": dateTo },
//                 "analyzed": true,
//                 "sentiment": { "$ne": null }
//             },
//             sort: { "timestamp": -1 },
//             group: "category"
//         }
//     };
//     axios(options)
//         .then(res => {
//             setNews(dataPreProcess(res.data));
//             setCategorizeNewsLoading(false);

//         })
//         .catch(err => {
//             console.log(err);
//             retry++;
//             getCategorizeNews(retry, dateFrom, dateTo);
//         })
// }

// function getSentimentsByCategory(retry = 0, dateFrom, dateTo) {
//     if (retry >= 3) {
//         return
//     }
//     const options = {
//         url: NodeAPI + "/getSentimentCountsByCategory",
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         data: {
//             id: "LINE",
//             filter: {
//                 "timestamp": { "$gte": dateFrom, "$lte": dateTo },
//                 "analyzed": true,
//                 "sentiment": { "$ne": null }
//             }
//         }
//     };
//     axios(options)
//         .then(res => {
//             const array = []
//             for (const { _id, sentiments } of res.data) {
//                 const object = {
//                     category: _id,
//                     positive: 0,
//                     negative: 0,
//                 };
//                 for (const { sentiment, count } of sentiments) {
//                     const kname = sentiment.toLowerCase()
//                     object[kname] = count;
//                 }
//                 array.push(object);
//             }
//             const arr = array.map(data => ({ category: data['category'], positive: data['positive'], negative: data['negative'], total: data['positive'] + data['negative'] }))
//             arr.sort((a, b) => a.total - b.total)
//             setSentimentsByCategoryLoading(false);
//             setSentimentsByCategory(arr);
//             setCategorizeNewsLoading(true)
//             getCategorizeNews(0, dateFrom, dateTo);
//         })
//         .catch(err => {
//             console.log(err);
//             retry++;
//             getSentimentsByCategory(retry, dateFrom, dateTo)
//         })
// }

// function getSentimentsCounts(retry = 0, dateFrom, dateTo) {
//     setAnalytics({ total: 0, positive: 0, negative: 0 })
//     if (retry >= 3) {
//         return
//     }
//     const options = {
//         url: NodeAPI + "/getSortedDocumentsWithGroupBy",
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         data: {
//             id: "COUNTS",
//             database: "InsightFeed",
//             collection: "news",
//             filter: {
//                 "timestamp": { "$gte": dateFrom, "$lte": dateTo },
//                 "analyzed": true,
//                 "sentiment": { "$ne": null }
//             },
//             sort: { "timestamp": -1 },
//             group: "sentiment",
//             countOnly: true
//         }
//     };
//     return axios(options)
//         .then(res => {
//             const data = { total: 0, positive: 0, negative: 0 }
//             if (res.data.length > 0) {
//                 for (const { _id, count } of res.data) {
//                     data[_id] = count
//                 }
//                 data["total"] = data["positive"] + data["negative"];
//                 setAnalytics(data);
//             }
//             // setSentimentsByCategoryLoading(true);
//             getSentimentsByCategory(0, dateFrom, dateTo);
//         })
//         .catch(err => {
//             console.log(err);
//             retry++;
//             getSentimentsCounts(retry, dateFrom, dateTo)
//         })
// }