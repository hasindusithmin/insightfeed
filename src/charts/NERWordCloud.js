import moment from "moment";
import 'echarts-wordcloud';
import ReactEcharts from "echarts-for-react"
import nlp from "compromise/three";
import { useEffect, useState } from "react";

export default function NERWordCloud({ data, fromDate, toDate }) {

    const [options, setOptions] = useState(null);

    function getOptions(array, type) {
        return {
            title: {
                text: `Related Entities ${type}`,
                subtext: `From ${moment(fromDate).format('MMM Do YYYY, h:mm A')} To ${moment(toDate).format('MMM Do YYYY, h:mm A')}`,
                left: 'left',
                textStyle: {
                    fontSize: 20,
                    // color: color
                }
            },
            tooltip: {
                formatter: function ({ name }) {
                    return `${name} <sup style="font-weight:bold;">${getEntity(name)}</sup>`
                }
            },
            toolbox: {
                feature: {
                    myTool1: {
                        show: true,
                        title: 'Sentiment all',
                        icon: "image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAc5JREFUSEu11T/oT1EYx/HXL+W/BYUiNqEQkmRhoTCwKPmbbBSzsjBbMNhIFkWUgUEGSSiDiEHIjAELk/vo3G+n4/e733Pz+57pdu89z/s8n8/zPGfMiNfYiOPrA5iFSzja51C1gBW4i6WYNtmAY+nk01Pg73iHx7iJ513AmgwO4QpaQBkvQCfwajxQDSD2rcItLEN4sT15sQdT8Bv7cKeE1AJi3+wk1ZEsyCJcRoB+Yg0+5JA+gC6pb2A/HmHbKAAz8BELEiBAf1efDC6ilecqThYpncaFJFmY3gsQwQeb0t5ouhyyAS8as9825buyL+BHMjk/dJg6J3sxrznEl2T24H0p0VfMRfz8Lds8HqCUOKos/osY8yfK4Bk2YhPiuV01EkWvvG565Ck2TwS4jgNN85zD2cLE1uS2H0qTz+B804xRAIOBWEq0E/eSlovxq6v4s29Rpp+TNDvwoMvkmC1bcC0ry2GcOPXh2kZbkibkQtzG8cLwHBbVEsH3JoPXNRK/r+nk1XiYUo7SiwaKGn+Jqc1QW4utacDFHfEJu/CmTLWrk5cjZsz6Ifo8wcE0Kv75tWZU7MapdJvF9JyZTnp/si6cYQZ3fq/J4L8AfwDD8VAZATg4aQAAAABJRU5ErkJggg==",
                        onclick: function () {
                            setOptions(
                                getOptions([...new Set(data.map(({ named_entities }) => named_entities).flat())], "")
                            )
                        }
                    },
                    myTool2: {
                        show: true,
                        title: 'Sentiment positive',
                        icon: "image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAA+RJREFUaEPtmU2IXEUQx/89o2viIQsSMDGiYVliiAgzU29WRvSiRCSQYA6CXoScVJDcBONFEAJCcokSyV0QdA+KCqJo8LayO/95yUICHkSMXygYE3LQzGS6nJaZsDv7Zvp99GR3IX3t6qr6dXW/qq5nsMmH2eT+4zbAekcwWATq9XrdWvsqgCcAPACgPATXBXDJGPMtgHebzWYcAr4QQKVSeaxcLr8HYB+AOzM61AZwoVQqvbS0tLSUce1N8VwAIrLdGPOpqjbyGh5ad5bkU3l0ZQaIoui4tfZ1Y0wpj8Exa24AOEbyZBa9qQHcrgNg/3xnsZFV9iLJh9MuSgUwNze3p9vtngOwNa3ignJXOp3OQ8vLy3/69HgBGo3GPe12+2cAd/uUBZ7/i+QOAO5ojRxeABH5FcB9gZ1Lq26R5KO5AUTkYwDPprU2Ibm3SL45SvfICPQT02IRp1T1kDFmSy9PfFRAT5fkHZkBRORHALsLGAbJ/zdIRLSIHmPM181mc3+SjsQIVCqV/eVy+asiRt3aUAAAdGpqavvCwsLlYZ8SAWq12gVjjCsPCo2AAFDVD1ut1vNegNnZ2W3T09NXC3neXxwSAMA/JNd8ytdEwJUKqvrGBgRAr/6qDVexawBEpAWguhEBAJwh+cpK35IA3PHZtkEBSDLyAbiHR5BKM/AdcH7/0S8vbjIkRaDQN3vl7kwA4DpJlxiLAbgM22q1PgtxzAY6ROS5FBlbSa46HXkjcJjkJyEBoih6QVU/8OkcRHUglwRggTDtlgkcIUtyVbMgCeBfAHf5diLN/AQA1iSzJIDfAOxM46BPZgIAl0g+6LvE3wB40udcmvkJAHzeSwQHfQBHAZxK46BPJjSAtfbFOI7f9wG4gulaiGQWGOAGSXc33UdmdB5wM1EULapq3bfDvvmQAKMeNYnvgSiKqr1k5Yq6QiMkgLV2dxzHPw07NPJNLCLfA9hThCAgwHckE9uY4x71FWtt0Q7yYWPM1jQZdsxGuTN/P8nfk2TG9oVExHUTXI2ynuNtksdGOeBtbNVqtV+MMbvWiSAmWRtn2wvQby267tyqMvYWAF2emZnZOT8/7/4jjBxeALeyWq3uK5VKrjN9qyD+7nQ6e4M0dwfoIuLqI3ep753w7p/vleqVtDZSRWClMhE5DeDlEJl6yEl3VF4j+U5a551cZgC3qNFo7Gq3218AeCSLsTGyX5J8Jo+uXAADQ72S44CqnlDVvVl/OanqdWPMeWvtkTiOL+ZxPncEkoyJyNOqeqRXszze/58w3NnoAPgBwFlr7ekiTq+0XygCeXct5LrbACF3M4+uTR+B/wArNn9AjkqDFAAAAABJRU5ErkJggg==",
                        onclick: function () {
                            setOptions(
                                getOptions([...new Set(data.filter(({ sentiment }) => sentiment === "positive").map(({ named_entities }) => named_entities).flat())], "🙂")
                            )
                        }
                    },
                    myTool3: {
                        show: true,
                        title: 'Sentiment negative',
                        icon: "image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAA+1JREFUaEPtmV1oHGUUht8z26RpQaNghf6A0kQRS2NmvkmWECGiN0Fafy8UileFIrRIlSoK7Y1WUVqJULAUxCu9kCh6oSKk2hYNMWTOTLq0RUpEW2ovtGiDaM3uzhzzQRLIZnfnZ2e7U+h3u+e8533mzH5/Q7jBB93g/nEToNUdTK0D+Xx+U7lcHiaiIRF5CMCmCrhLRHQSwAnf97/xPO9yGvANAZimeZdhGC8BeBRAd0xD54no61wu9+7k5OSlmLlL4YkAlFJrAewH8FrSwhV5B5j5YBKt2AC2bT8uIkcBrE9SsE7OhSAIdnqe920c3cgA+qkT0Yci8kycAnFjReSY67rPR82LBKCUugPAGIDeqMINxp0slUrbCoXCP2E6oQADAwNrisXiDwCsMLGUfx9j5mEAQT3dUADbtj8TkadSNhdJjogOOY7zSmIAy7L2EtFIpGpNChKR7a7rfllLvmYHlFJ6lvkFwOomeYsqe3l2dnbzzMzMXLWEegAfAdgRtUoz44hov+M4b0YG6O3tvSeXy/0EwGimsRjaf7W3t2+cmJi4VplTtQNKKb1QRZ6LYxhpJHQ3M78fCtDd3b26s7PzTwB6u5Cl4THziql8RQcWtgpfZMn5opcgCDZW7mKrAYyIyN4sAojIc67r6sllaawAUEp9D+DBjAKMuK6rt+91Af4AoPc+WRxfMfO2MADJovMFT+eYeUvDAEEQbPE871yaoKZpPmAYxnSI5iwz39YwABFtdRznTJoAtm2bIuKGaP7HzGvCAPQacHua5lLUusLM68IAzgK4P8WiaUqdZuZlh6pq0+jnAJ5Is2paWkT0ieM4z4Z14MD8Ju71tIqmrPMyMx+uC9DX1zcUBIG+gMrcCIKgz/M8J6wDbQB+A7Dsz5IBmovMfDeAZetUre30IQD7MmB6yUKtQ01VANM0NxiGcQHAqoxAXPN9f8P09PTVSj/1jpQfANiZEYB3mPnVal5qApimuc4wjF8zcLC50tHRsXl8fPzvWAA62LbtPSJypMVdeHJ+8ap5wAq92LIs61MieroVEET0nuM4L9arHQqwcLX4I4Ce6wkhIse7urqGR0dH/YYAdHJPT8+dbW1txwFsvU4QJ0ql0vZULncXDQ8ODt4yNzf3sb7qazLEEWZ+IWqN0FeoUsiyrB363WzCsfO8YRi7pqamTkU1r+NiA+ikfD5/q+/7b4nI7jjFasT+C+ANZn47iVYigMVCSqn79BUMET2W4JPTWf2Rr1gsHi4UCr8nMZ+4A9WK9ff33+v7/iMAHp7/lDpUZTP4M4DvRORUuVwea8R03d1o0ifRqryGXqFWmb7ZgSw8+UUP/wM7LlFAZjJUkwAAAABJRU5ErkJggg==",
                        onclick: function () {
                            setOptions(
                                getOptions([...new Set(data.filter(({ sentiment }) => sentiment === "negative").map(({ named_entities }) => named_entities).flat())], "🙁")
                            )
                        }
                    },
                    saveAsImage: {},
                }
            },
            series: [
                {
                    type: 'wordCloud',
                    shape: 'circle',
                    width: "95%",
                    // height: "90%",
                    sizeRange: [15, 30],
                    rotationRange: [0, 0],
                    // rotationStep: 90,
                    gridSize: 10,
                    drawOutOfBound: false,
                    shrinkToFit: true,
                    layoutAnimation: true,
                    textStyle: {
                        fontFamily: 'sans-serif',
                        fontWeight: '600',
                        // color: color
                    },
                    data: array.map(entity => ({ name: entity, value: 0, textStyle: { color: "#607d8b" } }))
                }
            ],
        }
    }

    useEffect(() => {
        setOptions(
            getOptions([...new Set(data.map(({ named_entities }) => named_entities).flat())], "")
        )
    }, [])

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

    const onEvents = {
        click: ({ name }) => {
            console.log(data.length);
        }
    }

    const n = data.length >= 250 ? 2 : 5;

    return (
        <>
            {
                options &&
                <ReactEcharts
                    option={options}
                    style={{ width: "100%", height: data.length * n, backgroundColor: "#f1f1f1" }}
                    onEvents={onEvents}
                />
            }
        </>
    )
}
