import "./App.css";

import FearGreedIndex from "./components/FearGreedIndex";
// import CapitulationWidget from "./components/CapitulationWidget";
import MultiColumnLayout from "./layout/MultiColumnLayout";
// import CryptoMAAlerts from "./components/CryptoMAAlerts";
import MarketOverviewWidgets from "./components/MarketOverviewWidgets";

function App() {
  return (
    <MultiColumnLayout columns={2} title="">
      <FearGreedIndex />
      <MarketOverviewWidgets />
      {/* <CapitulationWidget /> */}
      {/* <CryptoMAAlerts /> */}
    </MultiColumnLayout>
  );
}

export default App;
