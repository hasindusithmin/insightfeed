import { ColorRing } from "react-loader-spinner"

export default function Loader() {
    return (
        <div className="svg-container w3-padding-large">
            <ColorRing
                visible={true}
                height="80"
                width="80"
                ariaLabel="blocks-loading"
                wrapperStyle={{}}
                wrapperClass="blocks-wrapper"
                colors={['#4facfe', '#00f2fe', '#43e97b', '#38f9d7', '#fa709a', '#fee140']}
            />
        </div>
    )
}