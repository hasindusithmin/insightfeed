import { useEffect, useState } from "react";
import { PythonAPI } from "../lib/config";
import axios from "axios";
import { EffectCards } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import Swal from "sweetalert2";
import moment from "moment";
import {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} from "@google/generative-ai"
import LocalPie from "../charts/LocalPie";

export default function Local() {
    let run = true; //don't remove
    useEffect(() => {
        if (run) {
            run = false;
            getLocalNews(0)
        }
    }, [])

    const getLocalNews = (retry) => {

        Toast.fire({
            icon: "info",
            title: "Please Wait..."
        });
        setLocalNews([1]);

        if (retry > 1) {
            Toast.fire({
                icon: "error",
                title: "Cannot find data"
            });
            return
        }

        const options = {
            url: PythonAPI + "/local",
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        axios(options)
            .then(res => {
                Toast.close();
                setLocalNews(res.data);
                getSentiment(res.data)
            })
            .catch(error => {
                retry++
                Toast.close();
                getLocalNews(retry)
            })
    }

    const [localNews, setLocalNews] = useState([1]);

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

    function formatDate(dateString) {
        const parsedDate = moment.utc(dateString, "ddd, DD MMM YYYY HH:mm:ss Z");
        const browserTimezoneDate = parsedDate.local();
        const formattedDate = browserTimezoneDate.format("MMM Do YYYY, h:mm A");
        return formattedDate;
    }

    function parsePrompt(suggestion) {
        const newlineRegex = /\n/;
        const commaRegex = /,/;
        const colonRegex = /:/;
        const branchRegex = /\(/;
        const hasNewline = newlineRegex.test(suggestion);
        const hasComma = commaRegex.test(suggestion);
        const hasColon = colonRegex.test(suggestion);
        const hasBranch = branchRegex.test(suggestion);

        let array = [];

        if (hasNewline && hasColon) {
            const _ = suggestion.split('\n').map(e => e.split(':'));
            array = _.map(item => [item[0].trim(), parseInt(item[1])]);
        } else if (hasNewline && hasBranch) {
            const _ = suggestion.split('\n').map(e => e.split('('));
            array = _.map(item => [item[0].trim(), parseInt(item[1])]);
        } else if (hasComma && hasColon) {
            const _ = suggestion.split(',').map(e => e.split(':'));
            array = _.map(item => [item[0].trim(), parseInt(item[1])]);
        } else if (hasComma && hasBranch) {
            const _ = suggestion.split(',').map(e => e.split('('));
            array = _.map(item => [item[0].trim(), parseInt(item[1])]);
        }
        return array.length >= 10 ? array.slice(0, 10) : array;
    }

    const [data, setData] = useState(null);

    async function getSentiment(data) {

        const feedStr = data.map(({ description }, i) => `${i + 1}. ${description}`).join("\n");
        const parts = [
            { text: "First, Identify the relevant topics of given texts. then, determine the number of texts related to each topics. list down the top 10 topics and the number of texts in descending order." },
            { text: "input: 1. Social media applications provide a widespread platform to promote and sell your products and services. Grabbing a high audience on social media profiles can do wonders for your business growth. Here are some tips for maintaining a massive lead-generating social media profile. Follow them to get the maximum benefits of social media platforms. #socialmediamarketing #developsocialmedia #socialmediamanagement #socialmediamarketingagency #businessgrowthstrategy #brandix #brandixsoft #brandixuk #brandixsoftuk \n2. We know Monday Blues come to you and sometimes you don't go well on Tuesdays too. Don't worry and gird up your loin for Wednesdays. It's a call to action to seize the opportunities Wednesday presents. Whether it's tackling pending tasks, starting something new, or re-energising your goals, this mindset encourages you to set the tone for the rest of the week. #wednesdaymood #wednesdayvibes #winthisday #mondayblues #brandix #brandixsoft #brandixsoftpk #brandixpk #lifeatbrandix #lifeatbrandixsoft #lifeatbrandixsoftpk\n3. Shalini Warrier Lakshmi Mukkavilli Shirin Salis Rajani Seshadri Shobha Dixit Hema Mani Hema M Srinivas Dr. Sindhuja R Varma Gowri Kailasam Nandita Sethi Nandini Sarkar (she/her/hers) Divya Varadarajan Medar Avanti Natarajan Anantha Chittilla Dr Usha Pantula Savitha Kesav Jagadeesan Dr T Vasudha Consultant Head of Wellness nd CSR, Brandix India Rajalakshmi Subramanian Kirthika Shivkumar Sajana Shankaran Anupamaa V Uma Aysola Bincy Baby Rebecca Stanley\n4. Team RITE Riders (Our Cycling Club) not only conquered new horizons from Colombo to Dambulla but also built a vibrant community and lasting friendships along the way! From meticulous planning to exemplary leadership, this cycling adventure embodied the essence of teamwork, passion, and personal growth. Lessons learned include the power of a great team, the importance of planning, and the motivation derived from challenging the seemingly impossible. The RITE Riders reflect on this transformative experience as they plan the next ride. Yoosuf Faizal Nadeesha Paranagama Dilhan Fernando Priyanga Dassanayake #Brandix #InspiredPeople #InspiredSolutions #RITEriders #Teamwork #PersonalGrowth #CyclingAdventure\n5. In stress management it is not always reducing stresors. Teams have to gothrough the stressors to deliver the organizational goal. To deal with the stressor we need tools and techniques to enhance the resilience. Its all aboutbthe inside. #brandix #trainiganddevelopment" },
            { text: "output: Social Media Marketing Tips: 1, Stress Management Techniques: 1, Motivation for Wednesday: 1, RITE Riders Cycling Adventure: 1, Women Leaders at Brandix: 1" },
            { text: "input: 1. Did the police stop you? Don't be intimidated! ✊🏽 Learn when the police can stop you, what information you're obligated to provide, and your rights during searches and arrests. Knowledge is power. Educate yourself and your loved ones; swipe now! - - - #pulse #pulselk #livingit https://t.co/93nrifizRj\n2. Know your rights infographics Did the police stop you? Don’t be intimidated! ✊🏽 Learn when the police can stop you, what information you're obligated to provide, and your rights during searches and arrests. Knowledge is power. Educate yourself and your loved ones; swipe now! https://t.co/Veh4ArW5gt\n3. Sri Lanka's Nilupulie Karunaratne won the Mrs. Australia World 2023 competition earning the opportunity to represent Australia in the Mrs. World Beauty Pageant. Read more: https://t.ly/zI1ue #PulseToday #lka #SLNews #SriLanka #MrsAustraliaWorld https://t.co/V3aYEWM0RZ\n4. They didn't found anything illegal in his belongings, he never used drugs. They kept them in a police station for 4 hours and released. @hrw Please take note of this. Police thugs paid from our tax money to violate our rights. @RW_UNP @TiranAlles where is the justice? (3/n)\n5." },
            { text: "output: Police Rights Information: 2, Mrs. Australia World Winner 2023: 1, Intimidation during Police Stops: 1" },
            { text: `input: ${feedStr}` },
            { text: "output: " },
        ];
        const generationConfig = {
            temperature: 0.2,
            topK: 40,
            topP: 0.8,
            maxOutputTokens: 1024,
        };
        const safetySettings = [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            },
            {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            },
            {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            },
            {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            },
        ];
        const MODEL_NAME = "gemini-pro";
        const API_KEY = process.env.REACT_APP_GEMINI;
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });
        const result = await model.generateContent({
            contents: [{ role: "user", parts }],
            generationConfig,
            safetySettings,
        });

        const response = result.response;
        const _ = response.text();
        const array = parsePrompt(_);
        setData(array);
    }

    return (
        <>
            <div className='w3-padding-large'>
                <Swiper
                    effect={'cards'}
                    grabCursor={true}
                    modules={[EffectCards]}
                >
                    {
                        localNews.map(({ title, image, description, pubDate }) => (
                            <SwiperSlide key={Math.random()} className='w3-light-grey'>
                                <div className="w3-round-xlarge w3-panel w3-padding">
                                    {
                                        title &&
                                        <div className="w3-large" style={{ fontWeight: 'bold', marginTop: 5 }}>
                                            {title}
                                        </div>
                                    }
                                    {
                                        image &&
                                        <div className="w3-padding w3-center">
                                            <img src={image} alt="image" className="w3-image" width="50%" />
                                        </div>
                                    }
                                    {
                                        description &&
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
                                    }
                                    {
                                        pubDate &&
                                        <div className="w3-padding w3-left w3-text-dark-grey w3-hover-text-black">
                                            <span className='w3-large'>
                                                <i className="fa fa-clock-o" aria-hidden="true"></i> {formatDate(pubDate)}
                                            </span>
                                        </div>
                                    }
                                </div>
                            </SwiperSlide>
                        ))
                    }
                </Swiper>
                {
                    data &&
                    <div className="w3-padding-large svg-container">
                        <LocalPie data={data} />
                    </div>
                }
            </div >
        </>
    )
}