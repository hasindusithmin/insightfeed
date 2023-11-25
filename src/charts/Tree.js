import ReactEcharts from "echarts-for-react"
import Swal from "sweetalert2";
import moment from "moment";
import { PythonAPI } from "../lib/config";
import axios from "axios";

export default function Tree({ news, fromDate, toDate }) {
    const children = [];
    for (const { _id: categoryName, data: categoryArray } of news) {
        // categories iteration 
        const object = {}
        const positive_entities_children = [], positive_topics_children = []
        const negative_entities_children = [], negative_topics_children = []
        for (const categoryObj of categoryArray) {
            // categories data iteration 
            const entities = typeof categoryObj.named_entities === "string" ? categoryObj.named_entities.includes(",") ? categoryObj.named_entities.split(",") : [categoryObj.named_entities] : Array.isArray(categoryObj.named_entities) ? categoryObj.named_entities : Object.keys(categoryObj.named_entities);
            const topics = typeof categoryObj.topic_modeling === "string" ? categoryObj.topic_modeling.includes(",") ? categoryObj.topic_modeling.split(",") : [categoryObj.topic_modeling] : Array.isArray(categoryObj.topic_modeling) ? categoryObj.topic_modeling : Object.keys(categoryObj.topic_modeling);
            if (categoryObj.sentiment === "positive") {
                // for (const entity of entities) {
                //     positive_entities_children.push({
                //         name: entity,
                //         value: 0,
                //         news: categoryObj
                //     })
                // }
                positive_entities_children.push({
                    name: entities.join(","),
                    value: 0,
                    method: "NER",
                    news: categoryObj
                })
                // for (const topic of topics) {
                //     positive_topics_children.push({
                //         name: topic,
                //         value: 0,
                //         news: categoryObj
                //     })
                // }
                positive_topics_children.push({
                    name: topics.join(","),
                    method: "TM",
                    value: 0,
                    news: categoryObj
                })
            }
            else if (categoryObj.sentiment === "negative") {
                // for (const entity of entities) {
                //     negative_entities_children.push({
                //         name: entity,
                //         value: 0,
                //         news: categoryObj
                //     })
                // }
                negative_entities_children.push({
                    name: entities.join(","),
                    method: "NER",
                    value: 0,
                    news: categoryObj
                })
                // for (const topic of topics) {
                //     negative_topics_children.push({
                //         name: topic,
                //         value: 0,
                //         news: categoryObj
                //     })
                // }
                negative_topics_children.push({
                    name: topics.join(","),
                    value: 0,
                    method: "TM",
                    news: categoryObj
                })
            }
        }
        object['name'] = categoryName;
        object['children'] = [
            {
                name: "positive",
                children: [
                    {
                        name: "entities",
                        children: positive_entities_children
                    },
                    {
                        name: "topics",
                        children: positive_topics_children
                    }
                ],
                collapsed: true
            },
            {
                name: "negative",
                children: [
                    {
                        name: "entities",
                        children: negative_entities_children
                    },
                    {
                        name: "topics",
                        children: negative_topics_children
                    }
                ],
                collapsed: true
            }
        ]
        object['collapsed'] = true;
        children.push(object)
    }
    const option = {
        title: {
            text: 'Classification',
            subtext: `From ${moment(fromDate).format('MMM Do YYYY, h:mm A')} To ${moment(toDate).format('MMM Do YYYY, h:mm A')}`,
            left: 'left'
        },
        tooltip: {
            trigger: 'item',
            formatter: function ({ name }) {
                let tip = "";
                switch (name) {
                    case "positive":
                        tip = "Sentiment positive(+)"
                        break;
                    case "negative":
                        tip = "Sentiment negative(-)"
                        break;
                    case "entities":
                        tip = "Name Entity Recognition"
                        break;
                    case "topics":
                        tip = "Topic Modeling"
                        break;
                    default:
                        tip = name
                        break
                }
                return tip.includes(",") ? `<ul class="w3-ul">${tip.split(",").map(str => "<li class=\"w3-text-blue-grey\">" + str + "</li>").join("")}</ul>` : tip;
            },
        },
        toolbox: {
            feature: {
                restore: {},
                saveAsImage: {},
            }
        },
        series: [
            {
                type: 'tree',
                data: [{ name: "", children: children }],
                top: '1%',
                left: '7%',
                bottom: '1%',
                right: '20%',
                symbol: 'diamond',
                symbolSize: 10,
                label: {
                    position: 'left',
                    verticalAlign: 'middle',
                    align: 'right',
                    fontSize: 15,
                    fontWeight: "bold"
                },
                leaves: {
                    label: {
                        position: 'right',
                        verticalAlign: 'middle',
                        align: 'left',
                    }
                },
                emphasis: {
                    focus: 'descendant',
                },
                expandAndCollapse: true,
                animationDuration: 550,
                animationDurationUpdate: 750
            }
        ]
    }

    const onEvents = {
        click: ({ data }) => {
            if (data.hasOwnProperty("news")) {
                const { title, named_entities: entities, topic_modeling: topics, description, timestamp } = data['news']
                const openModal = () => {
                    Swal.fire({
                        title: title,
                        customClass: {
                            title: "w3-large w3-text-blue-grey",
                            confirmButton: "w3-button w3-round-xlarge w3-blue-grey"
                        },
                        html: `
                          <div class="w3-justify">
                            ${description ? `<span class="w3-hover-text-blue-grey">${description}</span>` : "<span class=\"w3-text-red\">Sorry, there's no information available about this news at the moment.</span>"}
                          </div>
                          <br>
                          <div class="w3-padding">
                            ${data["method"] === "NER" ? entities.map(entity => "<span title=\"entity\" style=\"margin:5px;\" class=\"w3-tag w3-padding-small w3-green w3-round-large w3-hover-text-dark-grey\">" + "<i class=\"fa fa-cube\" aria-hidden=\"true\"></i>&nbsp;" + entity + "</span>").join("") : ""}
                            ${data["method"] === "TM" ? topics.map(topic => "<span title=\"topic\" style=\"margin:5px;\" class=\"w3-tag w3-padding-small w3-blue w3-round-large w3-hover-text-dark-grey\">" + "<i class=\"fa fa-tags\" aria-hidden=\"true\"></i>&nbsp;" + topic + "</span>").join("") : ""}
                          </div>
                          <div class="w3-padding w3-left">
                            <span class="w3-hover-text-blue-grey"><i class="fa fa-clock-o" aria-hidden="true"></i> ${moment(timestamp).format('MMM Do YYYY, h:mm A')}<span>
                          </div>
                        `,
                        showCloseButton: true,
                        showCancelButton: false,
                        showConfirmButton: true,
                        showLoaderOnConfirm: true,
                        confirmButtonText: "<i class=\"fa fa-newspaper-o\" aria-hidden=\"true\"></i> More",
                        preConfirm: () => {
                            const options = {
                                url: PythonAPI + "/hotnews",
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                data: {
                                    "query": title,
                                    "language": "en-US",
                                    "country": "US",
                                    "ceid": "US:en"
                                }
                            };
                            return axios(options)
                                .then(res => {
                                    const data = res.data || []
                                    Swal.fire({
                                        title: title,
                                        customClass: {
                                            title: "w3-large w3-text-dark-grey",
                                            htmlContainer: "w3-container scrollable-container",
                                            confirmButton: "w3-button w3-round-xlarge w3-blue-grey"
                                        },
                                        html: `
                                            ${data.length > 0 && data.map(news =>
                                            `
                                                <div class="w3-card w3-round-xlarge w3-panel w3-padding" style="margin:10px 5px;">
                                                    <span
                                                        title="click here to view news"
                                                        class="w3-text-grey w3-hover-text-dark-grey"
                                                        style="text-decoration:none;font-weight:bold;cursor:pointer;"
                                                        onclick="window.open('${news.link}', '_blank', 'width=600,height=400,location=no,menubar=no,toolbar=no')"
                                                    >
                                                        ${news.title}
                                                    </span>
                                                    <div class="w3-padding w3-left-align">
                                                        <a
                                                            href="${news.source['@url']}"
                                                            class="w3-text-blue"
                                                            style="text-decoration:none;font-weight:500px;"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <i class="fa fa-rss-square" aria-hidden="true"></i> ${news.source['#text']}
                                                        </a>
                                                        <br>
                                                        <span>
                                                            <i class="w3-spin fa fa-clock-o" aria-hidden="true"></i> ${moment(news.pubDate).format("MMM Do YYYY, h:mm A")}
                                                        </span>
                                                    </div>
                                                </div>
                                                `
                                        ).join("")}
                                        `,
                                        showCloseButton: true,
                                        showCancelButton: false,
                                        showConfirmButton: true,
                                        confirmButtonText: "<i class='fa fa-chevron-circle-left' aria-hidden='true'></i> Back",
                                        preConfirm: () => {
                                            openModal()
                                        }
                                    })
                                })
                                .catch(err => {
                                    Swal.showValidationMessage(err)
                                })
                        }
                    });
                }
                openModal();
            }
        }
    }
    return (
        <ReactEcharts
            option={option}
            style={{ width: "100%", height: 1000, backgroundColor: "#f1f1f1" }}
            onEvents={onEvents}
        />
    )
}