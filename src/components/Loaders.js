import { Vortex } from "react-loader-spinner"

export default function Loader({ show }) {
    return (
        <div className="svg-container w3-padding-large">
            <Vortex
                visible={show}
                height="150"
                width="150"
                ariaLabel="vortex-loading"
                wrapperStyle={{ justifyContent: "center", alignItems: "center" }
                }
                colors={['#4facfe', '#00f2fe', '#43e97b', '#38f9d7', '#fa709a', '#fee140']}
            />
        </div>
    )
}