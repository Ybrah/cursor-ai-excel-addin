import { MyRuntimeProvider } from "@/context/runtimeProvider";
import { Thread } from "@/components/assistant-ui/thread";
import "./App.css";

function App() {
  return (
    <MyRuntimeProvider>
      {/* Excel Tool UIs removed - tools now render as normal text/markdown */}
      
      <div className="w-full h-full bg-white text-gray-900">
        <div className="container mx-auto p-4 h-full">
          <div className="bg-white rounded-lg shadow-sm border h-full">
            <Thread />
          </div>
        </div>
      </div>  
    </MyRuntimeProvider>
  );
}

export default App;