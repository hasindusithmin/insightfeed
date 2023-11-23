import { EffectCards } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import moment from 'moment';
import { Tooltip } from 'react-tooltip'
import Swal from 'sweetalert2';
import { useState } from 'react';
import axios from 'axios';
import { NewsAPI } from '../lib/config';


function Card({ object }) {
    const { title, description, category, sentiment, named_entities, topic_modeling, timestamp } = object;
    const entities = typeof named_entities === "string" ? named_entities.includes(",") ? named_entities.split(",") : [named_entities] : Array.isArray(named_entities) ? named_entities : Object.keys(named_entities);
    const topics = typeof topic_modeling === "string" ? topic_modeling.includes(",") ? topic_modeling.split(",") : [topic_modeling] : Array.isArray(topic_modeling) ? topic_modeling : Object.keys(topic_modeling);
    const [startSearch, setStartSearch] = useState(false);
    const openModal = (retry = 0) => {
        setStartSearch(true);
        if (retry >= 2) {
            setStartSearch(false);
            return
        }
        const options = {
            url: NewsAPI + "/hotnews/v2",
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
                    showConfirmButton: false
                })
            })
            .catch(err => {
                console.log(err);
                retry++;
                openModal(retry);
            })
    }
    return (
        <div className="scrollable-container w3-round-xlarge w3-panel w3-padding" style={{ margin: '10px 5px' }}>
            <div className="w3-padding w3-right">
                <span className='sentiment w3-xlarge' >
                    {sentiment === "positive" ? <i className="fa fa-smile-o" style={{ color: "green" }}></i> : <i className="fa fa-frown-o" style={{ color: "red" }}></i>}
                </span>
            </div>
            <div className="w3-large" style={{ fontWeight: 'bold' }}>
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
                    <span
                        key={index}
                        style={{ margin: '5px' }}
                        className="w3-large w3-tag w3-padding-small w3-dark-grey w3-opacity w3-round-large w3-hover-text-dark-grey"
                    >
                        <span className='entity'><i className="fa fa-info-circle" aria-hidden="true"></i></span>&nbsp;{entity}
                    </span>
                ))}
            </div>
            <div className="w3-padding">
                {topics.map((topic, index) => (
                    <span
                        key={index}
                        style={{ margin: '5px' }}
                        className="w3-large w3-tag w3-padding-small w3-black w3-opacity w3-round-large w3-hover-text-dark-grey"
                    >
                        <span className='topic'><i className="fa fa-info-circle" aria-hidden="true"></i></span>&nbsp;{topic}
                    </span>
                ))}
            </div>
            <div className="w3-padding w3-left w3-text-dark-grey w3-hover-text-black">
                <span className='w3-large'>
                    <i className="fa fa-clock-o" aria-hidden="true"></i> {moment(timestamp).format('MMM Do YYYY, h:mm A')}
                </span>
            </div>
            <div className="w3-padding w3-right" style={{ fontWeight: 'bold' }}>
                <span className='category w3-tag w3-green w3-opacity-min w3-round-large w3-medium'>{category}</span>
            </div>
            <div className="w3-padding w3-center w3-large">
                <button className='w3-button w3-blue-grey w3-opacity-min w3-text-white w3-round-xlarge' onClick={openModal} disabled={startSearch}>
                    {startSearch ? <span className='search'><i className="w3-spin fa fa-spinner"></i></span> : <span className='more'><i className="fa fa-info-circle"></i></span>} Explore More
                </button>
            </div>
            <Tooltip anchorSelect=".category" place="top">
                Category
            </Tooltip>
            <Tooltip anchorSelect=".sentiment" place="top">
                {sentiment === "positive" ? "Feeling is good" : "Feeling is not so good"}
            </Tooltip>
            <Tooltip anchorSelect=".entity" place="top">
                Entity
            </Tooltip>
            <Tooltip anchorSelect=".topic" place="top">
                Topic
            </Tooltip>
            <Tooltip anchorSelect=".more" place="top">
                See more news by clicking here
            </Tooltip>
            <Tooltip anchorSelect=".search" place="top">
                Searching...
            </Tooltip>
        </div>
    );
}

export default function Slides({ latestNews: data }) {

    return (
        <div className='w3-padding-large'>
            <Swiper
                effect={'cards'}
                grabCursor={true}
                modules={[EffectCards]}
            >
                {
                    data.map(object => (
                        <SwiperSlide key={object['_id']} className='w3-light-grey'>
                            <Card key={object._id} object={object} />
                        </SwiperSlide>
                    ))
                }
            </Swiper>
        </div >
    );
}