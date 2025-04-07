function Session() {
    return (
        <div className="flex flex-col grow gap-4 p-4">
            <div className="flex gap-4 justify-between">
                <div>Session Name</div>
                <div>Open/Close Sessions</div>
            </div>
            <div className="flex flex-col gap-4">
                <div className="w-3/4">Claud Answer Card</div>
                <div className="w-3/4 ml-auto">Human Answer card</div>
            </div>
            <div className="flex gap-4">
                <div className="grow">Textarea Input</div>
                <div className="flex flex-col gap-4">
                    <div>Open/Close Textarea</div>
                    <div>Send Input</div>
                </div>
            </div>
        </div>
    );
}

export default Session;