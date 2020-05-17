import React from "react";

export const Spinner:React.FunctionComponent = () => {
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