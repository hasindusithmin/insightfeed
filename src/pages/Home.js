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

export default function Home() {

    const [fromDate, setFromDate] = useState(moment().startOf("day").valueOf());
    const [toDate, setToDate] = useState(moment().valueOf());
    const [news, setNews] = useState(null);
    const [latestNews, setLatestNews] = useState(null);

    useEffect(() => {
        function getLatestNews(retry) {
            if (retry >= 3) {
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
                    function getCategorizeNews(retry) {
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
                                database: "InsightFeed",
                                collection: "news",
                                filter: {
                                    "timestamp": { "$gte": fromDate, "$lte": toDate },
                                    "analyzed": true,
                                    "sentiment": { "$ne": null }
                                },
                                sort: { "timestamp": -1 },
                                group: "category"
                            }
                        };
                        axios(options)
                            .then(res => {
                                setNews(res.data);
                            })
                            .catch(err => {
                                console.log(err);
                                retry++;
                                getCategorizeNews(retry)
                            })
                    }
                    getCategorizeNews(0)
                })
                .catch(err => {
                    console.log(err);
                    retry++;
                    getLatestNews(retry);
                })
        }
        getLatestNews(0);
    }, [])

    const showFilter = (position = "center") => {
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
        Swal.fire({
            customClass: {
                title: "w3-xlarge",
                htmlContainer: "w3-container",
                confirmButton: "w3-green",
                denyButton: "w3-red"
            },
            title: "<i class=\"fa fa-calendar\" aria-hidden=\"true\"></i> DATE FILTER",
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
                const options = {
                    url: NodeAPI + "/getSortedDocumentsWithGroupBy",
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        database: "InsightFeed",
                        collection: "news",
                        filter: { "timestamp": { "$gte": moment().startOf("day").valueOf(), "$lte": moment().valueOf() }, "analyzed": true, "sentiment": { "$ne": null } },
                        sort: { "timestamp": -1 },
                        group: "category"
                    }
                };
                return axios(options)
                    .then(res => {
                        setFromDate(moment().startOf("day").valueOf())
                        setToDate(moment().valueOf())
                        setNews(res.data);
                    })
                    .catch(err => {
                        console.log(err);
                        Toast.fire({
                            icon: "error",
                            title: err.message
                        });
                    })
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
                const options = {
                    url: NodeAPI + "/getSortedDocumentsWithGroupBy",
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        database: "InsightFeed",
                        collection: "news",
                        filter: { "timestamp": { "$gte": M_from.valueOf(), "$lte": M_to.valueOf() }, "analyzed": true, "sentiment": { "$ne": null } },
                        sort: { "timestamp": -1 },
                        group: "category"
                    }
                };
                return axios(options)
                    .then(res => {
                        setFromDate(M_from.valueOf())
                        setToDate(M_to.valueOf())
                        setNews(res.data);
                    })
                    .catch(err => {
                        console.log(err);
                        Toast.fire({
                            icon: "error",
                            title: err.message
                        });
                    })
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
                {
                    true &&
                    (
                        <div className="w3-third w3-margin-bottom">
                            <div className="w3-padding w3-round-xlarge" style={{ backgroundImage: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)', color: "#ffffff" }}>
                                <div className="w3-left w3-xlarge">
                                    <i className="fa fa-rss" /> <b>News</b>
                                </div>
                                <div className="w3-clear" />
                                <h4>
                                    {
                                        news ?
                                            <span>{news.reduce((accumulator, item) => accumulator + item.data.length, 0)} Results Found</span>
                                            :
                                            <span><i className="w3-spin fa fa-spinner"></i> Calculating...</span>
                                    }
                                </h4>
                            </div>
                        </div>
                    )
                }
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
            </div>

            <>
                {
                    latestNews ? <Slides latestNews={latestNews} /> : <Loader show={true} />
                }
            </>

            <>
                {
                    news ? (
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
                        <Loader show={latestNews} />
                }
            </>
        </div>
    )
}