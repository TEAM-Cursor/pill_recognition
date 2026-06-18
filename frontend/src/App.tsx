import { useState } from 'react'
import TabBar, { type Tab } from './components/TabBar'
import CabinetPage from './pages/cabinet/CabinetPage'
import HomePage from './pages/home/HomePage'
import MorePage from './pages/more/MorePage'
import ResultPage from './pages/result/ResultPage'
import ProfilePage from './pages/profile/ProfilePage'
import { hasHealth } from './lib/storage'

/* 프로토타입: 라우터 없이 화면 상태로 전환. */
type Screen = Tab | 'result' | 'profile'

export default function App() {
  // 건강정보가 없으면 온보딩(내 정보 입력)부터, 있으면 홈부터.
  const [screen, setScreen] = useState<Screen>(() => (hasHealth() ? 'home' : 'profile'))
  const [profileFrom, setProfileFrom] = useState<'onboard' | 'more'>('onboard')
  const isTabScreen = screen === 'cabinet' || screen === 'home' || screen === 'more'

  return (
    <div className="app">
      {screen === 'cabinet' && <CabinetPage onOpen={() => setScreen('result')} />}
      {screen === 'home' && <HomePage />}
      {screen === 'more' && (
        <MorePage onProfile={() => { setProfileFrom('more'); setScreen('profile') }} />
      )}
      {screen === 'result' && <ResultPage onBack={() => setScreen('cabinet')} />}
      {screen === 'profile' && (
        <ProfilePage
          onDone={() => setScreen(profileFrom === 'more' ? 'more' : 'home')}
          onBack={profileFrom === 'more' ? () => setScreen('more') : undefined}
        />
      )}

      {isTabScreen && <TabBar active={screen} onChange={setScreen} />}
    </div>
  )
}
