import "./App.css";

import FearGreedIndex from "./components/FearGreedIndex";
// import CapitulationWidget from "./components/CapitulationWidget";
import MultiColumnLayout from "./layout/MultiColumnLayout";
// import CryptoMAAlerts from "./components/CryptoMAAlerts";
import MarketOverviewWidgets from "./components/MarketOverviewWidgets";

function App() {
  return (
    <MultiColumnLayout columns={2} title="">
      <MarketOverviewWidgets />
      {/* <CapitulationWidget /> */}
      <FearGreedIndex />
      {/* <CryptoMAAlerts /> */}
    </MultiColumnLayout>
  );
}

export default App;
