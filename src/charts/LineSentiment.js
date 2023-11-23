
import ReactEcharts from "echarts-for-react"
import moment from "moment";
export default function LineSentiment({ data, fromDate, toDate }) {
    data.sort((a, b) => a.category.localeCompare(b.category))
    const option = {
        title: {
            text: 'InsightFeed',
            subtext: `From ${moment(fromDate).format('MMM Do YYYY, h:mm A')} To ${moment(toDate).format('MMM Do YYYY, h:mm A')}`,
            left: 'left'
        },
        grid: {
            left: '0%',
            right: '0%',
            bottom: '5%',
            containLabel: true
        },
        legend: {
            data: ["Total", "Positive", "Negative"]
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
                id: "total",
                symbol: "image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAeNJREFUaEPtmrtKxEAUhr8tFUWxU+ysFLSwsRMbQbATC8FaBJvF0guICmqplW8g+AKCIl7wERSxEgsvtQq2ugeyEsPEmZCZTQ5kyuVkzv/NfzI5yWwN5aOmXD8VQNEOmhwYAA6AcaCzaIFR/k/gElgGHuOaTABnwGRJhCdlnAJTNoAvoK2kAO9Atw3gu6Tim7L+VI2phCqAwA5WDgReYOv0Xhw4ARaBZ2s6t4AhYBOYdQj3AjAIPDgkyxIic947XOAFoB94cUiWNcRlB/QCcNxwYC6rOof4lgGIlkNgKSGqvdFDXQBjDmIlpK9xL73FYlsKkAbRAZw7QhQO8B/ENTDq6ESWMC/3QDLhftTqxn/visrJN0QQABGeBnEDDGdZYktsMADJuwesJAT0AFceIYICiPYdYM0AcQf0enAiOIBo3AC2EmLXgW0tACJeIOJDDcAusGooodvowZXXhKAlZNqJ1NzEqrdR1Q8yU1Mn/ZCKViJNvIpmTnU7fQTM590PDde37H1A/Sul+pd6+ayyALx6KqORqPWYcZgv6JPYIX/ukAog9xLmnKByIOcC5r7c6oAcqEkvU8bxAcjXjt+h7ZBPtu9pG4Acs0p7PFEiJ5rHrHXgyQZQxtJJ1VT91aBou9Q78APWlmwxaJIUBQAAAABJRU5ErkJggg==",
                symbolSize: 12,
                name: "Total",
                type: 'line',
                data: data.map(({ total }) => total),
                smooth: true,
                itemStyle: {
                    color: "#607d8b"
                },
            },
            {
                id: "positive",
                symbol: "image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAnlJREFUaEPtmT2P1DAQhl+bFkHND0BQISGoDmhBiOxtjAQ9CHooKaCAghJ6EPQgYe+tEYKWj+pOSFQgfgA1K1ps5FWCkqyT2E68i09sufE48/gdz0xsgsR/JHH/8R+gVDDj+XlQnIXCSQBHARwhIAfNcw39C8APAN9B8RkKHyQT78ZQf5ACl8R0iyh6DURfBXDI06EFNHmhqXr+Op998rT9OzwIYOm4JncAZKEvbthJTfTDEBBvgAnPH2ng1kiO16YhwOM5E7d95nYG2J5tn1CKPgNwyucFAWP3KFXXd6Y7X1xsnQCWGxR4GRDnLj7YxiwAXHHZ6L0AxnkC8kZD01BvQuwIiNLQF/sgOgGKsHm/xpVvsi4oVee6wqkTIOP57hpivk+gPcnE6bZBrQAxs02fx83nXdnJClDk+Y++L4o5XhN9xlYnrAAZz+dDitQ851aWiWBDGKVkYmJRp/7XGKsfCQA2FVYUyF6xJyD6xpCligUATZ7Ky/xm1bdVAJ7/HJo2owEAC8nE4VaAouK+HbL6xjYigJn+QrW41RTIZvl9KNz9pwEoHsipuFf6WAcYmH3KSSMrUMtGTYCvAI65KNDmpIutbYxHiv0mmTjepoDzBt4gQG0j1xSYcPbbtevcFIDpUueMH7AqkDxA5lEDNqUAGrVg323iQU3c5tPoPihk5uM93VbChIDPRm4rWhErcXcztwRIvZ1O/oOmCKNB2ShSCLl9UhqAMVQIbera7Lw+6s0kSR+rlKuQ9MGWgUj+aLHY0Oke7lZCKd3j9RIi6QuOamqLmZ2iXjFVIZK+5FsBSfGa1VYtk7zoHrtdCJmv95IvZNJ12iQP8Af0NmpA5qK40wAAAABJRU5ErkJggg==",
                symbolSize: 12,
                name: "Positive",
                type: 'line',
                data: data.map(({ positive }) => positive),
                smooth: true,
                itemStyle: {
                    color: "#009688"
                },
            },
            {
                id: "negative",
                name: "Negative",
                symbol: "image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAupJREFUWEfVl01IFGEYx//PrJbOzG5lBNKliCz6skJ3t9qLNWtgdIs8dKgOFeQhAqHsZBAUQQgdggg6VIcopUMeos1ZDALZSctEvEZJRIZGONv60cwTkx/tul/vuCvSHGee5///zf99591nCct80TL74/8DSGi1m2xI1TajUiJU2IwxSaKvksQD5RHjo9tEhRL4Hgp5y8qnm4lxHMD2rCaMQSJ+Knsm2ygyEBeByQsQ14LnGHwdwFoRwdmabwAuq7rxIF9PVoCxcM2qFVzyGOCGfCLZnjPxc1WaPJErjYwAM+YeA8CWxZon9fUrshWizr5fmbTSALgVUvxN8CXA4SKY/5VgpmfeaOyYEICp+ZsBulUs83kdwim1y3i4UDclgdGGoG/lFA8D8BUdABhWKszN1D40laydAjB+KNBKhKtLYD67FDjvjRp3swKYWmAIwLalAgBDV6NGyt6aTyBRt2+j5bFdn2QuYS1FtnzJX8Q8wHjY30hMT1wKui5nieu8r96+nmv8B6D5mwh0J5Mig3Z49ZizPEKXeTCwGxL6MxYznVSjsUdpAKYWvIKZIzftUnUj75G9sMnUApwZAC1q1LiZBhAP+88y072MCXjsXd5I76DQ6wOIh2v3Mkvvshw8ZxTduJ8OoAWOMtAparLYOmL7iBLtfZEOUB9az/b0l8UKC/axDazz6cZoGoBzw9QCvQBqBMVclzHQ49WNA8mNKZvLDPtbwHTDtbJwA11U9djtrAB8uFqJW2WfXA4fovYjiiVvoO7uiawAzoNxzX+BQCmUog656ghI2f0Z94BzkwGKa8HIss0DDsSPuj2rSz0rnImoqghvP6DI1n7hiWjOcHYm7CgkCQI6ZM/Eadcz4RyEsxymFmwi8DUAa1ykMQLgUkFTcbKZk0YplzQTuBHA1hwgH4jRLic8bdTTkxABdv0j87M+WEUW7ySJKyWbKmxg1PlnRPj9Xu7q+yximvMzdCtQaL3rBAo1XNj/B5EY9iHEgkWZAAAAAElFTkSuQmCC",
                symbolSize: 12,
                type: 'line',
                data: data.map(({ negative }) => negative),
                smooth: true,
                itemStyle: {
                    color: "#f44336"
                },
            }
        ],
        toolbox: {
            feature: {
                saveAsImage: {},
                restore: {},
                magicType: {
                    type: ['line', 'bar', 'stack']
                }
            }
        },
    };

    const onEvents = {
        click: (event) => {
            console.log(event);
        }
    }

    return (
        <ReactEcharts
            option={option}
            style={{ width: 1000, height: 500 }}
            onEvents={onEvents}
        />
    )
}