import "./App.css";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";

import FearGreedIndex from "./components/FearGreedIndex";
import CapitulationWidget from "./components/CapitulationWidget";
import MultiColumnLayout from "./layout/MultiColumnLayout";
import CryptoMAAlerts from "./components/CryptoMAAlerts";
import MarketOverviewWidgets from "./components/MarketOverviewWidgets";
import PercentageVariationDay from "./components/PercentageVariationDay";
function App() {
  return (
    <div className="App">
      <Tabs>
        <TabList>
          <Tab>Daily</Tab>
          <Tab>Alerts</Tab>
          <Tab>Widgets</Tab>
        </TabList>

        <TabPanel>
          <div>
            <MultiColumnLayout columns={2} title="">
              <PercentageVariationDay coinName="BTCEUR" />
              <PercentageVariationDay coinName="ETHEUR" />
              <PercentageVariationDay coinName="SOLEUR" />
              <FearGreedIndex />
            </MultiColumnLayout>
          </div>
        </TabPanel>

        <TabPanel>
          <div>
            <MultiColumnLayout columns={1} title="">
              <CryptoMAAlerts />
            </MultiColumnLayout>
          </div>
        </TabPanel>

        <TabPanel>
          <div>
            <MultiColumnLayout columns={2} title="">
              <FearGreedIndex />
              <MarketOverviewWidgets />
              <CapitulationWidget />
            </MultiColumnLayout>
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
}

export default App;
