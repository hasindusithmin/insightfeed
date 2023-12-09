import { OneNews } from "./OneNews";
import moment from "moment";

function groupByNumber(array, groupSize) {
    return array.reduce((result, current, index) => {
        const groupIndex = Math.floor(index / groupSize);

        if (!result[groupIndex]) {
            result[groupIndex] = [];
        }

        result[groupIndex].push(current);

        return result;
    }, []);
}

export default function ALLNews({ data: arr, fromDate, toDate }) {
    const raw = groupByNumber(arr, 2);
    return (
        <div className="">
            <div className="w3-padding w3-xlarge w3-opacity">
                <b>News Updates</b>
                <br/>
                <span className="w3-medium">
                 From {moment(fromDate).format('MMM Do YYYY, h:mm A')} To {moment(toDate).format('MMM Do YYYY, h:mm A')} 
                </span>
            </div>
            {
                raw.map((twoD, Index) => (
                    <div key={Index} className="w3-row">
                        {
                            twoD.map(({ _id: category, count, data: news }) => (
                                <div key={category} className="w3-padding w3-half">
                                    <div className="w3-card">
                                        <div className="scrollable-container">
                                            {
                                                news.map(object => <OneNews key={object.id} object={object} />)
                                            }
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                ))
            }
        </div>
    )
}

