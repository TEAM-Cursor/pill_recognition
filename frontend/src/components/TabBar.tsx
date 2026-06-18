import { BookIcon, ScanIcon, GridIcon } from './icons'

export type Tab = 'cabinet' | 'home' | 'more'

const TABS: { key: Tab; label: string; Icon: typeof BookIcon }[] = [
  { key: 'cabinet', label: '내 기록', Icon: BookIcon },
  { key: 'home', label: '홈', Icon: ScanIcon },
  { key: 'more', label: '기타', Icon: GridIcon },
]

export default function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="tabbar">
      {TABS.map(({ key, label, Icon }) => (
        <button
          key={key}
          className={`tab${active === key ? ' tab--on' : ''}`}
          onClick={() => onChange(key)}
          aria-current={active === key ? 'page' : undefined}
        >
          <Icon />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
