import axios from "axios"
import { useEffect, useState } from "react"
import { NodeAPI } from "../lib/config"
import moment from "moment"
import Overview from "../charts/Overview";
import Loader from "../components/Loaders";
import Tree from "../charts/Tree";
import Swal from "sweetalert2";

export default function Home() {

    const [fromDate, setFromDate] = useState(moment().startOf("day").valueOf());
    const [toDate, setToDate] = useState(moment().valueOf());
    const [news, setNews] = useState(null);

    useEffect(() => {
        const options = {
            url: NodeAPI + "/getSortedDocumentsWithGroupBy",
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                database: "InsightFeed",
                collection: "news",
                filter: { "timestamp": { "$gte": fromDate, "$lte": toDate }, "analyzed": true, "sentiment": { "$ne": null } },
                sort: { "timestamp": -1 },
                group: "category"
            }
        };
        axios(options)
            .then(res => {
                setNews(res.data);
            })
            .catch(err => {
                // setNews(null);
                console.log(err);
            })
    }, [])

    const showFilter = () => {
        Swal.fire({
            customClass: {
                htmlContainer: "w3-container",
                confirmButton: "w3-green"
            },
            position: "top-end",
            html: `
                <div class="w3-xlarge">
                    <i class="fa fa-calendar-check"></i> Datetime Filter
                </div>
                <label class="w3-left">From Date</label>
                <input type="text" id="from-date" class="w3-input w3-border" value="${moment(fromDate).format('YYYY-MMM-DD h:mm A')}" placeholder="YYYY-MMM-DD h:mm A">
                <br>
                <label class="w3-left">To Date</label>
                <input type="text" id="to-date" class="w3-input w3-border" value="${moment(toDate).format('YYYY-MMM-DD h:mm A')}" placeholder="YYYY-MMM-DD h:mm A">
          `,
            showCloseButton: true,
            showCancelButton: false,
            confirmButtonText: "<i class='fa fa-filter'></i>",
            showLoaderOnConfirm: true,
            preConfirm: () => {
                const Toast = Swal.mixin({
                    toast: true,
                    position: "top-end",
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    didOpen: (toast) => {
                        toast.onmouseenter = Swal.stopTimer;
                        toast.onmouseleave = Swal.resumeTimer;
                    }
                });
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
                        title: "To date must be earlier than the current time"
                    });
                    return
                }
                const validate_2 = M_to.isAfter(M_from)
                if (!validate_2) {
                    Toast.fire({
                        icon: "error",
                        title: "To date must be later than the the From date"
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
                        Swal.showValidationMessage(err)
                    })
            }
        });
    }

    return (
        <div className="w3-content w3-panel">

            <div className="w3-display-container">
                <div className="w3-display-topright">
                    <button className="w3-button w3-green w3-round-large" onClick={showFilter}>
                        <i className="fa fa-filter"></i>
                    </button>
                </div>
            </div>
            <div className="w3-center w3-xxlarge w3-padding-64">
                Insight<span className="w3-tag">Feed</span>
            </div>
            {news ? (
                <>
                    <div className="chart-container">
                        <Overview news={news} fromDate={fromDate} toDate={toDate} />
                    </div>

                    <div className="chart-container">
                        <Tree news={news} fromDate={fromDate} toDate={toDate} />
                    </div>

                </>
            ) : <Loader />}
        </div>
    )
}