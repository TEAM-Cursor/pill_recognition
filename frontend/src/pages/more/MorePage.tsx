import { PersonIcon, MedKitIcon, ChevronRight } from '../../components/icons'

/* 기타 = 메뉴 (내 정보 입력 / 증상별 약 추천) */
export default function MorePage({ onProfile }: { onProfile: () => void }) {
  return (
    <div className="screen screen--scroll">
      <h1 className="page-title">기타</h1>

      <div className="more-list">
        <button className="more-item" onClick={onProfile}>
          <span className="more-icon"><PersonIcon /></span>
          <span>
            <div className="more-title">내 정보 입력</div>
            <div className="more-desc">나이·성별·복용약·알레르기 수정</div>
          </span>
          <span className="more-chev"><ChevronRight /></span>
        </button>

        <button className="more-item">
          <span className="more-icon"><MedKitIcon /></span>
          <span>
            <div className="more-title">증상별 약 추천</div>
            <div className="more-desc">증상을 입력하면 일반의약품을 추천</div>
          </span>
          <span className="more-chev"><ChevronRight /></span>
        </button>
      </div>
    </div>
  )
}
