import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './store';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { LogActivity } from './pages/LogActivity';
import { Mirror } from './pages/Mirror';
import { SkillTree } from './pages/SkillTree';
import { EvidenceVault } from './pages/EvidenceVault';
import { InterviewTraining } from './pages/InterviewTraining';
import { CommunicationGym } from './pages/CommunicationGym';
import { ProductGym } from './pages/ProductGym';
import { BoringMode } from './pages/BoringMode';
import { ThisWeekend } from './pages/ThisWeekend';
import { CareerFunnel } from './pages/CareerFunnel';
import { Network } from './pages/Network';
import { FocusSystem } from './pages/FocusSystem';
import { Decisions } from './pages/Decisions';
import { IdeaParkingLot } from './pages/IdeaParkingLot';
import { FailureLog } from './pages/FailureLog';
import { FutureMe } from './pages/FutureMe';
import { WeeklyReview } from './pages/WeeklyReview';
import { MonthlyReview } from './pages/MonthlyReview';
import { AICoach } from './pages/AICoach';
import { Settings } from './pages/Settings';

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <div className="app-shell">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/log" element={<LogActivity />} />
              <Route path="/mirror" element={<Mirror />} />
              <Route path="/skills" element={<SkillTree />} />
              <Route path="/evidence" element={<EvidenceVault />} />
              <Route path="/interview" element={<InterviewTraining />} />
              <Route path="/communication" element={<CommunicationGym />} />
              <Route path="/product-gym" element={<ProductGym />} />
              <Route path="/boring-mode" element={<BoringMode />} />
              <Route path="/thisweekend" element={<ThisWeekend />} />
              <Route path="/career" element={<CareerFunnel />} />
              <Route path="/network" element={<Network />} />
              <Route path="/focus" element={<FocusSystem />} />
              <Route path="/decisions" element={<Decisions />} />
              <Route path="/ideas" element={<IdeaParkingLot />} />
              <Route path="/failures" element={<FailureLog />} />
              <Route path="/future-me" element={<FutureMe />} />
              <Route path="/review" element={<WeeklyReview />} />
              <Route path="/review/monthly" element={<MonthlyReview />} />
              <Route path="/coach" element={<AICoach />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </StoreProvider>
  );
}
