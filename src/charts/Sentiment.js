
import ReactEcharts from "echarts-for-react"
import moment from "moment";
export default function Sentiment({ data, fromDate, toDate }) {
    const option = {
        title: {
            text: 'Sentiments',
            subtext: `From ${moment(fromDate).format('MMM Do YYYY, h:mm A')} To ${moment(toDate).format('MMM Do YYYY, h:mm A')}`,
            left: 'left'
        },
        grid: {
            left: '0%',
            right: '0%',
            bottom: '5%',
            containLabel: true
        },
        xAxis: {
            type: "category",
            data: data.map(({ category }) => category),
            // axisLabel: {
            //     inside: true,
            //     color: '#fff'
            // },
            // axisTick: {
            //     show: false
            // },
            // axisLine: {
            //     show: false
            // },
            // z: 10
        },
        yAxis: {
            type: 'value',
            // axisLine: {
            //     show: false
            // },
            axisTick: {
                show: false
            },
            // axisLabel: {
            //     color: '#999'
            // }
        },
        tooltip: {
            // trigger: 'item',
            // formatter: function ({ name, value }) {
            //     return `${name} ${value} results`
            // },
        },
        series: [
            {
                type: 'line',
                data: data.map(({ positive }) => positive),
                smooth: true,
                colorBy: "green",
                endLabel: {
                    show: true,
                    formatter: function (params) {
                        return "positive"
                    }
                },
                itemStyle: {
                    color: "#009688"
                },
            },
            {
                type: 'line',
                data: data.map(({ negative }) => negative),
                smooth: true,
                colorBy: "red",
                endLabel: {
                    show: true,
                    formatter: function (params) {
                        return "negative"
                    }
                },
                itemStyle: {
                    color: "#f44336"
                },
            },
            {
                type: 'line',
                data: data.map(({ total }) => total),
                smooth: true,
                endLabel: {
                    show: true,
                    formatter: function (params) {
                        return "total"
                    }
                },
                itemStyle: {
                    color: "#607d8b"
                },
            }
        ],
        toolbox: {
            feature: {
                saveAsImage: {},
            }
        },
    };

    return (
        <ReactEcharts
            option={option}
            style={{ width: 1000, height: 500 }}
        />
    )
}