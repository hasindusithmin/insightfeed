import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Local from "./pages/Local";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />} />
        <Route path="/local" element={<Local />} />
        {/* <Route path="/demo" element={<Demo />} /> */}
      </Routes>
    </BrowserRouter>
  );
}