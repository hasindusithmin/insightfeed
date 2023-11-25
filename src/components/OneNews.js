import { useState } from "react";
import Swal from "sweetalert2";
import { PythonAPI } from "../lib/config";
import axios from "axios";
import { Tooltip } from "react-tooltip";
import moment from "moment";
import ReactDOMServer from 'react-dom/server';
import Quora from "./modal-templates/Quora";
import nlp from "compromise/three";

export function OneNews({ object }) {

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

    const { title, description, category, sentiment, named_entities, topic_modeling, timestamp } = object;
    const entities = typeof named_entities === "string" ? named_entities.includes(",") ? named_entities.split(",") : [named_entities] : Array.isArray(named_entities) ? named_entities : Object.keys(named_entities);
    const topics = typeof topic_modeling === "string" ? topic_modeling.includes(",") ? topic_modeling.split(",") : [topic_modeling] : Array.isArray(topic_modeling) ? topic_modeling : Object.keys(topic_modeling);
    const [startSearch, setStartSearch] = useState(false);

    const getMoreNews = () => {
        setStartSearch(true);
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
        axios(options)
            .then(res => {
                setStartSearch(false);
                const data = res.data || [];
                Swal.fire({
                    width: 500,
                    title: `${title} <span class="w3-tag w3-small w3-display-topleft">${data.length} Results found</span>`,
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
                                        <i class="fa fa-clock-o" aria-hidden="true"></i> ${moment(news.pubDate).format("MMM Do YYYY, h:mm A")}
                                    </span>
                                    <a class="w3-right" href="${news.link}" target="_blank" rel="noreferrer">
                                        <i class="fa fa-external-link-square" aria-hidden="true"></i>
                                    </a>
                                </div>
                            </div>
                            `
                    ).join("")}
                    `,
                    showCloseButton: true,
                    showCancelButton: false,
                    showConfirmButton: false
                })
            })
            .catch(err => {
                console.log(err);
                setStartSearch(false);
                Toast.fire({
                    icon: "info",
                    title: "Oops! No matching data found"
                });
            })
    }

    const [Entity, SetEntity] = useState("");

    function getEntity(word) {
        const doc = nlp(word);
        let people = doc.people().normalize().text();
        let place = doc.places().normalize().text();
        let organizations = doc.organizations().normalize().text();
        let acronyms = doc.acronyms().normalize().text();
        if (people)
            return "Person"
        else if (place)
            return "Place"
        else if (organizations)
            return "Organization"
        else if (acronyms)
            return "Acronyms"
        else
            return "Entity"
    }

    const PREX = "_button";
    async function getQuoraResults(event) {
        const topic = event.target.id;
        try {
            document.getElementById(topic).className = "w3-spin fa fa-spinner";
            document.getElementById(topic + PREX).disabled = true;
            const options = {
                url: PythonAPI + "/quora",
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    "topic": topic
                }
            };
            const res = await axios(options);
            Swal.fire({
                title: `Results for ${topic}`,
                customClass: {
                    title: "w3-large w3-text-dark-grey",
                    htmlContainer: "scrollable-container",
                },
                html: ReactDOMServer.renderToString(<Quora results={res.data} />),
                showConfirmButton: false,
                showCloseButton: true,
            })
        } catch (error) {
            Toast.fire({
                icon: "info",
                title: "Oops! No matching data found"
            });
        }
        finally {
            document.getElementById(topic).className = "fa fa-info-circle";
            document.getElementById(topic + PREX).disabled = false;
        }
    }

    function toCapitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    return (
        <div className="scrollable-container w3-card w3-round-large w3-panel w3-padding" style={{ margin: '5px 5px' }}>
            <div className='w3-large'>
                <span className='sentiment'>{sentiment === "positive" ? <i className="fa fa-smile-o" style={{ color: "green" }}></i> : <i className="fa fa-frown-o" style={{ color: "red" }}></i>}</span>&nbsp;&nbsp;<span className='category w3-opacity' style={{ fontWeight: "bold" }}>{toCapitalize(category)} News</span>
            </div>
            <div className="w3-large" style={{ fontWeight: 'bold', marginTop: 5 }}>
                {title}
            </div>
            <hr />
            <div className="w3-justify w3-medium w3-text-dark-grey w3-hover-text-black">
                {
                    description ?
                        <span className="">{description}</span>
                        :
                        <span className="w3-text-red">
                            Sorry, there's no information available about this news at the moment.
                        </span>
                }
            </div>
            <br />
            <div className="w3-padding">
                {entities.map((entity, index) => (
                    <button
                        key={index}
                        style={{ margin: '5px', cursor: "default" }}
                        className="w3-large w3-button w3-padding-small w3-grey w3-round-large w3-text-white w3-hover-text-black"
                    >
                        <span className='entity' data-tooltip-content={getEntity(entity)} style={{ cursor: "pointer" }}><i className="fa fa-info-circle" aria-hidden="true"></i></span>&nbsp;{entity}
                    </button>
                ))}
            </div>
            <div className="w3-padding">
                {topics.map((topic, index) => (
                    <button
                        id={topic + PREX}
                        key={index}
                        style={{ margin: '5px', cursor: "default" }}
                        className="w3-large w3-button w3-padding-small w3-dark-grey w3-round-large w3-hover-text-black"
                    >
                        <span className='topic' style={{ cursor: "pointer" }} ><i id={topic} className="fa fa-info-circle" onClick={getQuoraResults}></i></span>&nbsp;{topic}
                    </button>
                ))}
            </div>
            <div className="w3-padding w3-left w3-text-dark-grey w3-hover-text-black">
                <span className='w3-large'>
                    <i className="fa fa-clock-o" aria-hidden="true"></i> {moment(timestamp).format('MMM Do YYYY, h:mm A')}
                </span>
            </div>
            <br />
            <div className="w3-padding w3-center w3-large">
                <button style={{ cursor: "default" }} className='w3-button w3-blue-grey w3-opacity-min w3-text-white w3-round-xlarge' onClick={getMoreNews} disabled={startSearch}>
                    {startSearch ? <span className='search'><i className="w3-spin fa fa-spinner"></i></span> : <span className='more'><i className="fa fa-info-circle" style={{ cursor: "pointer" }}></i></span>} Explore More
                </button>
            </div>
            <Tooltip anchorSelect=".category" place="top">
                Category
            </Tooltip>
            <Tooltip anchorSelect=".sentiment" place="top">
                {sentiment === "positive" ? "Feeling is good" : "Feeling is not so good"}
            </Tooltip>
            <Tooltip anchorSelect=".entity" place="top" render={({ content }) => content} />
            <Tooltip anchorSelect=".topic" place="top">
                Explore Quora Q&A: Click here
            </Tooltip>
            <Tooltip anchorSelect=".more" place="top">
                Read additional news: Click here
            </Tooltip>
            <Tooltip anchorSelect=".search" place="top">
                Searching...
            </Tooltip>
        </div>
    );
}