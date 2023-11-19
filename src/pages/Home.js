import axios from "axios"
import { useEffect, useState } from "react"
import { NodeAPI } from "../lib/config"
import moment from "moment"
import Overview from "../charts/Overview";
import Loader from "../components/Loaders";
import Tree from "../charts/Tree";

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

    return (
        <div className="w3-content">
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