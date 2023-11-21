import ReactEcharts from "echarts-for-react"
import * as echarts from 'echarts/core';
import moment from "moment";
import { useState } from "react";
import Swal from "sweetalert2";


function groupBySentiment({ data }) {
    return data.reduce((groupedData, item) => {
        const sentiment = item.sentiment || 'null';

        if (!groupedData[sentiment]) {
            groupedData[sentiment] = [];
        }

        groupedData[sentiment].push(item);

        return groupedData;
    }, {});
}


export default function Overview({ news, fromDate, toDate }) {

    const initOptions = {
        title: {
            text: 'Types of News',
            subtext: `From ${moment(fromDate).format('MMM Do YYYY, h:mm A')} To ${moment(toDate).format('MMM Do YYYY, h:mm A')}`,
            left: 'left'
        },
        grid: {
            left: '0%',
            right: '0%',
            bottom: '5%',
            containLabel: true
        },
        xAxis: {
            data: news.map(({ _id }) => _id),
            axisLabel: {
                inside: true,
                color: '#fff'
            },
            axisTick: {
                show: false
            },
            axisLine: {
                show: false
            },
            z: 10
        },
        yAxis: {
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                color: '#999'
            }
        },
        tooltip: {
            trigger: 'item',
            formatter: function ({ name, value }) {
                return `${name} ${value} results`
            },
        },
        series: [
            {
                type: 'bar',
                showBackground: true,
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 1, color: '#355C7D' },
                        { offset: 0.5, color: '#6C5B7B' },
                        { offset: 0, color: '#C06C84' }
                    ])
                },
                emphasis: {
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: '#355C7D' },
                            { offset: 0.5, color: '#6C5B7B' },
                            { offset: 1, color: '#C06C84' }
                        ])
                    }
                },
                data: news.map(({ data }) => data.length),
            }
        ],
        toolbox: {
            feature: {
                saveAsImage: {},
            }
        },
    };

    const [options, setOptions] = useState(null);

    const onEvents = {
        click: ({ name }) => {
            const filteredNews = news.filter(({ _id }) => _id === name)
            if (filteredNews.length > 0) {
                const results = groupBySentiment(filteredNews[0])
                const opts = {
                    title: {
                        text: "Sentiments of " + name,
                        subtext: `From ${moment(fromDate).format('MMMM Do YYYY, h:mm A')} To ${moment(toDate).format('MMMM Do YYYY, h:mm A')}`,
                        left: 'left'
                    },
                    grid: {
                        left: '0%',
                        right: '0%',
                        bottom: '5%',
                        containLabel: true
                    },
                    xAxis: {
                        data: ["positive", "negative"],
                        axisLabel: {
                            inside: true,
                            color: '#fff'
                        },
                        axisTick: {
                            show: false
                        },
                        axisLine: {
                            show: false
                        },
                        z: 10
                    },
                    yAxis: {
                        axisLine: {
                            show: false
                        },
                        axisTick: {
                            show: false
                        },
                        axisLabel: {
                            color: '#999'
                        }
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: function ({ name, value }) {
                            return `${name} ${value} results`
                        },
                    },
                    series: [
                        {
                            id: name,
                            type: 'bar',
                            showBackground: true,
                            itemStyle: {
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                    { offset: 0, color: '#355C7D' },
                                    { offset: 0.5, color: '#6C5B7B' },
                                    { offset: 1, color: '#C06C84' }
                                ])
                            },
                            emphasis: {
                                itemStyle: {
                                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                        { offset: 1, color: '#355C7D' },
                                        { offset: 0.5, color: '#6C5B7B' },
                                        { offset: 0, color: '#C06C84' }
                                    ])
                                }
                            },
                            data: [results["positive"] ? results["positive"].length : 0, results["negative"] ? results["negative"].length : 0],
                        }
                    ],
                    toolbox: {
                        feature: {
                            saveAsImage: {},
                            myTool1: {
                                show: true,
                                title: 'Go Back',
                                icon: 'path://M44 40.8361C39.1069 34.8632 34.7617 31.4739 30.9644 30.6682C27.1671 29.8625 23.5517 29.7408 20.1182 30.303V41L4 23.5453L20.1182 7V17.167C26.4667 17.2172 31.8638 19.4948 36.3095 24C40.7553 28.5052 43.3187 34.1172 44 40.8361Z',
                                onclick: function () {
                                    setOptions(null)
                                }
                            }
                        }
                    },
                };
                setOptions(opts);
            }
        }
    }

    const onEventsNested = {
        click: ({ name: sentiment, seriesId: category }) => {
            const category_data = news.filter(({ _id }) => _id === category);
            const { data = [] } = category_data.length > 0 ? category_data[0] : {};
            const required = data.filter(object => object.sentiment === sentiment);
            const icon = sentiment === "positive" ? "<i class=\"fa fa-smile-o\" title=\"positive\"></i>" : "<i class=\"fa fa-frown-o\" title=\"negative\"></i>"
            Swal.fire({
                title: `${category} ${icon}`,
                customClass: {
                    title: "w3-xlarge",
                    htmlContainer: "w3-container scrollable-container"
                },
                html: `
                  ${required.map(({ title, description, named_entities, topic_modeling, timestamp }) => {
                    const entities = typeof named_entities === 'object' ? named_entities : [named_entities]
                    const topics = typeof topic_modeling === 'object' ? topic_modeling : [topic_modeling]
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
    }

    return (
        <>
            {
                !options ?
                    <ReactEcharts
                        option={initOptions}
                        style={{ width: (initOptions.xAxis.data.length) * 150, height: 600 }}
                        onEvents={onEvents}
                    />
                    :
                    <ReactEcharts
                        option={options}
                        style={{ width: (options.xAxis.data.length) * 200, height: 600 }}
                        onEvents={onEventsNested}
                    />
            }
        </>
    )
}