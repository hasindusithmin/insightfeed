
export function Card({ result }) {
    const { link, views, upvotes, comments, shares, profileName, profilImage, profileUrl, text } = result;
    return (
        <div className="w3-padding w3-card w3-round-large">
            <div>
                <i title="upvotes" className="fa fa-thumbs-up" aria-hidden="true"></i>&nbsp;{upvotes}&nbsp;&nbsp;
                <i title="comments" className="fa fa-comment" aria-hidden="true"></i>&nbsp;{comments}&nbsp;&nbsp;
                <i title="shares" className="fa fa-share-alt" aria-hidden="true"></i>&nbsp;{shares}&nbsp;&nbsp;
                <i title="views" className="fa fa-eye" aria-hidden="true"></i>&nbsp;{views}&nbsp;&nbsp;
                <i title="link" className="fa fa-quora" aria-hidden="true"></i>&nbsp;<a href={link} target="_blank" rel="noreferrer" style={{ cursor: "pointer" }}>link</a>
            </div>
            <hr />
            <div style={{ textAlign: "left" }}>
                <span style={{ fontWeight: "bold" }} className="w3-large">{profileName}</span>
            </div>
            <div className="scrollable-container" style={{ maxHeight: 250 }}>
                <a href={profileUrl} target="_blank" rel="noreferrer" className="" title="visit profile">
                    <img src={profilImage} width={150} height="auto" alt="Avatar" className="w3-left w3-circle w3-padding" />
                </a>
                <p className="w3-justify">{text}</p>
            </div>
        </div>
    )
}

export default function Quora({ results }) {
    return (
        <>
            {
                results.map(result => <div key={result.id} className="w3-margin"><Card result={result} /></div>)
            }
        </>
    )
}