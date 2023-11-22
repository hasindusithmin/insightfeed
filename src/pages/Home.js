import axios from "axios"
import { useEffect, useState } from "react"
import { NodeAPI } from "../lib/config"
import moment from "moment"
import Overview from "../charts/Overview";
import Loader from "../components/Loaders";
import Tree from "../charts/Tree";
import Swal from "sweetalert2";
import Vortex from "../components/Vortex";
import { Typewriter } from 'react-simple-typewriter'
import Slides from "../components/Slides";
import { Tooltip } from "react-tooltip";
import Sentiment from "../charts/Sentiment";

export default function Home() {

    function dataPreProcess(rawData) {
        const processedData = []
        for (const { _id, count, data } of rawData) {
            const dataOfCategory = []
            for (const dt of data) {
                let { named_entities, topic_modeling } = dt;
                dt['named_entities'] = typeof named_entities === "string" ? named_entities.includes(",") ? named_entities.split(",") : [named_entities] : named_entities;
                dt['topic_modeling'] = typeof topic_modeling === "string" ? topic_modeling.includes(",") ? topic_modeling.split(",") : [topic_modeling] : topic_modeling;
                dataOfCategory.push(dt);
            }
            processedData.push({ _id, count, data: dataOfCategory })
        }
        return processedData
    }

    const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
        }
    });

    const [categorizeNewsLoading, setCategorizeNewsLoading] = useState(false);
    const [sentimentsByCategoryLoading, setSentimentsByCategoryLoading] = useState(false);

    const [fromDate, setFromDate] = useState(moment().startOf("day").valueOf());
    const [toDate, setToDate] = useState(moment().valueOf());
    const [news, setNews] = useState(null);
    const [latestNews, setLatestNews] = useState(null);
    const [analytics, setAnalytics] = useState({ total: 0, positive: 0, negative: 0 });
    const [sentimentsByCategory, setSentimentsByCategory] = useState(null);




    function getCategorizeNews(retry = 0, dateFrom, dateTo) {
        if (retry >= 3) {
            setCategorizeNewsLoading(false);
            return
        }
        const options = {
            url: NodeAPI + "/getSortedDocumentsWithGroupBy",
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
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
        };
        axios(options)
            .then(res => {
                setNews(dataPreProcess(res.data));
                setCategorizeNewsLoading(false);

            })
            .catch(err => {
                console.log(err);
                retry++;
                getCategorizeNews(retry, dateFrom, dateTo);
            })
    }

    function getSentimentsByCategory(retry = 0, dateFrom, dateTo) {
        if (retry >= 3) {
            return
        }
        const options = {
            url: NodeAPI + "/getSentimentCountsByCategory",
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                filter: {
                    "timestamp": { "$gte": dateFrom, "$lte": dateTo },
                    "analyzed": true,
                    "sentiment": { "$ne": null }
                }
            }
        };
        axios(options)
            .then(res => {
                const array = []
                for (const { _id, sentiments } of res.data) {
                    const object = {
                        category: _id,
                        positive: 0,
                        negative: 0,
                    };
                    for (const { sentiment, count } of sentiments) {
                        const kname = sentiment.toLowerCase()
                        object[kname] = count;
                    }
                    array.push(object);
                }
                const arr = array.map(data => ({ category: data['category'], positive: data['positive'], negative: data['negative'], total: data['positive'] + data['negative'] }))
                arr.sort((a, b) => a.total - b.total)
                setSentimentsByCategoryLoading(false);
                setSentimentsByCategory(arr);
                setCategorizeNewsLoading(true)
                getCategorizeNews(0, dateFrom, dateTo);
            })
            .catch(err => {
                console.log(err);
                retry++;
                getSentimentsByCategory(retry, dateFrom, dateTo)
            })
    }

    function getSentimentsCounts(retry = 0, dateFrom, dateTo) {
        setAnalytics({ total: 0, positive: 0, negative: 0 })
        if (retry >= 3) {
            return
        }
        const options = {
            url: NodeAPI + "/getSortedDocumentsWithGroupBy",
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                task: "getSentimentsCounts",
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
        };
        return axios(options)
            .then(res => {
                const data = { total: 0, positive: 0, negative: 0 }
                if (res.data.length > 0) {
                    for (const { _id, count } of res.data) {
                        data[_id] = count
                    }
                    data["total"] = data["positive"] + data["negative"];
                    setAnalytics(data);
                }
                setFromDate(dateFrom);
                setToDate(dateTo);
                setSentimentsByCategoryLoading(true);
                getSentimentsByCategory(0, dateFrom, dateTo);
            })
            .catch(err => {
                console.log(err);
                retry++;
                getSentimentsCounts(retry, dateFrom, dateTo)
            })
    }

    let hit = false;

    useEffect(() => {
        function getLatestNews(retry = 0) {
            hit = true;
            if (retry >= 3) {
                Toast.fire({
                    icon: "warning",
                    title: "Can you please try again in a few minutes?"
                });
                return
            }
            const options = {
                url: NodeAPI + "/getDocuments",
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    database: "InsightFeed",
                    collection: "news",
                    filter: { "analyzed": true, "sentiment": { "$ne": null }, "description": { "$ne": null } },
                    sort: { "timestamp": -1 },
                    limit: 10
                }
            };
            axios(options)
                .then(res => {
                    setLatestNews(res.data);
                    getSentimentsCounts(0, fromDate, toDate);
                })
                .catch(err => {
                    console.log(err);
                    retry++;
                    getLatestNews(retry);
                })
        }
        if (hit === false) getLatestNews()
    }, [])

    const showFilter = (position = "center") => {
        Swal.fire({
            title: "<i class=\"fa fa-calendar\" aria-hidden=\"true\"></i> DATE FILTER",
            customClass: {
                title: "w3-xlarge",
                htmlContainer: "w3-container",
                confirmButton: "w3-green",
                denyButton: "w3-red"
            },
            position: position,
            html: `
                <label class="w3-left">From Date</label>
                <input type="text" id="from-date" class="w3-input w3-border" value="${moment(fromDate).format('YYYY-MMM-DD h:mm A')}" placeholder="YYYY-MMM-DD h:mm A">
                <br>
                <label class="w3-left">To Date</label>
                <input type="text" id="to-date" class="w3-input w3-border" value="${moment(toDate).format('YYYY-MMM-DD h:mm A')}" placeholder="YYYY-MMM-DD h:mm A">
          `,
            showCloseButton: true,
            showCancelButton: false,
            showDenyButton: true,
            confirmButtonText: "<i class='fa fa-filter'></i>",
            denyButtonText: "<i class='fa fa-history'></i>",
            showLoaderOnConfirm: true,
            showLoaderOnDeny: true,
            preDeny: () => {
                const newFrom = moment().startOf("day").valueOf(), newTo = moment().valueOf();
                return getSentimentsCounts(0, newFrom, newTo);
            },
            preConfirm: () => {
                const expectedFormat = "YYYY-MMM-DD h:mm A"
                const from_date = document.getElementById("from-date") ? document.getElementById("from-date").value : moment(fromDate).format('YYYY-MMM-DD h:mm A');
                const to_date = document.getElementById("from-date") ? document.getElementById("to-date").value : moment(toDate).format('YYYY-MMM-DD h:mm A');
                const isValidFromDate = moment(from_date, expectedFormat, true).isValid()
                if (!isValidFromDate) {
                    Toast.fire({
                        icon: "error",
                        title: "Please provide a valid from date"
                    });
                    return
                }
                const isValidToDate = moment(to_date, expectedFormat, true).isValid()
                if (!isValidToDate) {
                    Toast.fire({
                        icon: "error",
                        title: "Please provide a valid to date"
                    });
                    return
                }
                const M_from = moment(from_date, expectedFormat)
                const M_to = moment(to_date, expectedFormat)
                const M_now = moment()
                const validate_1 = M_to.isBefore(M_now)
                if (!validate_1) {
                    Toast.fire({
                        icon: "error",
                        title: "To Date must be earlier than the current time"
                    });
                    return
                }
                const validate_2 = M_to.isAfter(M_from)
                if (!validate_2) {
                    Toast.fire({
                        icon: "error",
                        title: "To Date must be later than the the From Date"
                    });
                    return
                }
                const validate_3 = M_to.diff(M_from, "hours")
                if (validate_3 > 72) {
                    Toast.fire({
                        icon: "error",
                        title: "Please select a valid date range with a maximum duration of 72 hours (3 days)"
                    });
                    return
                }
                const newFrom = M_from.valueOf(), newTo = M_to.valueOf();
                return getSentimentsCounts(0, newFrom, newTo);
            }
        });
    }

    const [showAnimate, setShowAnimate] = useState(false);

    return (
        <div className="w3-content w3-panel">

            <div></div>
            <div className="w3-display-container">
                <div className="w3-display-topright">
                    <button className="w3-button w3-green w3-round-large" onClick={() => showFilter("top-end")} disabled={!news}>
                        <i className="fa fa-filter"></i>
                    </button>
                </div>
                <div className="w3-display-topleft">
                    <span className="w3-tag w3-red">Beta</span>
                </div>
            </div>

            <div className="w3-center w3-light-grey w3-round-xlarge w3-padding-64">
                <div className="svg-container">
                    <Vortex show={showAnimate} />
                </div>
                <div className="w3-xxlarge">
                    <span onMouseOver={() => setShowAnimate(true)} onMouseOut={() => setShowAnimate(false)}>
                        <span className="w3-wide">INSIGHT</span><span className="w3-tag w3-round w3-dark-grey w3-opacity">FEED</span>
                    </span>
                </div>
                <div className="w3-xlarge w3-padding">
                    AI-driven news platform <i className="fa fa-check-circle-o" aria-hidden="true"></i>
                </div>
                <div className="w3-large">
                    <Typewriter words={['Gauge news emotions: positive or negative - 🆂🅴🅽🆃🅸🅼🅴🅽🆃 🅰🅽🅰🅻🆈🆂🅸🆂', 'Identify key names and places in news content - 🅽🅰🅼🅴 🅴🅽🆃🅸🆃🆈 🆁🅴🅲🅾🅶🅽🅸🆃🅸🅾🅽', 'Uncover trending news themes quickly - 🆃🅾🅿🅸🅲 🅼🅾🅳🅴🅻🅸🅽🅶', 'Organize news stories into relevant categories - 🅲🅻🅰🆂🆂🅸🅵🅸🅲🅰🆃🅸🅾🅽', 'Present news insights visually for quick understanding: 🆅🅸🆂🆄🅰🅻🅸🆉🅰🆃🅸🅾🅽']} loop={100} cursor cursorStyle='_' />
                </div>
            </div>

            <div className="w3-margin-top w3-row-padding">

                <div className="w3-third w3-margin-bottom">
                    <div className="w3-padding w3-round-xlarge" style={{ backgroundImage: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)', color: "#ffffff" }}>
                        <div className="w3-left w3-xlarge">
                            <i className="fa fa-newspaper-o" /> <b>News</b>
                        </div>
                        <div className="w3-clear" />
                        <h4>
                            <span><i style={{ fontWeight: "bold" }} className="fa fa-rss-square total-count w3-text-blue-grey" /> {analytics["total"] ? <span>{analytics["total"]}</span> : <i className="w3-spin fa fa-circle-o-notch"></i>}</span>&nbsp;
                            <span><i style={{ fontWeight: "bold" }} className="fa fa-smile-o positive-count w3-text-teal" /> {analytics["positive"] ? <span>{analytics["positive"]}</span> : <i className="w3-spin fa fa-circle-o-notch"></i>}</span>&nbsp;
                            <span><i style={{ fontWeight: "bold" }} className="fa fa-frown-o negative-count w3-text-red" /> {analytics["negative"] ? <span>{analytics["negative"]}</span> : <i className="w3-spin fa fa-circle-o-notch"></i>}</span>
                        </h4>
                    </div>
                </div>
                {
                    fromDate &&
                    (
                        <div className="w3-third w3-margin-bottom" style={{ cursor: 'pointer' }} onClick={showFilter}>
                            <div className="w3-padding w3-round-xlarge" style={{ backgroundImage: 'linear-gradient(to right, #43e97b 0%, #38f9d7 100%)', color: "#ffffff" }}>
                                <div className="w3-left w3-xlarge">
                                    <i className="fa fa-calendar-plus-o" /> <b>Date From</b>
                                </div>
                                <div className="w3-clear" />
                                <h4>{moment(fromDate).format('MMM Do YYYY, h:mm A')}</h4>
                            </div>
                        </div>
                    )
                }
                {
                    toDate &&
                    (
                        <div className="w3-third w3-margin-bottom" style={{ cursor: 'pointer' }} onClick={showFilter}>
                            <div className="w3-padding w3-round-xlarge" style={{ backgroundImage: ' linear-gradient(to right, #fa709a 0%, #fee140 100%)', color: "#ffffff" }}>
                                <div className="w3-left w3-xlarge">
                                    <i className="fa fa-calendar-minus-o" /> <b>Date To</b>
                                </div>
                                <div className="w3-clear" />
                                <h4>{moment(toDate).format('MMM Do YYYY, h:mm A')}</h4>
                            </div>
                        </div>
                    )
                }
                <Tooltip anchorSelect=".total-count" place="top">Total news</Tooltip>
                <Tooltip anchorSelect=".positive-count" place="top">Feeling positive</Tooltip>
                <Tooltip anchorSelect=".negative-count" place="top">Feeling negative</Tooltip>
            </div>

            <>
                {
                    latestNews ? <Slides latestNews={latestNews} /> : <Loader show={true} />
                }
            </>

            <>
                {
                    sentimentsByCategory ?
                        (
                            <div className="w3-margin-top">
                                <div className="svg-container">
                                    <Sentiment data={sentimentsByCategory} fromDate={fromDate} toDate={toDate} />
                                </div>
                            </div>
                        )
                        :
                        <Loader show={sentimentsByCategoryLoading} />
                }
            </>

            <>
                {
                    news ?
                        (
                            <div className="w3-margin-top">
                                <div className="svg-container">
                                    <Overview news={news} fromDate={fromDate} toDate={toDate} />
                                </div>

                                <div className="svg-container">
                                    <Tree news={news} fromDate={fromDate} toDate={toDate} />
                                </div>

                            </div>
                        )
                        :
                        <Loader show={categorizeNewsLoading} />
                }
            </>

        </div>
    )
}