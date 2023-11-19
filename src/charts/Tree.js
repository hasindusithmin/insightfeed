import ReactEcharts from "echarts-for-react"
import Swal from "sweetalert2";
import moment from "moment";

export default function Tree({ news, fromDate, toDate }) {
    const children = [];
    for (const { _id: categoryName, data: categoryArray } of news) {
        // categories iteration 
        const object = {}
        const positive_entities_children = [], positive_topics_children = []
        const negative_entities_children = [], negative_topics_children = []
        for (const categoryObj of categoryArray) {
            // categories data iteration 
            const entities = typeof categoryObj.named_entities === 'object' ? categoryObj.named_entities : [categoryObj.named_entities]
            const topics = typeof categoryObj.topic_modeling === 'object' ? categoryObj.topic_modeling : [categoryObj.topic_modeling]
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
                ]
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
                ]
            }
        ]
        object['collapsed'] = true;
        children.push(object)
    }

    const option = {
        title: {
            text: 'InsightFeed: Info Grove',
            subtext: `From ${moment(fromDate).format('MMMM Do YYYY, h:mm A')} To ${moment(toDate).format('MMMM Do YYYY, h:mm A')}`,
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
                saveAsImage: {}
            }
        },
        series: [
            {
                type: 'tree',
                data: [{ name: "news", children: children }],
                top: '1%',
                left: '7%',
                bottom: '1%',
                right: '20%',
                symbolSize: 7,
                label: {
                    position: 'left',
                    verticalAlign: 'middle',
                    align: 'right',
                    fontSize: 12,
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
        click: ({ name, data }) => {
            if (data.hasOwnProperty("news")) {
                const { title, named_entities, topic_modeling, description, timestamp } = data['news']
                const entities = typeof named_entities === 'object' ? named_entities : [named_entities]
                const topics = typeof topic_modeling === 'object' ? topic_modeling : [topic_modeling]
                Swal.fire({
                    title: title,
                    customClass: {
                        title: "w3-large w3-text-blue-grey"
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
                      <div class="w3-padding w3-right">
                        <span class="w3-hover-text-blue-grey"><i class="fa fa-clock-o" aria-hidden="true"></i> ${moment(timestamp).format('MMMM Do YYYY, h:mm A')}<span>
                      </div>
                    `,
                    showCloseButton: true,
                    showCancelButton: false,
                    showConfirmButton: false,
                    confirmButtonText: `
                      <i class="fa fa-thumbs-up"></i> Great!
                    `,
                    confirmButtonAriaLabel: "Thumbs up, great!",
                    cancelButtonText: `
                      <i class="fa fa-thumbs-down"></i>
                    `,
                });
            }
        }
    }
    return (
        <ReactEcharts
            option={option}
            style={{ width: "100%", height: 1000 }}
            onEvents={onEvents}
        />
    )
}