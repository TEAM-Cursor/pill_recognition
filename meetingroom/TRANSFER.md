# ⚠️ 이 폴더는 "이사용 임시 보관"입니다

이 `meetingroom/` 는 **Yaksok 레포의 일부가 아닙니다.** 별도 프로젝트(**Team-Seuk/MeetingRoom**)인데,
개발 컨테이너의 권한이 `Team-Seuk/Yaksok` 한 곳으로 제한돼 새 레포로 직접 푸시할 수 없어서,
**전송 목적**으로 이 작업 브랜치(`claude/hackathon-collab-platform-w98yze`)에 잠시 얹어둔 것입니다.

> ❌ **이 폴더를 Yaksok `main` 에 merge 하지 마세요.** 협업 규칙상 1프로젝트=1레포(폴리레포)입니다.

## 새 레포로 옮기는 법 (내 컴퓨터에서, 약 1분)

먼저 GitHub 에서 빈 레포 `Team-Seuk/MeetingRoom` 를 만든다(README/gitignore/license 전부 체크 해제).
그 다음:

```bash
# 1) 이 브랜치를 받아서
git clone -b claude/hackathon-collab-platform-w98yze \
  https://github.com/Team-Seuk/Yaksok.git _yaksok_tmp

# 2) meetingroom 폴더만 새 프로젝트로 분리
cd _yaksok_tmp/meetingroom
rm -f TRANSFER.md
git init -b main
git add -A
git commit -m "feat: MeetingRoom 협업 허브 초기 구현"

# 3) 새 레포로 push
git remote add origin https://github.com/Team-Seuk/MeetingRoom.git
git push -u origin main
```

끝나면 `_yaksok_tmp` 폴더는 지워도 됩니다. 그리고 Yaksok 쪽에서 이 임시 폴더를 정리:

```bash
# Yaksok 작업 브랜치에서
git rm -r meetingroom && git commit -m "chore: MeetingRoom 임시 보관 폴더 제거(별도 레포로 이전 완료)"
git push
```

## 실행법 / 설명
프로젝트 자체 사용법은 [README.md](README.md) 참고. 설정 0초 데모 모드 →
`npm install && npm run dev` (http://localhost:5174, 기본 비번 `teamseuk`).
