import "./App.css";
import { Routes, Route } from "react-router-dom"; // 追加
import RoomLists from "./components/roomLists/roomLists";
import CallArea from "./components/callArea/callArea";
import Room from "./components/room/room";


function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={ <RoomLists /> } /> 
        <Route path="/room" element={ <Room /> } /> 
      </Routes>   
       </div>
  );
}

export default App;
