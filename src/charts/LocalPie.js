
import ReactEcharts from "echarts-for-react"

export default function LocalPie({ data }) {
    const option = {
        title: {
            subtext: 'Trending Topic',
            left: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        series: [
            {
                name: 'Topic',
                type: 'pie',
                radius: '55%',
                center: ['40%', '50%'],
                data: data.map(item => ({ name: item[0], value: item[1] })),
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    }

    // const onEvents = {
    //     click: ({ name: category, seriesId: sentiment }) => {
    //         const { data } = news.find(({ _id }) => _id === category);
    //         const filteredData = sentiment === "total" ? data : data.filter(object => object.sentiment === sentiment);
    //         setRelatedNews(filteredData);
    //     }
    // }

    return (
        <ReactEcharts
            option={option}
            style={{ width: 1000, height: 500 }}
        // onEvents={onEvents}
        />
    )
}