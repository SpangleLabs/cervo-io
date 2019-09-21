import * as React from "react";

export class BoxUnchecked extends React.Component<{}, {}> {
    render() {
        return <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" width="20px" height="20px" viewBox="0 0 100 100" xmlSpace="preserve">
            <path d="M23.031,24.649c0-1.313,1.154-2.471,2.468-2.471h49.363c1.316,0,2.471,1.158,2.471,2.471v49.364  c0,1.316-1.154,2.461-2.471,2.461H25.499c-1.313,0-2.468-1.145-2.468-2.461V24.649z M74.862,10.656H25.499  c-7.711,0-13.984,6.283-13.984,13.993v49.364C11.515,81.727,17.788,88,25.499,88h49.363c7.714,0,13.987-6.273,13.987-13.987V24.649  C88.85,16.939,82.576,10.656,74.862,10.656"/>
        </svg>
    }
}

export class BoxChecked extends React.Component<{}, {}> {
    render() {
        return <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" width="20px" height="20px" viewBox="0 0 100 100" xmlSpace="preserve">
            <path d="M23.031,24.649c0-1.313,1.154-2.471,2.468-2.471h49.363c1.316,0,2.471,1.158,2.471,2.471v49.364  c0,1.316-1.154,2.461-2.471,2.461H25.499c-1.313,0-2.468-1.145-2.468-2.461V24.649z M74.862,10.656H25.499  c-7.711,0-13.984,6.283-13.984,13.993v49.364C11.515,81.727,17.788,88,25.499,88h49.363c7.714,0,13.987-6.273,13.987-13.987V24.649  C88.85,16.939,82.576,10.656,74.862,10.656"/>
            <path d="M45.433,69.446c-1.678,0-3.264-0.872-4.361-2.385L29.409,49.788c-0.396-0.542-1.671-2.312-0.895-3.851  c0.399-0.777,1.189-1.215,2.163-1.215c0.679,0,1.466,0.197,2.407,0.622l11.716,5.68l23.465-17.089  c1.271-0.891,2.077-1.247,2.794-1.247h1.024l0.653,1.015c0.536,1.088-0.069,2.239-1.151,3.644L49.73,67.162  C48.604,68.627,47.047,69.446,45.433,69.446"/>
        </svg>
    }
}

export class Spinner extends React.Component<{}, {}> {
    render() {
        return <svg className="lds-spin" width="20px" height="20px" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" style={{animationPlayState: 'running', animationDelay: '0s', background: 'rgba(0, 0, 0, 0) none repeat scroll 0% 0%'}}>
            <g transform="translate(70,50)" style={{animationPlayState: 'running', animationDelay: '0s'}}>
                <g transform="rotate(0)" style={{animationPlayState: 'running', animationDelay: '0s'}}>
                    <circle cx={0} cy={0} r={18} fill="#337ab7" fillOpacity={1} style={{animationPlayState: 'running', animationDelay: '0s'}}>
                        <animateTransform attributeName="transform" type="scale" begin="-0.5599999999999999s" values="1.1 1.1;1 1" keyTimes="0;1" dur="0.7s" repeatCount="indefinite" style={{animationPlayState: 'running', animationDelay: '0s'}} />
                        <animate attributeName="fill-opacity" keyTimes="0;1" dur="0.7s" repeatCount="indefinite" values="1;0" begin="-0.5599999999999999s" style={{animationPlayState: 'running', animationDelay: '0s'}} />
                    </circle>
                </g>
            </g>
            <g transform="translate(56.180339887498945,69.02113032590307)" style={{animationPlayState: 'running', animationDelay: '0s'}}>
                <g transform="rotate(72)" style={{animationPlayState: 'running', animationDelay: '0s'}}>
                    <circle cx={0} cy={0} r={18} fill="#337ab7" fillOpacity="0.8" style={{animationPlayState: 'running', animationDelay: '0s'}}>
                        <animateTransform attributeName="transform" type="scale" begin="-0.41999999999999993s" values="1.1 1.1;1 1" keyTimes="0;1" dur="0.7s" repeatCount="indefinite" style={{animationPlayState: 'running', animationDelay: '0s'}} />
                        <animate attributeName="fill-opacity" keyTimes="0;1" dur="0.7s" repeatCount="indefinite" values="1;0" begin="-0.41999999999999993s" style={{animationPlayState: 'running', animationDelay: '0s'}} />
                    </circle>
                </g>
            </g>
            <g transform="translate(33.819660112501055,61.75570504584947)" style={{animationPlayState: 'running', animationDelay: '0s'}}>
                <g transform="rotate(144)" style={{animationPlayState: 'running', animationDelay: '0s'}}>
                    <circle cx={0} cy={0} r={18} fill="#337ab7" fillOpacity="0.6" style={{animationPlayState: 'running', animationDelay: '0s'}}>
                        <animateTransform attributeName="transform" type="scale" begin="-0.27999999999999997s" values="1.1 1.1;1 1" keyTimes="0;1" dur="0.7s" repeatCount="indefinite" style={{animationPlayState: 'running', animationDelay: '0s'}} />
                        <animate attributeName="fill-opacity" keyTimes="0;1" dur="0.7s" repeatCount="indefinite" values="1;0" begin="-0.27999999999999997s" style={{animationPlayState: 'running', animationDelay: '0s'}} />
                    </circle>
                </g>
            </g>
            <g transform="translate(33.819660112501055,38.24429495415054)" style={{animationPlayState: 'running', animationDelay: '0s'}}>
                <g transform="rotate(216)" style={{animationPlayState: 'running', animationDelay: '0s'}}>
                    <circle cx={0} cy={0} r={18} fill="#337ab7" fillOpacity="0.4" style={{animationPlayState: 'running', animationDelay: '0s'}}>
                        <animateTransform attributeName="transform" type="scale" begin="-0.13999999999999999s" values="1.1 1.1;1 1" keyTimes="0;1" dur="0.7s" repeatCount="indefinite" style={{animationPlayState: 'running', animationDelay: '0s'}} />
                        <animate attributeName="fill-opacity" keyTimes="0;1" dur="0.7s" repeatCount="indefinite" values="1;0" begin="-0.13999999999999999s" style={{animationPlayState: 'running', animationDelay: '0s'}} />
                    </circle>
                </g>
            </g>
            <g transform="translate(56.180339887498945,30.978869674096927)" style={{animationPlayState: 'running', animationDelay: '0s'}}>
                <g transform="rotate(288)" style={{animationPlayState: 'running', animationDelay: '0s'}}>
                    <circle cx={0} cy={0} r={18} fill="#337ab7" fillOpacity="0.2" style={{animationPlayState: 'running', animationDelay: '0s'}}>
                        <animateTransform attributeName="transform" type="scale" begin="0s" values="1.1 1.1;1 1" keyTimes="0;1" dur="0.7s" repeatCount="indefinite" style={{animationPlayState: 'running', animationDelay: '0s'}} />
                        <animate attributeName="fill-opacity" keyTimes="0;1" dur="0.7s" repeatCount="indefinite" values="1;0" begin="0s" style={{animationPlayState: 'running', animationDelay: '0s'}} />
                    </circle>
                </g>
            </g>
        </svg>
    }
}