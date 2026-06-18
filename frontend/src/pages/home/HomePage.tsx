/* 홈 = 카메라 뷰파인더 (프로토타입: 실제 카메라 대신 정적 데모) */
export default function HomePage() {
  return (
    <div className="home">
      <div className="home-stage">
        <div className="viewfinder">
          <div className="spinner" />
        </div>
        <div className="home-caption">알약을 비추면 자동으로 인식돼요</div>
      </div>
    </div>
  )
}
