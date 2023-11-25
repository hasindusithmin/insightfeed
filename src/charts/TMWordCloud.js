import moment from "moment";
import 'echarts-wordcloud';
import ReactEcharts from "echarts-for-react"

export default function TMWordCloud({ data, fromDate, toDate }) {

    const option = {
        title: {
            text: "Topic Modeling",
            subtext: `From ${moment(fromDate).format('MMM Do YYYY, h:mm A')} To ${moment(toDate).format('MMM Do YYYY, h:mm A')}`,
            left: 'left',
            textStyle: {
                fontSize: 20,
                // color: color
            }
        },
        tooltip: {
            formatter: function ({ name }) {
                return name;
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
                // height: "100%",
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
                data: data.map(topic => ({ name: topic, value: 0, textStyle: { color: "#616161" } }))
            }
        ],
    };

    const n = data.length >= 250 ? 2 : 5;

    const onEvents = {
        click: ({ name }) => {

        }
    }

    return (
        <ReactEcharts
            option={option}
            style={{ width: "100%", height: data.length * n, backgroundColor: "#f1f1f1" }}
            onEvents={onEvents}
        />
    )
}
