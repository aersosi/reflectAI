import SelectAgent from "./SelectAgent.tsx";
import SelectModel from "./SelectModel.tsx";
import InputApiKey from "./InputApiKey.tsx";

function SidebarMain() {
    return (
        <div className="flex flex-col w-1/2 gap-4 p-4">
            <div className="flex gap-4 justify-between">
                <div className="flex gap-4">
                    <SelectAgent></SelectAgent>
                    <SelectModel></SelectModel>
                    <InputApiKey></InputApiKey>
                </div>
                <div>Open/Close SidebarMain</div>
            </div>
            <div className="flex grow flex-col gap-4">
                <div>Variables</div>
                <div className="grow">System prompt</div>
                <div className="grow">User prompt</div>
            </div>
        </div>
    );
}

export default SidebarMain;