import axios from "axios"
import { useEffect, useState } from "react"
import { NodeAPI, dataPreProcess, getAxiosOptions } from "../lib/config"
import moment from "moment"
import Loader from "../components/Loaders";
import Tree from "../charts/Tree";
import Swal from "sweetalert2";
import Vortex from "../components/Vortex";
import { Typewriter } from 'react-simple-typewriter'
import Slides from "../components/Slides";
import { Tooltip } from "react-tooltip";
import LineSentiment from "../charts/LineSentiment";
import NERWordCloud from "../charts/NERWordCloud";
import TMWordCloud from "../charts/TMWordCloud";
import ALLNewsView from "../components/ALLNews";

export default function Home() {
    let run = true; //don't remove

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

    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [latestNews, setLatestNews] = useState(null);
    const [analytics, setAnalytics] = useState({ total: 0, positive: 0, negative: 0 });
    const [disableFilter, setDisbleFilter] = useState(true);

    const [Line, SetLine] = useState(null);
    const [BarAndTree, SetBarAndTree] = useState(null);
    const [NER_WC, SetNER_WC] = useState(null);
    const [TM_WC, SetTM_WC] = useState(null);
    const [ALLNEWS, SetALLNEWS] = useState(null);

    function RENDER(ID, PAYLOAD) {
        if (ID === "COUNTS") {
            const data = { total: 0, positive: 0, negative: 0 }
            if (PAYLOAD.length > 0) {
                for (const { _id, count } of PAYLOAD) {
                    data[_id] = count
                }
                data["total"] = data["positive"] + data["negative"];
                setAnalytics(data);
            }
        }
        else if (ID === "LINE") {
            const array = []
            for (const { _id, sentiments } of PAYLOAD) {
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
            SetLine(arr);
        }
        else if (ID === "BAR&TREE") {
            SetBarAndTree(dataPreProcess(PAYLOAD));
        }
        else if (ID === "WORDCLOUD") {
            const data = PAYLOAD.map(obj => {
                return {
                    ...obj,
                    named_entities: typeof obj.named_entities === "string" ? obj.named_entities.includes(",") ? obj.named_entities.split(",") : [obj.named_entities] : Array.isArray(obj.named_entities) ? obj.named_entities : Object.keys(obj.named_entities),
                    topic_modeling: typeof obj.topic_modeling === "string" ? obj.topic_modeling.includes(",") ? obj.topic_modeling.split(",") : [obj.topic_modeling] : Array.isArray(obj.topic_modeling) ? obj.topic_modeling : Object.keys(obj.topic_modeling)
                }
            })
            SetNER_WC([... new Set(data.map(({ named_entities }) => named_entities).flat())]);
            SetTM_WC([... new Set(data.map(({ topic_modeling }) => topic_modeling).flat())])
        }
        else if (ID === "ALLNEWS") {
            SetALLNEWS(dataPreProcess(PAYLOAD))
        }

    }

    function NOT_RENDER(ID) {
        if (ID === "COUNTS") {
            setAnalytics({ total: 0, positive: 0, negative: 0 });
        }
        else if (ID === "LINE") {
            SetLine("\"Oops! Can't show the view right now. Try again later!\"")
        }
        else if (ID === "BAR&TREE") {
            SetBarAndTree("\"Oops! Can't show the view right now. Try again later!\"");
        }
        else if (ID === "WORDCLOUD") {
            SetNER_WC("\"Oops! Can't show the view right now. Try again later!\"")
            SetTM_WC("\"Oops! Can't show the view right now. Try again later!\"")
        }
        else if (ID === "ALLNEWS") {
            SetALLNEWS("\"Oops! Can't show the view right now. Try again later!\"");
        }
    }

    function getPromiseFunctionList(dateFrom, dateTo) {

        setAnalytics({ total: 0, positive: 0, negative: 0 }); setFromDate(null); setToDate(null);
        SetLine(null); SetBarAndTree(null);
        const axiosOptions = getAxiosOptions(dateFrom, dateTo);
        return axiosOptions.map(option => ({ "ID": option.type, "trigger": () => axios(option) }));
    }

    function getData(retry, dateFrom, dateTo, promiseFunctionList) {

        if (retry > 3) {
            promiseFunctionList.map(({ ID }) => NOT_RENDER(ID))
            return
        }
        return Promise.allSettled(promiseFunctionList.map(({ trigger }) => trigger()))
            .then(responses => {
                setFromDate(dateFrom); setToDate(dateTo);

                const rejectedPromiseFunctionList = [];
                for (const { status, value, reason } of responses) {
                    if (status === "fulfilled") {
                        const { data, config } = value;
                        const { id } = JSON.parse(config.data);
                        RENDER(id, data);
                    }
                    if (status === "rejected") {
                        const { config } = reason;
                        const { id } = JSON.parse(config.data);
                        const axiosOptions = getAxiosOptions(dateFrom, dateTo);
                        const option = axiosOptions.find(opt => opt.type === id);
                        rejectedPromiseFunctionList.push({ "ID": option.type, "trigger": () => axios(option) })
                    }
                }
                if (rejectedPromiseFunctionList.length > 0) {
                    retry++;
                    getData(retry, dateFrom, dateTo, rejectedPromiseFunctionList);
                }
                else {
                    setDisbleFilter(false);
                }
            })

    }

    useEffect(() => {
        function getLatestNews(retry = 0, dateFrom, dateTo) {
            if (retry >= 3) {
                Toast.fire({
                    icon: "warning",
                    title: "Can you please try again in a few minutes?"
                });
                return
            }
            const options = {
                type: "LATESTNEWS",
                url: NodeAPI + "/getDocuments",
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    id: "LATESTNEWS",
                    database: "InsightFeed",
                    collection: "news",
                    filter: {
                        "analyzed": true,
                        "sentiment": { "$ne": null },
                        "description": { "$ne": null },
                        "timestamp": { "$gte": dateFrom, "$lte": dateTo }
                    },
                    sort: { "timestamp": -1 },
                    limit: 20
                }
            };
            axios(options)
                .then(res => {
                    if (res.data.length < 10) {
                        const recommendedDateFrom = moment().startOf("day").subtract(6, 'hours').valueOf();
                        getLatestNews(0, recommendedDateFrom, dateTo);
                    } else {
                        setLatestNews(res.data);
                        const promiseFunctionList = getPromiseFunctionList(dateFrom, dateTo);
                        getData(0, dateFrom, dateTo, promiseFunctionList);
                    }
                })
                .catch(err => {
                    console.log(err);
                    retry++;
                    getLatestNews(retry, dateFrom, dateTo);
                })
        }
        if (run) {
            run = false;
            const dateFrom = moment().startOf("day").valueOf(), dateTo = moment().valueOf();
            getLatestNews(0, dateFrom, dateTo);
        }
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
                const promiseFunctionList = getPromiseFunctionList(newFrom, newTo);
                return getData(0, newFrom, newTo, promiseFunctionList);
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
                const promiseFunctionList = getPromiseFunctionList(newFrom, newTo);
                return getData(0, newFrom, newTo, promiseFunctionList);
            }
        });
    }

    const [showAnimate, setShowAnimate] = useState(false);

    return (
        <div className="w3-content w3-panel">

            <div></div>
            <div className="w3-display-container">
                <div className="w3-display-topright">
                    <button className="w3-button w3-green w3-round-large" onClick={() => showFilter("top-end")} disabled={disableFilter}>
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
                    <Typewriter words={['Gauge News Emotions: Positive Or Negative', 'Identify Key Names And Places In News Content', 'Uncover Trending News Themes Quickly', 'Organize News Stories Into Relevant Categories', 'Present News Insights Visually For Quick Understanding']} loop={100} cursor cursorStyle='_' />
                </div>
            </div>


            {/* Summary Dashboard */}
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

                <div className="w3-third w3-margin-bottom" style={{ cursor: 'pointer' }} onClick={showFilter}>
                    <div className="w3-padding w3-round-xlarge" style={{ backgroundImage: 'linear-gradient(to right, #43e97b 0%, #38f9d7 100%)', color: "#ffffff" }}>
                        <div className="w3-left w3-xlarge">
                            <i className="fa fa-calendar-plus-o" /> <b>Date From</b>
                        </div>
                        <div className="w3-clear" />
                        <h4>{fromDate ? moment(fromDate).format('MMM Do YYYY, h:mm A') : <i className="w3-spin fa fa-circle-o-notch"></i>}</h4>
                    </div>
                </div>

                <div className="w3-third w3-margin-bottom" style={{ cursor: 'pointer' }} onClick={showFilter}>
                    <div className="w3-padding w3-round-xlarge" style={{ backgroundImage: ' linear-gradient(to right, #fa709a 0%, #fee140 100%)', color: "#ffffff" }}>
                        <div className="w3-left w3-xlarge">
                            <i className="fa fa-calendar-minus-o" /> <b>Date To</b>
                        </div>
                        <div className="w3-clear" />
                        <h4>{toDate ? moment(toDate).format('MMM Do YYYY, h:mm A') : <i className="w3-spin fa fa-circle-o-notch"></i>}</h4>
                    </div>
                </div>

                <Tooltip anchorSelect=".total-count" place="top">Total news</Tooltip>
                <Tooltip anchorSelect=".positive-count" place="top">Feeling positive</Tooltip>
                <Tooltip anchorSelect=".negative-count" place="top">Feeling negative</Tooltip>
            </div>


            <>
                {/* Latest News Swiper  */}
                {
                    latestNews ? <Slides latestNews={latestNews} /> : <Loader />
                }
            </>

            <>
                {/* Line Chart - Sentiments  */}
                {
                    typeof Line === "string" ?
                        (
                            <div className="w3-margin-top">
                                <p className="w3-text-red w3-large w3-padding-32 w3-center" style={{ fontWeight: "bold" }}>
                                    <i className="w3-hover-text-black">{Line}</i>
                                </p>
                            </div>
                        )
                        :
                        Line && BarAndTree ?
                            (
                                <div className="w3-margin-top">
                                    <div className="svg-container hide-scrollbar" style={{ overflow: "hidden" }}>
                                        <LineSentiment data={Line} fromDate={fromDate} toDate={toDate} news={BarAndTree} />
                                    </div>
                                </div>
                            )
                            :
                            <Loader />
                }
            </>

            <>
                {/* ALL News View  */}
                {
                    typeof ALLNEWS === "string" ?
                        (
                            <div className="w3-margin-top">
                                <p className="w3-text-red w3-large w3-padding-32 w3-center" style={{ fontWeight: "bold" }}>
                                    <i className="w3-hover-text-black">{ALLNEWS}</i>
                                </p>
                            </div>
                        )
                        :
                        ALLNEWS ?
                            <ALLNewsView data={ALLNEWS} />
                            :
                            <Loader />
                }
            </>

            <>
                {/* Word Cloud - Named Entity Recognition  */}
                {
                    typeof NER_WC === "string" ?
                        (
                            <div className="w3-margin-top">
                                <p className="w3-text-red w3-large w3-padding-32 w3-center" style={{ fontWeight: "bold" }}>
                                    <i className="w3-hover-text-black">{NER_WC}</i>
                                </p>
                            </div>
                        )
                        :
                        NER_WC ?
                            (
                                <div className="w3-margin-top w3-border">
                                    <div className="scrollable-container">
                                        <div className="svg-container">
                                            <NERWordCloud data={NER_WC} fromDate={fromDate} toDate={toDate} />
                                        </div>
                                    </div>
                                </div>
                            )
                            :
                            <Loader />
                }
            </>

            <>
                {/* Word Cloud - Topic Modeling  */}
                {
                    typeof TM_WC === "string" ?
                        (
                            <div className="w3-margin-top">
                                <p className="w3-text-red w3-large w3-padding-32 w3-center" style={{ fontWeight: "bold" }}>
                                    <i className="w3-hover-text-black">{TM_WC}</i>
                                </p>
                            </div>
                        )
                        :
                        TM_WC ?
                            (
                                <div className="w3-margin-top w3-border">
                                    <div className="scrollable-container">
                                        <div className="svg-container">
                                            <TMWordCloud data={TM_WC} fromDate={fromDate} toDate={toDate} />
                                        </div>
                                    </div>
                                </div>
                            )
                            :
                            <Loader />
                }
            </>

            {/* Tree Chart  */}
            <>
                {
                    BarAndTree ?
                        (
                            <div className="w3-margin-top w3-border">
                                <div className="scrollable-container">
                                    <div className="svg-container">
                                        <Tree news={BarAndTree} fromDate={fromDate} toDate={toDate} />
                                    </div>
                                </div>
                            </div>
                        )
                        :
                        <Loader />
                }
            </>



            <div className="w3-padding-32"></div>
        </div>
    )
}