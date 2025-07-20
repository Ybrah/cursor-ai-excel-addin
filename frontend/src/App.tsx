import { MyRuntimeProvider } from "@/context/runtimeProvider";
import { Thread } from "@/components/assistant-ui/thread";
import "./App.css";

function App() {
  return (
    <MyRuntimeProvider>
      <div className="excel-taskpane-container">
        <Thread />
      </div>  
    </MyRuntimeProvider>
  );
}

export default App;