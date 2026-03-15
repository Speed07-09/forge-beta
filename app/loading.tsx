export default function Loading() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="flex items-center gap-2" aria-label="Loading" role="status">
                <span className="loading-dot" />
                <span className="loading-dot" />
                <span className="loading-dot" />
            </div>
        </div>
    )
}
