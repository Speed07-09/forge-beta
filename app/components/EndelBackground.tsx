'use client'

export default function EndelBackground() {
    return (
        <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-black">
            {/* Extremely subtle radial gradient to prevent pure pitch-black flatness */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(20,20,20,1)_0%,rgba(0,0,0,1)_100%)]" />

            {/* Faint elegant line art graphic representing sound waves / frequencies mimicking Endel */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.15] mix-blend-screen mix-blend-plus-lighter pointer-events-none">
                <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 1000 1000"
                    preserveAspectRatio="xMidYMid slice"
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-[1000px] min-h-[1000px] w-full max-w-[1200px]"
                >
                    {/* Glowing center area */}
                    <circle cx="500" cy="500" r="300" fill="url(#center-glow)" opacity="0.4" />
                    
                    {/* Concentric / orbital thin lines */}
                    <circle cx="500" cy="500" r="300" fill="none" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.6" strokeDasharray="4 6" />
                    <circle cx="500" cy="500" r="450" fill="none" stroke="#FFFFFF" strokeWidth="0.25" opacity="0.3" strokeDasharray="1 10" />

                    {/* Sine wave 1 */}
                    <path
                        d="M -100,500 Q 100,300 300,500 T 700,500 T 1100,500"
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="1.5"
                        opacity="0.8"
                    />
                    {/* Sine wave 2 */}
                    <path
                        d="M -100,500 Q 150,650 350,500 T 750,500 T 1100,500"
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="1.2"
                        opacity="0.5"
                    />
                    {/* Sharp frequency spikes */}
                    <g transform="translate(400, 470)" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.9">
                        <line x1="10" y1="20" x2="10" y2="40" opacity="0.4" />
                        <line x1="30" y1="10" x2="30" y2="50" opacity="0.7" />
                        <line x1="50" y1="5" x2="50" y2="55" opacity="1" />
                        <line x1="70" y1="15" x2="70" y2="45" opacity="0.8" />
                        <line x1="90" y1="25" x2="90" y2="35" opacity="0.5" />
                        <line x1="110" y1="10" x2="110" y2="50" opacity="0.6" />
                        <line x1="130" y1="20" x2="130" y2="40" opacity="0.4" />
                        <line x1="150" y1="15" x2="150" y2="45" opacity="0.3" />
                        <line x1="170" y1="5" x2="170" y2="55" opacity="0.8" />
                        <line x1="190" y1="20" x2="190" y2="40" opacity="0.4" />
                    </g>
                    
                    <defs>
                        <radialGradient id="center-glow" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.1" />
                            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                        </radialGradient>
                    </defs>
                </svg>
            </div>
        </div>
    )
}
