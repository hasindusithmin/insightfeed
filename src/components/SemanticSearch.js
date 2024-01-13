import axios from "axios";
import { useState } from "react"
import { PythonAPI } from "../lib/config";
import { OneNews } from "./OneNews";


export default function SemanticSearch() {

    const [run, setRun] = useState(false);
    const [news, setNews] = useState(null);

    const getSearchResults = (event) => {
        if (event.key === 'Enter' && event.target.value !== '') {
            setRun(true);
            const options = {
                url: PythonAPI + "/search",
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                params: {
                    "query": event.target.value
                }
            };
            axios(options)
                .then(result => {
                    setNews(result.data);
                })
                .catch(error => {
                    console.log(error.message);
                })
                .finally(() => {
                    setRun(false);
                })
        }
    }

    return (
        <div className="w3-margin-top" style={{ width: "50%", margin: "auto" }}>
            <div className="w3-mobile">
                <input type="text" placeholder="semantic search" className="w3-input w3-border w3-round-large" onKeyPress={getSearchResults} disabled={run} />
            </div>
            {
                news &&
                (
                    <div className="w3-margin-top w3-card">
                        <div className="scrollable-container">
                            {
                                news.map(object => <OneNews key={object.id} object={object} />)
                            }
                        </div>
                    </div>
                )
            }
        </div>
    )
}