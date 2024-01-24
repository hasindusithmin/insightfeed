const { default: Swal } = require("sweetalert2")
const moment = require("moment");

exports.NodeAPI = process.env.REACT_APP_NODE_ENV === "development" ? "http://localhost:8080" : "https://ifnodeapi-1-w5504405.deta.app"
exports.PythonAPI = process.env.REACT_APP_NODE_ENV === "development" ? "http://localhost:4201" : "https://ifpyapi-1-p4769562.deta.app"


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

exports.dataPreProcessV2 = (data) => {
    const processedData = []
    for (const dt of data) {
        let { named_entities, topic_modeling } = dt;
        dt['named_entities'] = typeof named_entities === "string" ? named_entities.includes(",") ? named_entities.split(",") : [named_entities] : Array.isArray(named_entities) ? named_entities : Object.keys(named_entities);
        dt['topic_modeling'] = typeof topic_modeling === "string" ? topic_modeling.includes(",") ? topic_modeling.split(",") : [topic_modeling] : Array.isArray(topic_modeling) ? topic_modeling : Object.keys(topic_modeling);
        processedData.push(dt);
    }
    return processedData
}

exports.getAxiosOptions = (dateFrom, dateTo) => {
    return [
        {
            type: "ALLNEWS",
            url: exports.NodeAPI + "/getSortedDocumentsWithGroupBy",
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                id: "ALLNEWS",
                database: "InsightFeed",
                collection: "news",
                filter: {
                    "analyzed": true,
                    "sentiment": { "$ne": null },
                    "timestamp": { "$gte": dateFrom, "$lte": dateTo },
                },
                sort: { "timestamp": 1 },
                group: "category",
                limit: 150
            }
        },
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
        },
        {
            type: "WORDCLOUD",
            url: exports.NodeAPI + "/getDocuments",
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                id: "WORDCLOUD",
                database: "InsightFeed",
                collection: "news",
                filter: {
                    "analyzed": true,
                    "sentiment": { "$ne": null },
                    "timestamp": { "$gte": dateFrom, "$lte": dateTo },
                },
                projection: {
                    "sentiment": 1,
                    "named_entities": 1,
                    "topic_modeling": 1
                },
                sort: { "timestamp": -1 },
            }
        },
        {
            type: "NEWS",
            url: exports.NodeAPI + "/getDocuments",
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                id: "WORLD",
                database: "InsightFeed",
                collection: "news",
                filter: {
                    "analyzed": true,
                    "sentiment": { "$ne": null },
                    "category": "world"
                },
                sort: { "timestamp": -1 },
                limit: 10
            }
        },
        {
            type: "NEWS",
            url: exports.NodeAPI + "/getDocuments",
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                id: "SOUTHASIA",
                database: "InsightFeed",
                collection: "news",
                filter: {
                    "analyzed": true,
                    "sentiment": { "$ne": null },
                    "category": "south-asia"
                },
                sort: { "timestamp": -1 },
                limit: 10
            }
        },
        {
            type: "NEWS",
            url: exports.NodeAPI + "/getDocuments",
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                id: "BUSINESS",
                database: "InsightFeed",
                collection: "news",
                filter: {
                    "analyzed": true,
                    "sentiment": { "$ne": null },
                    "category": "business-economy"
                },
                sort: { "timestamp": -1 },
                limit: 10
            }
        },
        {
            type: "NEWS",
            url: exports.NodeAPI + "/getDocuments",
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                id: "SPORTS",
                database: "InsightFeed",
                collection: "news",
                filter: {
                    "analyzed": true,
                    "sentiment": { "$ne": null },
                    "category": "sports"
                },
                sort: { "timestamp": -1 },
                limit: 10
            }
        },
        {
            type: "NEWS",
            url: exports.NodeAPI + "/getDocuments",
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                id: "CRICKET",
                database: "InsightFeed",
                collection: "news",
                filter: {
                    "analyzed": true,
                    "sentiment": { "$ne": null },
                    "category": "cricket"
                },
                sort: { "timestamp": -1 },
                limit: 10
            }
        },
        {
            type: "NEWS",
            url: exports.NodeAPI + "/getDocuments",
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                id: "FOOTBALL",
                database: "InsightFeed",
                collection: "news",
                filter: {
                    "analyzed": true,
                    "sentiment": { "$ne": null },
                    "category": "football"
                },
                sort: { "timestamp": -1 },
                limit: 10
            }
        },
        {
            type: "NEWS",
            url: exports.NodeAPI + "/getDocuments",
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                id: "ENTERTAINMENT",
                database: "InsightFeed",
                collection: "news",
                filter: {
                    "analyzed": true,
                    "sentiment": { "$ne": null },
                    "category": "entertainment"
                },
                sort: { "timestamp": -1 },
                limit: 10
            }
        }
    ]
}

exports.showCategorizeNews = (Title, data) => {
    Swal.fire({
        title: Title,
        customClass: {
            title: "w3-xlarge",
            htmlContainer: "w3-container scrollable-container"
        },
        html: `
          ${data.map(({ title, description, named_entities, topic_modeling, timestamp }) => {
            const entities = typeof named_entities === "string" ? named_entities.includes(",") ? named_entities.split(",") : [named_entities] : Array.isArray(named_entities) ? named_entities : Object.keys(named_entities);
            const topics = typeof topic_modeling === "string" ? topic_modeling.includes(",") ? topic_modeling.split(",") : [topic_modeling] : Array.isArray(topic_modeling) ? topic_modeling : Object.keys(topic_modeling);
            return (
                `
            <div class="w3-card w3-round-xlarge w3-panel w3-padding" style="margin:10px 5px;">
                <div class="w3-large w3-text-grey w3-hover-text-dark-grey" style="font-weight:bold;">
                    ${title}
                </div>
                <hr>
                <div class="w3-justify">
                    ${description ? `<span class="w3-text-blue-grey">${description}</span>` : "<span class=\"w3-text-red w3-hover-text-blue-grey\">Sorry, there's no information available about this news at the moment.</span>"}
                </div>
                <br>
                <div class="w3-padding">
                    ${entities.map(entity => "<span title=\"entity\" style=\"margin:5px;\" class=\"w3-tag w3-padding-small w3-green w3-round-large w3-hover-text-dark-grey\">" + "<i class=\"fa fa-cube\" aria-hidden=\"true\"></i>&nbsp;" + entity + "</span>").join("")}
                </div>
                <div class="w3-padding">
                    ${topics.map(topic => "<span title=\"topic\" style=\"margin:5px;\" class=\"w3-tag w3-padding-small w3-blue w3-round-large w3-hover-text-dark-grey\">" + "<i class=\"fa fa-tags\" aria-hidden=\"true\"></i>&nbsp;" + topic + "</span>").join("")}
                </div>
                <div class="w3-padding w3-left">
                    <span class="w3-hover-text-blue-grey"><i class="fa fa-clock-o" aria-hidden="true"></i> ${moment(timestamp).format('MMM Do YYYY, h:mm A')}<span>
                </div>
            </div>
            `
            )
        }).join("")}
        `,
        showCloseButton: true,
        showCancelButton: false,
        showConfirmButton: false
    });
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
