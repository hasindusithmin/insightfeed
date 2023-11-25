import moment from "moment";
import 'echarts-wordcloud';
import ReactEcharts from "echarts-for-react"
import nlp from "compromise/three";

export default function NERWordCloud({ data, fromDate, toDate }) {

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

    const option = {
        title: {
            text: "Named Entity Recognition",
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
                restore: {},
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
                data: data.map(entity => ({ name: entity, value: 0, textStyle: { color: "#607d8b" } }))
            }
        ],
    };

    const onEvents = {
        click: ({ name }) => {
            console.log(data.length);
        }
    }

    const n = data.length >= 250 ? 2 : 5;

    return (
        <ReactEcharts
            option={option}
            style={{ width: "100%", height: data.length * n, backgroundColor: "#f1f1f1" }}
            onEvents={onEvents}
        />
    )
}
